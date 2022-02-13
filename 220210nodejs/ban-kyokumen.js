exports.BanKyokumen = class BanKyokumen {
  constructor(banSnapshot) {
    this.banSnapshot = banSnapshot;
    this.banTes = [];
    this.isNoOte = false;
    this.isTsumi = false;
  }

  addBanTe(banTe) {
    this.banTes.push(banTe);
  }

  markAsNoOte() {
    this.isNoOte = true;
  }

  markAsTsumi() {
    this.isTsumi = true;
  }

  get isToContinue() {
    return !this.isNoOte && !this.isTsumi;
  }
};
