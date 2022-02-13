const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaFu = class KomaFu extends Koma {
  label(nari) {
    if (nari) {
      return banI18n.labelTokin;
    } else {
      return banI18n.labelFu;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    if (nari) {
      return [
        [0, 1],
        [-1, 1],
        [1, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
    } else {
      return [[0, 1]];
    }
  }

  maximumSujiStepLength(nari) {
    if (nari) {
      return 1;
    } else {
      return 0;
    }
  }

  maximumDanStepLength(nari) {
    return 1;
  }
};
