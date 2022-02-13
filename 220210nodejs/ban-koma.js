exports.BanKoma = class BanKoma {
  constructor(koma, side, banPoint, nari) {
    this.koma = koma;
    this.side = side;
    this.banPoint = banPoint;
    this.nari = nari;

    if (!this.koma.canBeNari && nari) {
      throw new Error('nari不可');
    }
  }

  get isOnBoard() {
    return !!this.banPoint;
  }

  get isCaptured() {
    return !this.isOnBoard;
  }

  // この駒が次に移動できる先
  nextValidRangeBanPoints() {
    const stepVectors = this.koma.possibleStepVectors(this.nari);

    // 後手の場合は回転する
    if (this.side.isGote) {
      stepVectors.forEach((item) => {
        item[0] *= -1;
        item[1] *= -1;
      });
    }

    return stepVectors
      .map((stepVector) => this.banPoint.applyStepVencor(stepVector))
      .filter((item) => item);
  }

  // 引数の地点が移動した後の利きの範囲に成り得るかどうか
  afterMoveNearPointOf(otherBanPoint) {
    if (!this.banPoint) {
      return null;
    }

    // 移動後成・成らずどちらか分からないためより大きく動けるほうを使う
    const afterMoveMaximumSujiStep = Math.max(this.koma.maximumSujiStepLength(false), this.koma.maximumSujiStepLength(true));
    const afterMoveMaximumDanStep = Math.max(this.koma.maximumDanStepLength(false), this.koma.maximumDanStepLength(true));

    return (
      this.banPoint.sujiDistance(otherBanPoint) <=
        this.koma.maximumSujiStepLength(this.nari) + afterMoveMaximumSujiStep &&
      this.banPoint.danDistance(otherBanPoint) <=
        this.koma.maximumDanStepLength(this.nari) + afterMoveMaximumDanStep
    );
  }

  // 引数の地点が利きの範囲に成り得るかどうか
  nearPointOf(otherBanPoint) {
    if (!this.banPoint) {
      return null;
    }
    return (
      this.banPoint.sujiDistance(otherBanPoint) <=
        this.koma.maximumSujiStepLength(this.nari) &&
      this.banPoint.danDistance(otherBanPoint) <=
        this.koma.maximumDanStepLength(this.nari)
    );
  }

  moveOrMoveAndNariToBanPoint(toBanPoint) {
    const result = [];
    const nextBanKoma = new BanKoma(
      this.koma,
      this.side,
      toBanPoint,
      this.nari,
    );
    if (this.canBecomeNari(this.banPoint, toBanPoint)) {
      result.push(nextBanKoma.becomeNari(this.banPoint, toBanPoint));
    }
    result.push(nextBanKoma);
    return result;
  }

  canBecomeNari(fromBanPoint, toBanPoint) {
    return (
      this.koma.canBeNari &&
      !this.nari &&
      (fromBanPoint.isTekiJinFor(this.side) ||
        toBanPoint.isTekiJinFor(this.side))
    );
  }

  clone() {
    return new BanKoma(this.koma, this.side, this.banPoint, this.nari);
  }

  becomeNari(fromBanPoint, toBanPoint) {
    if (!this.canBecomeNari(fromBanPoint, toBanPoint)) {
      throw new Error('nari不可');
    }
    const cloned = this.clone();
    cloned.nari = true;
    return cloned;
  }

  toString() {
    return `${this.side.shortLabel} 筋:${this.banPoint.suji} 段:${
      this.banPoint.dan
    } ${this.koma.label(this.nari)} ${this.nari ? '成' : '不成'}`;
  }
};
