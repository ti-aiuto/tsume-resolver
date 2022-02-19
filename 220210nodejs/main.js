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

function showTsumiResursively(depth, headNode, specifiedTejuns) {
  const nextNodes = headNode.childNodes
    .filter((nextNode) => nextNode.isNoUkeAndFutureTsumi || nextNode.isTsumi)
    .filter((nextNode) => {
      const specifiedTe = specifiedTejuns[depth - 1];
      return (
        !specifiedTe || specifiedTe === nextNode.banTe.banKoma.label().trim()
      );
    });
  nextNodes.sort((item1, item2) =>
    Math.sign(item1.depthScore() - item2.depthScore()),
  );

  let optimizedNextNodes = nextNodes;
  if (depth % 2 === 1) {
    // 攻め側は最短の一つのみ
    optimizedNextNodes = [nextNodes[0]];
  }
  const minTsumiDepthScore = Math.min(
    ...nextNodes.map((banTe) => banTe.depthScore()),
  );
  const maxTsumiDepthScore = Math.max(
    ...nextNodes.map((banTe) => banTe.depthScore()),
  );

  optimizedNextNodes.forEach((nextNode) => {
    if (depth % 2 === 0) {
      if (nextNode.depthScore() === minTsumiDepthScore) {
        process.stdout.write("\x1b[32m");
      } else if (nextNode.depthScore() === maxTsumiDepthScore) {
        process.stdout.write("\x1b[31m");
      }
    }

    console.log(
      `B:${nextNode.minTsumiDepth} W:${nextNode.maxTsumiDepth} | ${'  '.repeat(
        depth - 1,
      )}${nextNode.banTe.tejunToString()}${depth % 2 === 0 ? ' の場合' : ''}${
        nextNode.isTsumi ? ' で詰み' : ''
      }`,
    );
    process.stdout.write("\x1b[0m");

    if (!nextNode.isTsumi) {
      showTsumiResursively(depth + 1, nextNode, specifiedTejuns);
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
    const resolver = new TsumeResolver(headNode, enemySide, depthLimit, true);
    const foundTsumi = resolver.resolve();
    if (foundTsumi) {
      break;
    }
    depthLimit += 2;
  }

  console.log(initialBanTe.toString());
  console.log('手順');
  showTsumiResursively(1, headNode, []);
}
main();
