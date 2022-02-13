exports.BanKyokumen = class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    // TODO: ここの状態は後で整理する
    this.isOte = null;
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.completeTsumiIndex = null;
    this.isNoUkeAndFutureTsumi = null;
  }

  addBanTe(...banTes) {
    this.banTes.push(...banTes);
  }

  markAsOte() {
    this.isOte = true;
  }

  markAsNoOte() {
    this.isOte = false;
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

  markAsOneOfThemCompleteTsumi(index) {
    this.completeTsumiIndex = index;
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
