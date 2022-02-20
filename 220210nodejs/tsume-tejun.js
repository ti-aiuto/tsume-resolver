const TsumeTe = require('./tsume-te.js').TsumeTe;

exports.TsumeTejun = class TsumeTejun {
  constructor(tsumeTes) {
    this.tsumeTes = tsumeTes;
  }

  static buildFromTsumeResolverNode(tusmeResolverNode) {
    const result = [];
    this.extractTsumeTejunRecursively(result, 1, tusmeResolverNode);
    return new TsumeTejun(result);
  }

  static extractTsumeTejunRecursively(result, depth, headNode) {
    const nextNodes = headNode.childNodes.filter(
      (nextNode) => nextNode.isNoUkeAndFutureTsumi || nextNode.isTsumi,
    );
    nextNodes.sort((item1, item2) =>
      Math.sign(item1.depthScore() - item2.depthScore()),
    );

    let optimizedNextNodes = nextNodes;
    if (depth % 2 === 1) {
      // 攻め側は最短の一つのみ
      optimizedNextNodes = [nextNodes[0]];
    }
    const minTsumiDepthScore = Math.min(
      ...nextNodes.map((banTe) => banTe.depthScore()),
    );
    const maxTsumiDepthScore = Math.max(
      ...nextNodes.map((banTe) => banTe.depthScore()),
    );

    optimizedNextNodes.forEach((nextNode) => {
      let rank = null;
      if (nextNode.depthScore() === minTsumiDepthScore) {
        rank = 'best';
      } else if (nextNode.depthScore() === maxTsumiDepthScore) {
        rank = 'worst';
      }

      result.push(
        new TsumeTe(
          depth,
          nextNode.banTe,
          rank,
          nextNode.isTsumi,
          nextNode.minTsumiDepth,
          nextNode.maxTsumiDepth,
        ),
      );

      if (!nextNode.isTsumi) {
        this.extractTsumeTejunRecursively(result, depth + 1, nextNode);
      }
    });
  }
};
