async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function main() {
  const body = await readFileAsJson(sample_filename);
  console.log(body);

  // 作戦
  // banに状態を全て読み込む
  // banに対して「王手」となる操作を行う
  //   制約：その操作が王手であること、反則でないこと、
  // 王手が続いて最後に「詰み」となった場合、その「操作」の一覧を返却する
  //   「王手」が続かない場合はそれ以上探索しない  
}
main();
