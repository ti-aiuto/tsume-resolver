const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaGyoku = class KomaGyoku extends Koma {
  label(nari) {
    return banI18n.labelGyoku;
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
      [1, -1],
      [-1, -1],
    ];
  }

  maximumSujiStepLength(nari) {
    return 1;
  }

  maximumDanStepLength(nari) {
    return 1;
  }
};
