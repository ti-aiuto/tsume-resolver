exports.BanPoint = class BanPoint {
  constructor(suji, dan) {
    if (BanPoint.isValidSuji(suji)) {
      this.suji = suji;
    } else {
      throw new Error(`suji: ${suji}は不正な値`);
    }
    if (BanPoint.isValidDan(dan)) {
      this.dan = dan;
    } else {
      throw new Error(`dan: ${dan}は不正な値`);
    }
  }

  equals(banPoint) {
    return this.suji === banPoint.suji && this.dan === banPoint.dan;
  }

  applyStepVencor(vector) {
    const nextSuji = this.suji + vector[0];
    const nextDan = this.dan + vector[1];
    if (BanPoint.isValidSuji(nextSuji) && BanPoint.isValidDan(nextDan)) {
      return new BanPoint(nextSuji, nextDan);
    } else {
      return null;
    }
  }

  pointsBetween(other) {
    const [sujiD, danD] = [this.sujiDistance(other), this.danDistance(other)];
    // 一マス移動の場合
    if (sujiD <= 1 && danD <= 1) {
      // 間のマスはない
      return [];
    } else if ((sujiD === 0 && danD > 0) || (sujiD > 0 && danD === 0)) {
      // 飛車・香車
      if (sujiD) {
        const sujiUnit = (other.suji - this.suji) / sujiD;
        const result = [];
        // 縦移動
        // 3マス先に移動だったら1, 2マス目を返してほしい
        for (let i = 1; i < sujiD; i++) {
          result.push(new BanPoint(this.suji + sujiUnit * i, this.dan));
        }
        return result;
      } else {
        const danUnit = (other.dan - this.dan) / danD;
        const result = [];
        // 横移動
        for (let j = 1; j < danD; j++) {
          result.push(new BanPoint(this.suji, this.dan + danUnit * j));
        }
        return result;
      }
    } else if (sujiD === danD) {
      // 角
      const sujiUnit = (other.suji - this.suji) / sujiD;
      const danUnit = (other.dan - this.dan) / danD;
      const result = [];
      for (let i = 1; i < Math.abs(sujiD); i++) {
        result.push(
          new BanPoint(this.suji + sujiUnit * i, this.dan + danUnit * i),
        );
      }
      return result;
    } else if (sujiD === 1 && danD === 2) {
      // 桂馬は間の駒を飛び越えてOK
      return [];
    } else {
      throw new Error(`想定外の移動パターン ${sujiD} ${danD} ${this} ${other}`);
    }
  }

  sujiDistance(other) {
    return Math.abs(this.suji - other.suji);
  }

  danDistance(other) {
    return Math.abs(this.dan - other.dan);
  }

  isTekiJinFor(side) {
    if (side.isSente) {
      return [7, 8, 9].includes(this.dan);
    } else {
      return [1, 2, 3].includes(this.dan);
    }
  }

  toString() {
    return `筋：${this.suji}, 段：${this.dan}`;
  }

  static isValidSuji(suji) {
    return this.sujiOptions().includes(suji);
  }

  static isValidDan(dan) {
    return this.isValidSuji(dan); // 同じロジックでOK
  }

  static sujiOptions() {
    return Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  }

  static danOptions() {
    return this.sujiOptions();
  }

  static sujiLabel(suji) {
    return ['', '１', '２', '３', '４', '５', '６', '７', '８', '９'][suji];
  }

  static danLabel(dan) {
    return ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][dan];
  }
};
