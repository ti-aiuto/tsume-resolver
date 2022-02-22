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
