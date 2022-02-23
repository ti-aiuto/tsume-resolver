exports.BanSide = class BanSide {
  constructor(id) {
    this.id = id;
  }

  equals(other) {
    return this.id === other.id;
  }

  opposite() {
    if (this.isSente) {
      return BanSide.getInstangeOfGoteSide();
    } else {
      return BanSide.getInstangeOfSenteSide();
    }
  }

  get label() {
    return this.isSente ? '先手' : '後手';
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

  asJson() {
    return {
      label: this.label,
    };
  }

  static get ID_SENTE() {
    return 'SENTE';
  }

  static get ID_GOTE() {
    return 'GOTE';
  }

  static senteInstance = new BanSide(BanSide.ID_SENTE);
  static goteInstance = new BanSide(BanSide.ID_GOTE);

  static getInstangeOfSenteSide() {
    return this.senteInstance;
  }

  static getInstangeOfGoteSide() {
    return this.goteInstance;
  }

  static buildFromJson(json) {
    if (json['label'] === '先手') {
      return this.getInstangeOfSenteSide();
    } else if (json['label'] === '後手') {
      return this.getInstangeOfGoteSide();
    } else {
      throw new Error('不正なlabel');
    }
  }
};
