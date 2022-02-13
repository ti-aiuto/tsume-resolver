// 220210の目標：いったんテストコード無しで動くロジックを書いてみる

// TODO: コマンドライン引数でとる
const sample_filename = '../sample/horoki1.json';

async function readFileAsJson(filename) {
  const fs = require('fs').promises;
  const body = await fs.readFile(filename, 'utf-8');
  return JSON.parse(body);
}

const KomaFu = require('./koma-fu.js').KomaFu;
const KomaKyo = require('./koma-kyo.js').KomaKyo;
const KomaKei = require('./koma-kei.js').KomaKei;
const KomaKaku = require('./koma-kaku.js').KomaKaku;
const KomaHisha = require('./koma-hisha.js').KomaHisha;
const KomaKin = require('./koma-kin.js').KomaKin;
const KomaGin = require('./koma-gin.js').KomaGin;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;

const BanPoint = require('./ban-point.js').BanPoint;
const BanSide = require('./ban-side.js').BanSide;
const BanSnapshot = require('./ban-snapshot.js').BanSnapshot;
const TeResolver = require('./te-resolver.js').TeResolver;
const BanKyokumen = require('./ban-kyokumen.js').BanKyokumen;

function createKoma(name, nari) {
  if (name === '歩') {
    return new KomaFu(nari);
  } else if (name === '香') {
    return new KomaKyo(nari);
  } else if (name === '桂') {
    return new KomaKei(nari);
  } else if (name === '角') {
    return new KomaKaku(nari);
  } else if (name === '飛') {
    return new KomaHisha(nari);
  } else if (name === '金') {
    return new KomaKin(nari);
  } else if (name === '銀') {
    return new KomaGin(nari);
  } else if (name === '玉') {
    return new KomaGyoku(nari);
  } else {
    throw new Error(`${name}は未定義`);
  }
}

function loadBanSnapshot(json) {
  const banSnapshot = new BanSnapshot();

  const sente = BanSide.createSenteSide();
  const gote = BanSide.createGoteSide();

  json['initial_koma']['on_board']['sente'].forEach((koma) => {
    banSnapshot.initPutOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
      createKoma(koma['name']),
      sente,
      koma['nari'],
    );
  });

  json['initial_koma']['on_board']['gote'].forEach((koma) => {
    banSnapshot.initPutOnBoard(
      new BanPoint(koma['suji'], koma['dan']),
      createKoma(koma['name']),
      gote,
      koma['nari'],
    );
  });

  json['initial_koma']['captured']['sente'].forEach((koma) =>
    banSnapshot.initAddCaptured(createKoma(koma['name']), sente),
  );

  json['initial_koma']['captured']['gote'].forEach((koma) =>
    banSnapshot.initAddCaptured(createKoma(koma['name']), gote),
  );

  return banSnapshot;
}

function nextOte(teResolver, banKyokumen, enemySide) {
  const banSnapshot = banKyokumen.banSnapshot;
  const mySide = enemySide.opposite();
  const enemyGyoku = banSnapshot.findGyokuBySide(enemySide);

  const myOnBoardBanKomas = banSnapshot.findOnBoardBanKomasBySide(mySide);
  // 自分が王手になっていないことのチェックも入れたほうがよさそう
  myOnBoardBanKomas
    .filter((banKoma) => banKoma.koma instanceof KomaGyoku)
    .forEach((myOnBoardBanKoma) => {
      const nextBanTes = teResolver.findNextMovingOtesOf(
        banSnapshot,
        enemyGyoku,
        myOnBoardBanKoma,
      );

      nextBanTes.forEach((banTe) => {
        banKyokumen.addBanTe(banTe);
      });
    });

  const myCapturedBanKomas =
    banSnapshot.findDistictCapturedBanKomasBySide(mySide);
  myCapturedBanKomas.forEach((myOnBoardBanKoma) => {
    const nextBanTes = teResolver.findNextPuttingOtesOf(
      banSnapshot,
      enemyGyoku,
      myOnBoardBanKoma,
    );

    nextBanTes.forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });
  });

  if (banKyokumen.banTes.length) {
    return true;
  } else {
    banKyokumen.markAsNoOte();
    return false;
  }
}

function nextSurvival(teResolver, banKyokumen, enemySide) {
  const banSnapshot = banKyokumen.banSnapshot;
  const enemyGyoku = banSnapshot.findGyokuBySide(enemySide);

  teResolver
    .findNextOteEscaping(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  teResolver
    .findNextOteRemoving(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  teResolver
    .findNextOteAigoma(banKyokumen.banSnapshot, enemyGyoku)
    .forEach((banTe) => {
      banKyokumen.addBanTe(banTe);
    });

  if (banKyokumen.banTes.length) {
    return true;
  } else {
    banKyokumen.markAsTsumi();
    return false;
  }
}

const DEPTH_LIMIT = 15;

function oteRecursively(depth, teResolver, banKyokumen, enemySide) {
  if (depth > DEPTH_LIMIT) {
    // console.log("階層が深いため中止");
    return;
  }
  if (nextOte(teResolver, banKyokumen, enemySide)) {
    // 次の階層
    for (let banTe of banKyokumen.banTes) {
      surviveRecursively(depth + 1, teResolver, banTe.banKyokumen, enemySide);
    }
  } else {
    // 逃げられた
  }
}

function surviveRecursively(depth, teResolver, banKyokumen, enemySide) {
  if (nextSurvival(teResolver, banKyokumen, enemySide)) {
    // 次の階層
    for (let banTe of banKyokumen.banTes) {
      oteRecursively(depth + 1, teResolver, banTe.banKyokumen, enemySide);
    }
  } else {
    // 詰み
  }
}

function extractTsumiTejunAsArray(result, currentPath, banKyokumen) {
  if (banKyokumen.isNoOte) {
    return; // 逃げられた
  }
  if (banKyokumen.isTsumi) {
    result.push(currentPath);
  }
  for (let banTe of banKyokumen.banTes) {
    extractTsumiTejunAsArray(
      result,
      [...currentPath, banTe],
      banTe.banKyokumen,
    );
  }
}

async function main() {
  const json = await readFileAsJson(sample_filename);
  const initialBanSnapshot = loadBanSnapshot(json);
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
