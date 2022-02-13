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
};

class KomaGin extends Koma {
  label(nari) {
    if (nari) {
      return banI18n.labelNariGin;
    } else {
      return banI18n.labelGin;
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
        [-1, 1],
        [1, 1],
        [1, -1],
        [-1, -1],
      ];
    }
  }
}
