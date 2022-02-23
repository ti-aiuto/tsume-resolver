const KomaFu = require('./koma-fu.js').KomaFu;
const KomaKyo = require('./koma-kyo.js').KomaKyo;
const KomaKei = require('./koma-kei.js').KomaKei;
const KomaKaku = require('./koma-kaku.js').KomaKaku;
const KomaHisha = require('./koma-hisha.js').KomaHisha;
const KomaKin = require('./koma-kin.js').KomaKin;
const KomaGin = require('./koma-gin.js').KomaGin;
const KomaGyoku = require('./koma-gyoku.js').KomaGyoku;

exports.KomaFactory = class KomaFactory {
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

  static instance = new KomaFactory();
  static getInstance() {
    return this.instance;
  }
};
