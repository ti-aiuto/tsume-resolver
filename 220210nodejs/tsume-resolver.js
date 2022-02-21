const TsumeResolverNode = require('./tsume-resolver-node.js').TsumeResolverNode;

exports.TsumeResolver = class TsumeResolver {
  nextOte(parentNode, tumasareSide) {
    const nextBanTes = parentNode.banTe.findNextOteSeme(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));
    parentNode.addChildNode(...childNodes);

    if (nextBanTes.length) {
      return true;
    } else {
      return false;
    }
  }

  nextSurvival(parentNode, tumasareSide, depth) {
    const nextBanTes = parentNode.banTe.findNextOteUke(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));
    parentNode.addChildNode(...childNodes);

    if (nextBanTes.length) {
      parentNode.markAsNotTsumi();
      return true;
    } else {
      parentNode.markAsTsumi(depth - 1);
      return false;
    }
  }

  oteRecursively(depth, parentNode, tumasareSide) {
    if (depth > this.depthLimit) {
      throw new Error('再帰上限');
    }
    if (this.nextOte(parentNode, tumasareSide)) {
      // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
      let oteSuccess = false;
      for (let nextNode of parentNode.childNodes) {
        try {
          if (
            this.surviveRecursively(depth + 1, nextNode, tumasareSide)
          ) {
            // 詰め失敗のためメモリ解放したい
            nextNode.markAsNoOteAndRelease();
          } else {
            // 一つでも逃げられない手があればそのKyokumenが完全に詰みとする
            parentNode.markAsNoUkeAndFutureTsumi();
            oteSuccess = true;
            if (!this.findAll) {
              return true;
            }
          }
        } catch (e) {
          if (e.message === '再帰上限') {
            // 詰め失敗のためメモリ解放したい
            nextNode.markAsNoOteAndRelease();
            continue;
          } else {
            throw e;
          }
        }
      }
      if (oteSuccess) {
        // 全王手をチェックする場合は覚えていた値に応じてreturnする
        return true;
      }
      return false;
    } else {
      // 逃げられた
      return false;
    }
  }

  surviveRecursively(depth, parentNode, tumasareSide) {
    if (this.nextSurvival(parentNode, tumasareSide, depth)) {
      // 逃げられた場合、各差し手について王手を探す
      for (let nextNode of parentNode.childNodes) {
        if (this.oteRecursively(depth + 1, nextNode, tumasareSide) === false) {
          // 一つでも逃げられた手があったらそのKyokumenは詰め失敗とする
          return true;
        }
      }
      parentNode.markAsNoUkeAndFutureTsumi();
      return false;
    } else {
      // 詰み
      return false;
    }
  }

  constructor(headNode, enemySide, depthLimit, findAll) {
    this.headNode = headNode;
    this.enemySide = enemySide;
    this.depthLimit = depthLimit;
    this.findAll = findAll;
  }

  resolve() {
    this.log('探索を開始');
    this.log(`再帰上限：${this.depthLimit}`);
    this.log(`全探索：${this.findAll}`);
    const start = new Date();
    const foundTsumi = this.oteRecursively(1, this.headNode, this.enemySide);
    this.log('探索完了');
    this.log(`詰みあり：${foundTsumi}`);
    const end = new Date();
    this.log(`所要時間：${end - start}`);
    this.log('---');
    return foundTsumi;
  }

  log(message) {
    console.log(message);
  }
};
