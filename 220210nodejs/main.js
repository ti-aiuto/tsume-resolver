// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const KomaFu = require('./koma-fu.js').KomaFu;

const BanSide = require('./ban-side.js').BanSide;
const BanTe = require('./ban-te.js').BanTe;
const TsumeResolver = require('./tsume-resolver.js').TsumeResolver;

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;

function extractTsumiTejunAsArray(result, currentPath, parentBanTe) {
  if (parentBanTe.isTsumi) {
    result.push(currentPath);
  }
  for (let banTe of parentBanTe.nextBanTes) {
    if (!parentBanTe.isNoUkeAndFutureTsumi) {
      continue;
    }
    extractTsumiTejunAsArray(
      result,
      [...currentPath, banTe],
      banTe,
    );
  }
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = new JsonBanLoader().load(json);
  const initialBanTe = new BanTe(null, initialBanSnapshot);
  const enemySide = BanSide.getInstangeOfGoteSide();

  const start = new Date();

  const resolver = new TsumeResolver(initialBanTe, enemySide, 10);

  resolver.resolve();

  const end = new Date();
  console.log(end - start);

  const rawTsumiTejuns = [];
  extractTsumiTejunAsArray(rawTsumiTejuns, [], initialBanTe);

  console.log(`総手順：${rawTsumiTejuns.length}`);

  const tsumiTejuns = rawTsumiTejuns.filter((tsumiTejun) => {
    const lastTe = tsumiTejun[tsumiTejun.length - 1];
    // 歩打ちで詰みは禁止
    return !(!lastTe.beforeBanKoma && lastTe.banKoma.koma instanceof KomaFu);
  });
  console.log(`歩で詰みを除く：${tsumiTejuns.length}`);

  tsumiTejuns.sort(function (a, b) {
    return Math.sign(a.length - b.length);
  });

  // console.log('最良手数の場合：');

  console.log(initialBanSnapshot.toString());
  const tejunBest = tsumiTejuns[0];
  tejunBest.forEach((banTe) => {
    // console.log(banTe.toString());
  });

  // console.log('最悪手数（再帰制約内）の場合：');
  // console.log(initialBanSnapshot.toString());
  const tejunWorst = tsumiTejuns[tsumiTejuns.length - 1];
  tejunWorst.forEach((banTe) => {
    // console.log(banTe.toString());
  });
}
main();
