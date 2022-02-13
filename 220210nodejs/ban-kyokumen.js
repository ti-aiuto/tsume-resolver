exports.BanKyokumen = class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    this.isOte = null;
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.isOneOfThemCompleteTsumi = null;
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

  markAsOneOfThemCompleteTsumi() {
    this.isOneOfThemCompleteTsumi = true;
  }

  get isToContinue() {
    return !this.isNoOte && !this.isTsumi;
  }

  toString() {
    return `isNoOte: ${this.isNoOte} isTsumi: ${this.isTsumi}, isOneOfThemNoOte: ${this.isOneOfThemNoOte}, isOneOfThemCompleteTsumi: ${this.isOneOfThemCompleteTsumi}`;
  }
};
