exports.BanTe = class BanTe {
  constructor(banKoma, banKyokumen, beforeBanKoma) {
    this.banKoma = banKoma;
    this.banKyokumen = banKyokumen;
    this.beforeBanKoma = beforeBanKoma;
  }

  toString() {
    let result = '';
    if (this.beforeBanKoma) {
      result += `${this.banKoma.toString()}\n`;
    } else {
      result += `${this.banKoma.toString()} 打ち\n`;
    }
    result += this.banKyokumen.banSnapshot.toString();
    return result;
  }
};
