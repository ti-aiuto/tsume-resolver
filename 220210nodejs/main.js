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
  parentBanTe.nextBanTes
    .filter((nextBanTe) => nextBanTe.isNoUkeAndFutureTsumi || nextBanTe.isTsumi)
    .filter((nextBanTe) => {
      const specifiedTe = specifiedTejuns[depth - 1];
      return !specifiedTe || specifiedTe === nextBanTe.banKoma.label().trim();
    })
    .forEach((nextBanTe) => {
      console.log('  '.repeat(depth) + nextBanTe.tejunToString());
      showTsumiResursively(depth + 1, nextBanTe, specifiedTejuns);
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
