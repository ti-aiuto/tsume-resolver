exports.Koma = class Koma {
  label() {
    throw new Error('NotImplemented');
  }

  name() {
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

  maximumDanStepLength(nari) {
    throw new Error('NotImplemented');
  }

  clone() {
    throw new Error('NotImplemented');
  }

  equals(other) {
    return this.label === other.label;
  }
};
