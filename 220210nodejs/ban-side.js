exports.BanSide = class BanSide {
  constructor(id) {
    this.id = id;
  }

  equals(other) {
    return this.id === other.id;
  }

  opposite() {
    if (this.isSente) {
      return BanSide.createGoteSide();
    } else {
      return BanSide.createSenteSide();
    }
  }

  get label() {
    return this.shortLabel;
  }

  get shortLabel() {
    if (this.isSente) {
      return '@';
    } else {
      return 'o';
    }
  }

  get isSente() {
    return this.id === BanSide.ID_SENTE;
  }

  get isGote() {
    return !this.isSente;
  }

  static get ID_SENTE() {
    return 'SENTE';
  }

  static get ID_GOTE() {
    return 'GOTE';
  }

  static createSenteSide() {
    return new BanSide(BanSide.ID_SENTE);
  }

  static createGoteSide() {
    return new BanSide(BanSide.ID_GOTE);
  }
};
