const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaKei = class KomaKei extends Koma {
  label(nari) {
    if (nari) {
      return banI18n.labelNariKei;
    } else {
      return banI18n.labelKei;
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
        [1, 2],
        [-1, 2],
      ];
    }
  }
};
