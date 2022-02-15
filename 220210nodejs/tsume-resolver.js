exports.TsumeResolver = class TsumeResolver {
  nextOte(parentBanTe, tumasareSide) {
    parentBanTe.addBanTe(...parentBanTe.findNextMovingOtesOf(tumasareSide));
    parentBanTe.addBanTe(...parentBanTe.findNextPuttingOtesOf(tumasareSide));
    // TODO: 開き王手を考慮する

    if (parentBanTe.nextBanTes.length) {
      return true;
    } else {
      return false;
    }
  }

  nextSurvival(parentBanTe, tumasareSide) {
    parentBanTe.addBanTe(...parentBanTe.findNextOteEscaping(tumasareSide));
    parentBanTe.addBanTe(...parentBanTe.findNextOteRemoving(tumasareSide));
    parentBanTe.addBanTe(...parentBanTe.findNextOteAigoma(tumasareSide));

    if (parentBanTe.nextBanTes.length) {
      parentBanTe.markAsNotTsumi();
      return true;
    } else {
      parentBanTe.markAsTsumi();
      return false;
    }
  }

  oteRecursively(depth, parentBanTe, tumasareSide) {
    if (depth > this.depthLimit) {
      throw new Error('再帰上限');
    }
    if (this.nextOte(parentBanTe, tumasareSide)) {
      // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
      let oteSuccess = false;
      for (let banTe of parentBanTe.nextBanTes) {
        try {
          if (this.surviveRecursively(depth + 1, banTe, tumasareSide) === false) {
            // 一つでも逃げられない手があればそのKyokumenが完全に詰みとする
            parentBanTe.markAsNoUkeAndFutureTsumi();
            oteSuccess = true;
            // return true;
          }
        } catch (e) {
          if (e.message === '再帰上限') {
            return false;
          } else {
            throw e;
          }
        }
      }
      if (oteSuccess) {
        // 全王手を見たいから
        return true;
      }
      parentBanTe.markAsOneOfThemNoOte();
      return false;
    } else {
      // 逃げられた
      return false;
    }
  }

  surviveRecursively(depth, parentBanTe, tumasareSide) {
    if (this.nextSurvival(parentBanTe, tumasareSide)) {
      // 逃げられた場合、各差し手について王手を探す
      for (let banTe of parentBanTe.nextBanTes) {
        if (this.oteRecursively(depth + 1, banTe, tumasareSide) === false) {
          // 一つでも逃げられた手があったらそのKyokumenは詰め失敗とする
          parentBanTe.markAsOneOfThemNoOte();
          return true;
        }
      }
      parentBanTe.markAsNoUkeAndFutureTsumi();
      return false;
    } else {
      // 詰み
      return false;
    }
  }

  constructor(initialBanTe, enemySide, depthLimit) {
    this.initialBanTe = initialBanTe;
    this.enemySide = enemySide;
    this.depthLimit = depthLimit;
  }

  resolve() {
    this.log('探索を開始');
    this.log(`再帰上限：${this.depthLimit}`);
    this.oteRecursively(1, this.initialBanTe, this.enemySide);
    this.log('探索完了');
  }

  log(message) {
    console.log(message);
  }
};
