const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaKin = class KomaKin extends Koma {
  label(nari) {
    return banI18n.labelKin;
  }

  get canBeNari() {
    return false;
  }

  possibleStepVectors(nari) {
    return [
      [0, 1],
      [-1, 1],
      [1, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
  }

  maximumSujiStepLength() {
    return 1;
  }

  maximumDanStepLength() {
    return 1;
  }
};
