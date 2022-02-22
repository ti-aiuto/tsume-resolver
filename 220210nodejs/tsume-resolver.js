const TsumeResolverNode = require('./tsume-resolver-node.js').TsumeResolverNode;

exports.TsumeResolver = class TsumeResolver {
  oteRecursively(depth, parentNode, tumasareSide) {
    if (depth > this.depthLimit) {
      return false; // 手数が足りなかった
    }

    const nextBanTes = parentNode.banTe.findNextOteSeme(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));

    // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
    const tsumiNodes = [];
    for (let nextNode of childNodes) {
      if (!this.surviveRecursively(depth + 1, nextNode, tumasareSide)) {
        // 逃げられなかったので詰み成功
        tsumiNodes.push(nextNode);
        if (!this.findAll) {
          break;
        }
      }
    }
    parentNode.addChildNode(...tsumiNodes);
    return !!tsumiNodes.length;
  }

  surviveRecursively(depth, parentNode, tumasareSide) {
    const nextBanTes = parentNode.banTe.findNextOteUke(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));
    parentNode.addChildNode(...childNodes);

    if (!childNodes.length) {
      // 逃げる手がなかった場合は詰みとする
      parentNode.markAsTsumi(depth - 1);
      return false;
    }

    // 逃げられた場合、各差し手について王手を探す
    for (let nextNode of parentNode.childNodes) {
      if (this.oteRecursively(depth + 1, nextNode, tumasareSide) === false) {
        // 一つでも逃げられた手があったら逃げ成功
        return true;
      }
    }
    return false;
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
