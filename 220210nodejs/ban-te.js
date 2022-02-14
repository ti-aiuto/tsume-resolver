exports.BanTe = class BanTe {
  constructor(banKoma, banSnapshot, beforeBanKoma) {
    this.banKoma = banKoma;
    this.beforeBanKoma = beforeBanKoma;
    this.nextBanTes = [];
    this.banSnapshot = banSnapshot;
    this.isTsumi = null;
    this.isOneOfThemNoOte = null;
    this.isNoUkeAndFutureTsumi = null;
  }

  addBanTe(...banTes) {
    this.nextBanTes.push(...banTes);
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

  toString() {
    let result = '';
    if (this.beforeBanKoma) {
      result += `${this.banKoma.toString()}\n`;
    } else {
      result += `${this.banKoma.toString()} 打ち\n`;
    }
    result += this.banSnapshot.toString();
    return result;
  }
};
