// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;
const TsumeResolver = require('./tsume-resolver.js').TsumeResolver;
const BanSide = require('./ban-side.js').BanSide;
const BanTe = require('./ban-te.js').BanTe;

function showTsumiResursively(depth, parentBanTe, specifiedTejuns) {
  const nextBanTes = parentBanTe.nextBanTes
    .filter((nextBanTe) => nextBanTe.isNoUkeAndFutureTsumi || nextBanTe.isTsumi)
    .filter((nextBanTe) => {
      const specifiedTe = specifiedTejuns[depth - 1];
      return !specifiedTe || specifiedTe === nextBanTe.banKoma.label().trim();
    });

  // min優先、同じ値ならmaxで比較
  const minTsumiDepthScore = Math.min(...nextBanTes.map((banTe) => banTe.depthScore()));
  const maxTsumiDepthScore = Math.max(...nextBanTes.map((banTe) => banTe.depthScore()));

  let optimizedNextBanTes;
  if (depth % 2 === 0) {
    // 受け側なので長引くほう
    optimizedNextBanTes = nextBanTes.filter(
      (banTe) => banTe.depthScore() === maxTsumiDepthScore,
    );
  } else {
    // 攻め側なので早く片付くほう
    optimizedNextBanTes = [
      nextBanTes.find((banTe) => banTe.depthScore() === minTsumiDepthScore),
    ];
  }

  optimizedNextBanTes.forEach((nextBanTe) => {
    console.log(`B:${nextBanTe.minTsumiDepth} W:${nextBanTe.maxTsumiDepth} ${'  '.repeat(depth)}${nextBanTe.tejunToString()}`);
    if (!nextBanTe.isTsumi) {
      showTsumiResursively(depth + 1, nextBanTe, specifiedTejuns);
    }
  });
}

async function main() {
  const json = await readFileAsJson(process.argv[2]);
  const enemySide = BanSide.getInstangeOfGoteSide();
  const initialBanSnapshot = new JsonBanLoader().load(json);

  console.log('読み込み完了');
  console.log(initialBanSnapshot.toString());

  let initialBanTe;
  let depthLimit = 2;

  // 成功するまで上限を上げながら繰り返す
  while (true) {
    initialBanTe = new BanTe(null, initialBanSnapshot);
    const resolver = new TsumeResolver(
      initialBanTe,
      enemySide,
      depthLimit,
      true,
    );
    const foundTsumi = resolver.resolve();
    if (foundTsumi) {
      break;
    }
    depthLimit += 2;
  }

  console.log(initialBanTe.toString());
  console.log('手順');
  showTsumiResursively(1, initialBanTe, []);
}
main();
