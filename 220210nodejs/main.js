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
const TeResolver = require('./te-resolver.js').TeResolver;
const BanKyokumen = require('./ban-kyokumen.js').BanKyokumen;

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;

function nextOte(teResolver, banKyokumen, tumasareSide) {
  const banSnapshot = banKyokumen.banSnapshot;

  banKyokumen.addBanTe(
    ...teResolver.findNextMovingOtesOf(banSnapshot, tumasareSide),
  );
  banKyokumen.addBanTe(
    ...teResolver.findNextPuttingOtesOf(banSnapshot, tumasareSide),
  );
  // TODO: 開き王手を考慮する

  if (banKyokumen.banTes.length) {
    banKyokumen.markAsOte();
    return true;
  } else {
    banKyokumen.markAsNoOte();
    return false;
  }
}

function nextSurvival(teResolver, banKyokumen, tumasareSide) {
  banKyokumen.addBanTe(
    ...teResolver.findNextOteEscaping(banKyokumen.banSnapshot, tumasareSide),
  );
  banKyokumen.addBanTe(
    ...teResolver.findNextOteRemoving(banKyokumen.banSnapshot, tumasareSide),
  );
  banKyokumen.addBanTe(
    ...teResolver.findNextOteAigoma(banKyokumen.banSnapshot, tumasareSide),
  );

  if (banKyokumen.banTes.length) {
    banKyokumen.markAsNotTsumi();
    return true;
  } else {
    banKyokumen.markAsTsumi();
    return false;
  }
}

const DEPTH_LIMIT = 10;

function oteRecursively(depth, teResolver, banKyokumen, tumasareSide) {
  if (depth > DEPTH_LIMIT) {
    // console.log("階層が深いため中止");
    throw new Error("再帰上限");
  }
  if (nextOte(teResolver, banKyokumen, tumasareSide)) {
    // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
    let index = 0;
    for (let banTe of banKyokumen.banTes) {
      try {
        if (
          surviveRecursively(
            depth + 1,
            teResolver,
            banTe.banKyokumen,
            tumasareSide,
          ) === false
        ) {
          // 一つでも逃げられない手があればそのKyokumenが完全に詰みとする
          banKyokumen.markAsNoUkeAndFutureTsumi();
          banKyokumen.markAsOneOfThemCompleteTsumi(index);
          return true;
        }  
      } catch (e) {
        if (e.message === "再帰上限") {
          return false;
        } else {
          throw e;
        } 
      }
      index ++;
    }
    banKyokumen.markAsOneOfThemNoOte();
    return false;
  } else {
    // 逃げられた
    return false;
  }
}

function surviveRecursively(depth, teResolver, banKyokumen, tumasareSide) {
  if (nextSurvival(teResolver, banKyokumen, tumasareSide)) {
    // 逃げられた場合、各差し手について王手を探す
    for (let banTe of banKyokumen.banTes) {
      if (
        oteRecursively(depth + 1, teResolver, banTe.banKyokumen, tumasareSide) === false
      ) {
        // 一つでも逃げられた手があったらそのKyokumenは詰め失敗とする
        banKyokumen.markAsOneOfThemNoOte();
        return true;
      }
    }
    banKyokumen.markAsNoUkeAndFutureTsumi();
    return false;
  } else {
    // 詰み
    return false;
  }
}

function extractTsumiTejunAsArray(result, currentPath, banKyokumen) {
  if (banKyokumen.isTsumi) {
    result.push(currentPath);
  }
  for (let banTe of banKyokumen.banTes) {
    if (!banKyokumen.isNoUkeAndFutureTsumi) {
      continue;
    }
    extractTsumiTejunAsArray(
      result,
      [...currentPath, banTe],
      banTe.banKyokumen,
    );
  }
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = new JsonBanLoader().load(json);
  const initialBanKyokumen = new BanKyokumen(initialBanSnapshot);

  const enemySide = BanSide.createGoteSide();
  const teResolver = new TeResolver();

  console.log('探索を開始');
  console.log(`再帰上限：${DEPTH_LIMIT}`);
  oteRecursively(1, teResolver, initialBanKyokumen, enemySide);
  console.log('探索完了');

  const rawTsumiTejuns = [];
  extractTsumiTejunAsArray(rawTsumiTejuns, [], initialBanKyokumen);

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

  console.log('最良手数の場合：');

  console.log(initialBanSnapshot.toString());
  const tejunBest = tsumiTejuns[0];
  tejunBest.forEach((banTe) => {
    console.log(banTe.toString());
  });

  console.log('最悪手数（再帰制約内）の場合：');
  console.log(initialBanSnapshot.toString());
  const tejunWorst = tsumiTejuns[tsumiTejuns.length - 1];
  tejunWorst.forEach((banTe) => {
    console.log(banTe.toString());
  });
}
main();
