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

class JsonBanLoader {
  decode(json) {
    const banSnapshot = new BanSnapshot();

    const sente = BanSide.getInstangeOfSenteSide();
    const gote = BanSide.getInstangeOfGoteSide();

    json['initial_koma']['on_board']['sente'].forEach((koma) => {
      banSnapshot.initPutOnBoard(
        new BanPoint(koma['suji'], koma['dan']),
        this.createKoma(koma['name']),
        sente,
        koma['nari'],
      );
    });

    json['initial_koma']['on_board']['gote'].forEach((koma) => {
      banSnapshot.initPutOnBoard(
        new BanPoint(koma['suji'], koma['dan']),
        this.createKoma(koma['name']),
        gote,
        koma['nari'],
      );
    });

    json['initial_koma']['captured']['sente'].forEach((koma) =>
      banSnapshot.initAddCaptured(this.createKoma(koma['name']), sente),
    );

    json['initial_koma']['captured']['gote'].forEach((koma) =>
      banSnapshot.initAddCaptured(this.createKoma(koma['name']), gote),
    );

    return banSnapshot;
  }

  encode(banSnapshot) {
    const json = {};
    const sente = BanSide.getInstangeOfSenteSide();
    const gote = BanSide.getInstangeOfGoteSide();

    json['initial_koma'] = {
      on_board: { sente: [], gote: [] },
      captured: { sente: [], gote: [] },
    };
    banSnapshot.findOnBoardBanKomasBySide(sente).forEach((banKoma) => {
      json['initial_koma']['on_board']['sente'].push({
        suji: banKoma.banPoint.suji,
        dan: banKoma.banPoint.dan,
        nari: banKoma.nari,
        name: this.komaName(banKoma.koma),
      });
    });
    banSnapshot.findOnBoardBanKomasBySide(gote).forEach((banKoma) => {
      json['initial_koma']['on_board']['gote'].push({
        suji: banKoma.banPoint.suji,
        dan: banKoma.banPoint.dan,
        nari: banKoma.nari,
        name: this.komaName(banKoma.koma),
      });
    });

    banSnapshot.findCapturedBanKomasBySide(sente).forEach((banKoma) => {
      json['initial_koma']['captured']['sente'].push({
        name: this.komaName(banKoma.koma),
      });
    });
    banSnapshot.findCapturedBanKomasBySide(gote).forEach((banKoma) => {
      json['initial_koma']['captured']['gote'].push({
        name: this.komaName(banKoma.koma),
      });
    });

    return json;
  }

  komaName(koma) {
    if (koma instanceof KomaFu) {
      return '歩';
    } else if (koma instanceof KomaKyo) {
      return '香';
    } else if (koma instanceof KomaKei) {
      return '桂';
    } else if (koma instanceof KomaKaku) {
      return '角';
    } else if (koma instanceof KomaHisha) {
      return '飛';
    } else if (koma instanceof KomaKin) {
      return '金';
    } else if (koma instanceof KomaGin) {
      return '銀';
    } else if (koma instanceof KomaGyoku) {
      return '玉';
    } else {
      throw new Error('未定義の駒');
    }
  }

  createKoma(name, nari) {
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
}
exports.JsonBanLoader = JsonBanLoader;
