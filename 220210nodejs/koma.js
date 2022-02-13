exports.Koma = class Koma {
  label() {
    throw new Error('NotImplemented');
  }

  get canBeNari() {
    throw new Error('NotImplemented');
  }

  possibleStepVectors() {
    throw new Error('NotImplemented');
  }

  maximumSujiStepLength(nari) {
    throw new Error('NotImplemented');
  }

  maximumDanStepLength() {
    throw new Error('NotImplemented');
  }

  clone() {
    throw new Error('NotImplemented');
  }

  equals(other) {
    return this.label === other.label;
  }
};
