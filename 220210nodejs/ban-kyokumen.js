exports.BanKyokumen = class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.isNoUkeAndFutureTsumi = null;
  }

  addBanTe(...banTes) {
    this.banTes.push(...banTes);
  }

  markAsTsumi() {
    this.isTsumi = true;
  }

  markAsNotTsumi() {
    this.isTsumi = false;
  }

  markAsOneOfThemNoOte() {
    this.isOneOfThemNoOte = true;
  }

  markAsNoUkeAndFutureTsumi() {
    this.isNoUkeAndFutureTsumi = true;
  }

  get isToContinue() {
    return !this.isNoOte && !this.isTsumi;
  }

  toString() {
    return `isOte: ${this.isOte} isTsumi: ${this.isTsumi}, isOneOfThemNoOte: ${this.isOneOfThemNoOte}, isNoUkeAndFutureTsumi: ${this.isNoUkeAndFutureTsumi}, completeTsumiIndex: ${this.completeTsumiIndex}`;
  }
};
