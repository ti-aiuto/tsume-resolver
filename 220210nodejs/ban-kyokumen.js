exports.BanKyokumen = class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    this.isNoOte = null;
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.isOneOfThemCompleteTsumi = null;
  }

  addBanTe(...banTes) {
    this.banTes.push(...banTes);
  }

  markAsNoOte() {
    this.isNoOte = true;
  }

  markAsTsumi() {
    this.isTsumi = true;
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
};
