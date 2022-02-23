const { parentPort } = require('worker_threads');
const { BanSnapshot } = require('./ban-snapshot.js');
const TsumeResolver = require('./tsume-resolver.js').TsumeResolver;
const TsumeResolverNode = require('./tsume-resolver-node.js').TsumeResolverNode;
const BanSide = require('./ban-side.js').BanSide;
const BanTe = require('./ban-te.js').BanTe;

parentPort.on('message', async ({ snapshotJson, depthLimit, baseDepth }) => {
  const enemySide = BanSide.getInstangeOfGoteSide();
  const initialBanSnapshot = BanSnapshot.buildFromJson(snapshotJson);
  const initialBanTe = new BanTe(null, initialBanSnapshot);

  console.log(`Worker読み込み完了: base: ${baseDepth}`);

  const headNode = new TsumeResolverNode(initialBanTe);
  const resolver = new TsumeResolver(
    headNode,
    enemySide,
    depthLimit,
    true,
    baseDepth
  );

  const foundUke = await resolver.resolveUke();
  parentPort.postMessage({
    foundUke,
    headNodeJson: headNode.asJson()
  });
});
