const Koma = require('./koma.js').Koma;
const banI18n = require('./ban-i18n.js').banI18n;

exports.KomaKaku = class KomaKaku extends Koma {
  label(nari) {
    if (nari) {
      return banI18n.labelUma;
    } else {
      return banI18n.labelKaku;
    }
  }

  get canBeNari() {
    return true;
  }

  possibleStepVectors(nari) {
    const steps = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [6, 6],
      [7, 7],
      [8, 8],
      [1, -1],
      [2, -2],
      [3, -3],
      [4, -4],
      [5, -5],
      [6, -6],
      [7, -7],
      [8, -8],
      [-1, 1],
      [-2, 2],
      [-3, 3],
      [-4, 4],
      [-5, 5],
      [-6, 6],
      [-7, 7],
      [-8, 8],
      [-1, -1],
      [-2, -2],
      [-3, -3],
      [-4, -4],
      [-5, -5],
      [-6, -6],
      [-7, -7],
      [-8, -8],
    ];
    if (nari) {
      return [...steps, [0, 1], [0, -1], [-1, 0], [1, 0]];
    } else {
      return steps;
    }
  }
  
  maximumSujiStepLength(nari) {
    return 8;
  }

  maximumDanStepLength(nari) {
    return 8;
  }
};
