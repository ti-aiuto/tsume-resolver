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
const TsumeTejun = require('./tsume-tejun.js').TsumeTejun;

async function main() {
  const json = await readFileAsJson(process.argv[2]);
  const enemySide = BanSide.getInstangeOfGoteSide();
  const initialBanSnapshot = new JsonBanLoader().decode(json);
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

  const tejun = TsumeTejun.buildFromTsumeResolverNode(headNode);
  tejun.tsumeTes.forEach((tsumeTe) => {
    if (tsumeTe.banTe.banKoma.side.equals(enemySide)) {
      if (tsumeTe.rank === 'best') {
        process.stdout.write('\x1b[32m');
      } else if (tsumeTe.rank === 'worst') {
        process.stdout.write('\x1b[31m');
      }
    }

    process.stdout.write(
      `${'  '.repeat(tsumeTe.depth - 1)}[B${tsumeTe.minTsumiDepth}W${
        tsumeTe.maxTsumiDepth
      }]`,
    );
    process.stdout.write('\x1b[0m');

    process.stdout.write('  ');
    console.log(
      `${tsumeTe.banTe.tejunToString()}${tsumeTe.depth % 2 === 0 ? ' の場合' : ''}${
        tsumeTe.isTsumi ? ' で詰み' : ''
      }`,
    );
  });
}
main();
