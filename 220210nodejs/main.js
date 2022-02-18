// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;
const TsumeResolver = require('./tsume-resolver.js').TsumeResolver;
const TsumeResolverNode = require('./tsume-resolver-node.js').TsumeResolverNode;
const BanSide = require('./ban-side.js').BanSide;
const BanTe = require('./ban-te.js').BanTe;

function showTsumiResursively(
  depth,
  headNode,
  specifiedTejuns,
  enableEscapingEffort,
) {
  const nextNodes = headNode.childNodes
    .filter((nextNode) => nextNode.isNoUkeAndFutureTsumi || nextNode.isTsumi)
    .filter((nextNode) => {
      const specifiedTe = specifiedTejuns[depth - 1];
      return !specifiedTe || specifiedTe === nextNode.banTe.banKoma.label().trim();
    });

  const minTsumiDepthScore = Math.min(
    ...nextNodes.map((banTe) => banTe.depthScore()),
  );
  const maxTsumiDepthScore = Math.max(
    ...nextNodes.map((banTe) => banTe.depthScore()),
  );

  let optimizedNextNodes = [];
  if (depth % 2 === 0 && enableEscapingEffort) {
    // 受け側なので長引くほう
    optimizedNextNodes = nextNodes.filter(
      (banTe) => banTe.depthScore() === maxTsumiDepthScore,
    );
  } else {
    // 攻め側なので早く片付くほう
    optimizedNextNodes = [
      nextNodes.find((banTe) => banTe.depthScore() === minTsumiDepthScore),
    ];
  }

  optimizedNextNodes.forEach((nextNode) => {
    console.log(
      `B:${nextNode.minTsumiDepth} W:${nextNode.maxTsumiDepth} | ${'  '.repeat(
        depth - 1,
      )}${nextNode.banTe.tejunToString()}`,
    );
    if (!nextNode.isTsumi) {
      showTsumiResursively(
        depth + 1,
        nextNode,
        specifiedTejuns,
        enableEscapingEffort,
      );
    }
  });
}

async function main() {
  const json = await readFileAsJson(process.argv[2]);
  const enemySide = BanSide.getInstangeOfGoteSide();
  const initialBanSnapshot = new JsonBanLoader().load(json);
  const initialBanTe = new BanTe(null, initialBanSnapshot);

  console.log('読み込み完了');
  console.log(initialBanSnapshot.toString());

  let depthLimit = 2;
  let headNode;

  // 成功するまで上限を上げながら繰り返す
  while (true) {
    headNode = new TsumeResolverNode(initialBanTe);
    const resolver = new TsumeResolver(
      headNode,
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
  console.log('最良手順');
  showTsumiResursively(1, headNode, [], false);

  console.log('逃げ優先手順');
  showTsumiResursively(1, headNode, [], true);
}
main();
