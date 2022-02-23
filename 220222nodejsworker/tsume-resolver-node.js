const { BanTe } = require('./ban-te');

exports.TsumeResolverNode = class TsumeResolverNode {
  constructor(banTe) {
    this.banTe = banTe;
    this.parentNode = null;
    this.childNodes = [];
    this.isTsumi = null;
    this.maxTsumiDepth = null;
    this.minTsumiDepth = null;
  }

  addChildNode(...nodes) {
    nodes.forEach((node) => {
      node.parentNode = this;
      if (node.minTsumiDepth) {
        this.updateTsumiDepthRecursively(node.minTsumiDepth);
      }
      if (node.maxTsumiDepth) {
        this.updateTsumiDepthRecursively(node.maxTsumiDepth);
      }
    });
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

  depthScore() {
    return this.minTsumiDepth * 100 + this.maxTsumiDepth;
  }

  asJson() {
    return {
      banTe: this.banTe.asJson(),
      childNodes: this.childNodes.map((item) => item.asJson()),
      isTsumi: this.isTsumi,
      maxTsumiDepth: this.maxTsumiDepth,
      minTsumiDepth: this.minTsumiDepth,
    };
  }

  static buildFromJson(json) {
    const banTe = BanTe.buildFromJson(json['banTe']);
    const childNodes = json['childNodes'].map((item) =>
      TsumeResolverNode.buildFromJson(item),
    );
    const node = new TsumeResolverNode(banTe);
    node.childNodes = childNodes;
    node.isTsumi = json['isTsumi'];
    node.maxTsumiDepth = json['maxTsumiDepth'];
    node.minTsumiDepth = json['minTsumiDepth'];
    return node;
  }
};
