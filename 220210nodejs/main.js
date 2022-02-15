// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;
const TsumeResolver = require('./tsume-resolver.js').TsumeResolver;
const BanSide = require('./ban-side.js').BanSide;
const BanTe = require('./ban-te.js').BanTe;

function showTsumiResursively(depth, parentBanTe) {
  parentBanTe.nextBanTes
    .filter((nextBanTe) => nextBanTe.isNoUkeAndFutureTsumi || nextBanTe.isTsumi)
    .forEach((nextBanTe) => {
      console.log('  '.repeat(depth) + nextBanTe.tejunToString());
      showTsumiResursively(depth + 1, nextBanTe);
    });
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = new JsonBanLoader().load(json);
  const initialBanTe = new BanTe(null, initialBanSnapshot);
  const enemySide = BanSide.getInstangeOfGoteSide();

  const resolver = new TsumeResolver(initialBanTe, enemySide, 8, false);
  const foundTsumi = resolver.resolve();

  console.log(initialBanTe.toString());

  if (foundTsumi) {
    showTsumiResursively(1, initialBanTe);
  }
}
main();
