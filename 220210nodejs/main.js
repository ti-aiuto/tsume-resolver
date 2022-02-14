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

const JsonBanLoader = require('./json-ban-loader.js').JsonBanLoader;

function nextOte(parentBanTe, tumasareSide) {
  parentBanTe.addBanTe(
    ...parentBanTe.findNextMovingOtesOf(tumasareSide),
  );
  parentBanTe.addBanTe(
    ...parentBanTe.findNextPuttingOtesOf(tumasareSide),
  );
  // TODO: 開き王手を考慮する

  if (parentBanTe.nextBanTes.length) {
    return true;
  } else {
    return false;
  }
}

function nextSurvival(parentBanTe, tumasareSide) {
  parentBanTe.addBanTe(
    ...parentBanTe.findNextOteEscaping(tumasareSide),
  );
  parentBanTe.addBanTe(
    ...parentBanTe.findNextOteRemoving(tumasareSide),
  );
  parentBanTe.addBanTe(
    ...parentBanTe.findNextOteAigoma(tumasareSide),
  );

  if (parentBanTe.nextBanTes.length) {
    parentBanTe.markAsNotTsumi();
    return true;
  } else {
    parentBanTe.markAsTsumi();
    return false;
  }
}

const DEPTH_LIMIT = 10;

function oteRecursively(depth, parentBanTe, tumasareSide) {
  if (depth > DEPTH_LIMIT) {
    // console.log("階層が深いため中止");
    throw new Error('再帰上限');
  }
  if (nextOte(parentBanTe, tumasareSide)) {
    // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
    let oteSuccess = false;
    for (let banTe of parentBanTe.nextBanTes) {
      try {
        if (
          surviveRecursively(
            depth + 1,
            banTe,
            tumasareSide,
          ) === false
        ) {
          // 一つでも逃げられない手があればそのKyokumenが完全に詰みとする
          parentBanTe.markAsNoUkeAndFutureTsumi();
          oteSuccess = true;
          // return true;
        }
      } catch (e) {
        if (e.message === '再帰上限') {
          return false;
        } else {
          throw e;
        }
      }
    }
    if (oteSuccess) {
      // 全王手を見たいから
      return true;
    }
    parentBanTe.markAsOneOfThemNoOte();
    return false;
  } else {
    // 逃げられた
    return false;
  }
}

function surviveRecursively(depth, parentBanTe, tumasareSide) {
  if (nextSurvival(parentBanTe, tumasareSide)) {
    // 逃げられた場合、各差し手について王手を探す
    for (let banTe of parentBanTe.nextBanTes) {
      if (
        oteRecursively(
          depth + 1,
          banTe,
          tumasareSide,
        ) === false
      ) {
        // 一つでも逃げられた手があったらそのKyokumenは詰め失敗とする
        parentBanTe.markAsOneOfThemNoOte();
        return true;
      }
    }
    parentBanTe.markAsNoUkeAndFutureTsumi();
    return false;
  } else {
    // 詰み
    return false;
  }
}

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

  console.log('探索を開始');
  console.log(`再帰上限：${DEPTH_LIMIT}`);
  oteRecursively(1, initialBanTe, enemySide);
  console.log('探索完了');

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
