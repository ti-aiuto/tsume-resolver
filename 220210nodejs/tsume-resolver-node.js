exports.TsumeResolverNode = class TsumeResolverNode {
  constructor(banTe) {
    this.banTe = banTe;
    this.parentNode = null;
    this.childNodes = [];
    this.isOneOfThemNoOte = null;
    this.isNoUkeAndFutureTsumi = null;
    this.isTsumi = null;
    this.maxTsumiDepth = null;
    this.minTsumiDepth = null;
  }

  addChildNode(...nodes) {
    nodes.forEach((node) => (node.parentNode = this));
    this.childNodes.push(...nodes);
  }

  markAsTsumi(depth) {
    this.isTsumi = true;
    this.updateTsumiDepthRecursively(depth);
  }

  updateTsumiDepthRecursively(depth) {
    if (this.maxTsumiDepth) {
      this.maxTsumiDepth = Math.max(this.maxTsumiDepth, depth);
    } else {
      this.maxTsumiDepth = depth;
    }
    if (this.minTsumiDepth) {
      this.minTsumiDepth = Math.min(this.minTsumiDepth, depth);
    } else {
      this.minTsumiDepth = depth;
    }
    if (this.parentNode) {
      this.parentNode.updateTsumiDepthRecursively(depth);
    }
  }

  // 詰み探索用のデータと純粋な手のデータは分離したい

  markAsNotTsumi() {
    this.isTsumi = false;
  }

  markAsNoOteAndRelease() {
    this.isOneOfThemNoOte = true;
    this.childNodes = [];
  }

  markAsNoUkeAndFutureTsumi() {
    this.isNoUkeAndFutureTsumi = true;
  }

  depthScore() {
    return this.minTsumiDepth * 100 + this.maxTsumiDepth;
  }
};
