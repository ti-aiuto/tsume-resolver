const BanKoma = require('./ban-koma.js').BanKoma;

const KomaFu = require('./koma-fu.js').KomaFu;
const BanTe = require('./ban-te.js').BanTe;
const BanKyokumen = require('./ban-kyokumen.js').BanKyokumen;

exports.TeResolver = class TeResolver {
  // その駒を動かして王手にできる手の配列(BanCommand[])を返す
  findNextMovingOtesOf(banSnapshot, gyokuBanKoma, banKoma) {
    const mySide = gyokuBanKoma.side.opposite();
    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = banKoma.nextValidRangeBanPoints();

    // 自分の駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter((banPoint) =>
      banSnapshot.canMoveToBanPointBySide(banKoma.banPoint, banPoint, mySide),
    );

    // 移動してみて成る場合とならない場合のBanKomaを生成してみる
    const nextPossibleBanKomas = [];
    notOccupyingPoints.forEach((banPoint) =>
      nextPossibleBanKomas.push(
        ...banKoma.moveOrMoveAndNariToBanPoint(banPoint),
      ),
    );
    // そのBanKomaの移動先の点が敵玉の点と一致すること
    const oteBanKomas = nextPossibleBanKomas.filter((nextBanKoma) =>
      banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint),
    );

    return oteBanKomas.map((oteBanKoma) => {
      const nextBanShapshot = banSnapshot.moveKomaTo(
        banKoma.banPoint,
        oteBanKoma.banPoint,
        oteBanKoma.nari,
      );
      const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
      return new BanTe(oteBanKoma, nextBanKyokumen, banKoma);
    });
  }

  findNextPuttingOtesOf(banSnapshot, gyokuBanKoma, banKoma) {
    const mySide = gyokuBanKoma.side.opposite();

    const emptyBanPoints = banSnapshot.findEmptyPoints();
    const nextOtePossibleBanKomas = [];

    emptyBanPoints.forEach((banPoint) => {
      const nextBanKoma = new BanKoma(banKoma.koma, mySide, banPoint);

      if (banKoma.koma instanceof KomaFu) {
        // 二歩のチェック
        if (
          banSnapshot
            .findBanKomasBySideAndSuji(mySide, banPoint.suji)
            .find((banKoma) => banKoma.koma.equals(banKoma.koma))
        ) {
          return false;
        }
      }

      if (banSnapshot.isInPownerOfMove(nextBanKoma, gyokuBanKoma.banPoint)) {
        nextOtePossibleBanKomas.push(nextBanKoma);
      }
    });

    return nextOtePossibleBanKomas.map((oteBanKoma) => {
      const nextBanShapshot = banSnapshot.putKoma(
        oteBanKoma.banPoint,
        oteBanKoma.koma,
        oteBanKoma.side,
      );
      const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
      return new BanTe(oteBanKoma, nextBanKyokumen, null);
    });
  }

  // 玉が逃げる・取るパターン
  findNextOteEscaping(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;

    // 盤の範囲内で移動できる点
    const nextValidRangeBanPoints = gyokuBanKoma.nextValidRangeBanPoints();

    // 駒がいない点
    const notOccupyingPoints = nextValidRangeBanPoints.filter(
      (banPoint) => !banSnapshot.findBanKomaByBanPoint(banPoint),
    );

    return notOccupyingPoints
      .map((banPoint) => {
        // 玉を移動させてみて、その状態で王手じゃないかをチェックする
        const nextBanKomas = gyokuBanKoma.moveOrMoveAndNariToBanPoint(banPoint);
        const nextBanKoma = nextBanKomas[0]; // 玉は成らない
        const nextBanSnapshot = banSnapshot.moveKomaTo(
          gyokuBanKoma.banPoint,
          banPoint,
          false,
        );
        const banKyokumen = new BanKyokumen(nextBanSnapshot);
        return new BanTe(nextBanKoma, banKyokumen, gyokuBanKoma);
      })
      .filter((nextBanTe) => {
        return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
          .length;
      });
  }

  findNextOteRemoving(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;
    const enemyCausingOteBanKomas = banSnapshot.causingOteBanKomasTo(mySide);
    const myBanKomas = banSnapshot.findOnBoardBanKomasBySide(mySide);

    // 王手をかけている駒を取れる駒の一覧
    const myBanKomasToRemoveEnemyBanKomas = myBanKomas.filter((myBanKoma) => {
      return enemyCausingOteBanKomas.some((enemyBanKoma) => {
        return banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint);
      });
    });

    const nextBanTes = [];
    myBanKomasToRemoveEnemyBanKomas.forEach((myBanKoma) => {
      enemyCausingOteBanKomas.forEach((enemyBanKoma) => {
        // 王手をかけている駒が複数ある場合もあるので利きの範囲内か先にチェックする
        if (
          banSnapshot.isInPownerOfMove(myBanKoma, enemyBanKoma.banPoint) &&
          banSnapshot.canMoveToBanPointBySide(
            myBanKoma.banPoint,
            enemyBanKoma.banPoint,
            mySide,
          )
        ) {
          myBanKoma
            .moveOrMoveAndNariToBanPoint(enemyBanKoma.banPoint)
            .forEach((nextBanKoma) => {
              const nextBanShapshot = banSnapshot.moveKomaTo(
                myBanKoma.banPoint,
                nextBanKoma.banPoint,
                nextBanKoma.nari,
              );
              const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
              nextBanTes.push(
                new BanTe(nextBanKoma, nextBanKyokumen, myBanKoma),
              );
            });
        }
      });
    });

    return nextBanTes.filter((nextBanTe) => {
      return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
        .length;
    });
  }

  findNextOteAigoma(banSnapshot, gyokuBanKoma) {
    const mySide = gyokuBanKoma.side;
    const enemyCausingOteBanKomas = banSnapshot.causingOteBanKomasTo(mySide);
    const myCapturedBanKomas =
      banSnapshot.findDistictCapturedBanKomasBySide(mySide);

    const nextBanTes = [];
    enemyCausingOteBanKomas.filter((enemyBanKoma) => {
      gyokuBanKoma.banPoint
        .pointsBetween(enemyBanKoma.banPoint)
        .forEach((banPoint) => {
          myCapturedBanKomas.forEach((capturedBanKoma) => {
            const nextBanKoma = new BanKoma(
              capturedBanKoma.koma,
              mySide,
              banPoint,
              false,
            );
            const nextBanShapshot = banSnapshot.putKoma(
              banPoint,
              capturedBanKoma.koma,
              mySide,
            );
            const nextBanKyokumen = new BanKyokumen(nextBanShapshot);
            nextBanTes.push(new BanTe(nextBanKoma, nextBanKyokumen));
          });
        });
    });

    return nextBanTes.filter((nextBanTe) => {
      return !nextBanTe.banKyokumen.banSnapshot.causingOteBanKomasTo(mySide)
        .length;
    });
  }
};
