const { Worker } = require('worker_threads');
const TsumeResolverNode = require('./tsume-resolver-node.js').TsumeResolverNode;

exports.TsumeResolver = class TsumeResolver {
  async oteRecursively(depth, parentNode, tumasareSide) {
    if (depth > this.depthLimit) {
      return false; // 手数が足りなかった
    }

    const nextBanTes = parentNode.banTe.findNextOteSeme(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));

    // 王手をかけることができた場合、各差し手について逃げ道があるかチェック
    const tsumiNodes = [];
    if (depth <= 3) {
      const promises = childNodes.map((nextNode) =>
        this.ukeWorker(depth + 1, nextNode),
      );
      const values = await Promise.all(promises);
      values.forEach((value, index) => {
        // TODO: findAllを考慮する
        if (value === false) {
          tsumiNodes.push(childNodes[index]);
        }
      });
    } else {
      for (let nextNode of childNodes) {
        if (
          await this.surviveRecursively(depth + 1, nextNode, tumasareSide)
        ) {
          const index = childNodes.indexOf(nextNode);
          if (index !== -1) {
            childNodes[index] = null; // もういらないので解放
          }
        } else {
          // 逃げられなかったので詰み成功
          tsumiNodes.push(nextNode);
          if (!this.findAll) {
            break;
          }
        }
      }
    }
    parentNode.addChildNode(...tsumiNodes);
    return !!tsumiNodes.length;
  }

  async surviveRecursively(depth, parentNode, tumasareSide) {
    const nextBanTes = parentNode.banTe.findNextOteUke(tumasareSide);
    const childNodes = nextBanTes.map((banTe) => new TsumeResolverNode(banTe));
    parentNode.addChildNode(...childNodes);

    if (!childNodes.length) {
      // 逃げる手がなかった場合は詰みとする
      parentNode.markAsTsumi(depth - 1);
      return false;
    }

    for (let nextNode of parentNode.childNodes) {
      const result = await this.oteRecursively(
        depth + 1,
        nextNode,
        tumasareSide,
      );
      if (result === false) {
        // 一つでも逃げられた手があったら逃げ成功
        return true;
      }
    }
    return false;
  }

  ukeWorker(depth, nextNode) {
    return new Promise((resolve, reject) => {
      const worker = new Worker('./worker.js');
      worker.postMessage({
        snapshotJson: nextNode.banTe.banSnapshot.asJson(),
        depthLimit: this.depthLimit - 1,
        baseDepth: depth,
      });
      worker.on('message', ({ foundUke, headNodeJson }) => {
        const restoredNode = TsumeResolverNode.buildFromJson(headNodeJson);
        // 移し替える
        nextNode.isTsumi = restoredNode.isTsumi;
        nextNode.addChildNode(...restoredNode.childNodes);
        resolve(foundUke);
        worker.terminate();
      });
    });
  }

  constructor(
    headNode,
    enemySide,
    depthLimit,
    findAll,
    baseDepth,
  ) {
    this.headNode = headNode;
    this.enemySide = enemySide;
    this.depthLimit = depthLimit;
    this.findAll = findAll;
    this.baseDepth = baseDepth;
  }

  async resolve(log) {
    if (log) {
      this.log('探索を開始');
      this.log(`再帰上限：${this.depthLimit}`);
      this.log(`全探索：${this.findAll}`);
    }
    const start = new Date();
    const foundTsumi = await this.oteRecursively(
      this.baseDepth,
      this.headNode,
      this.enemySide,
    );
    if (log) {
      this.log('探索完了');
      this.log(`詰みあり：${foundTsumi}`);
    }
    const end = new Date();
    if (log) {
      this.log(`所要時間：${end - start}`);
      this.log('---');
    }
    return foundTsumi;
  }

  async resolveUke() {
    const foundUke = await this.surviveRecursively(
      this.baseDepth,
      this.headNode,
      this.enemySide,
    );
    return foundUke;
  }

  log(message) {
    console.log(message);
  }
};
