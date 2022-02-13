const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaKyo = class KomaKyo extends Koma {
  label(nari) {
    if (nari) {
      return banI18n.labelNariKyo;
    } else {
      return banI18n.labelKyo;
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
      return [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [0, 7],
        [0, 8],
      ];
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
    if (nari) {
      return 1;
    } else {
      return 8;
    }
  }
};
