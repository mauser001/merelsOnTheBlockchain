contract("Force errors", async accounts => {
  const { Merels, GAME_COST, tryCatch } = require("./testBase.ts");
  let merels;
  beforeEach(function () {
    return Merels.new()
      .then(function (instance) {
        merels = instance;
      });
  });

  it("Start 2nd game with same user", async () => {
    const player1 = accounts[0];
    await merels.startGame({ from: player1, value: GAME_COST });
    await tryCatch(merels.startGame({ from: player1, value: GAME_COST }), "Already playing");
  });

  it("Did not pay enough", async () => {
    const player1 = accounts[0];
    await tryCatch(merels.startGame({ from: player1, value: GAME_COST / 2 }), "Game cost not met");
  });

  it("invalid game joins", async () => {
    const player1 = accounts[0];
    const player2 = accounts[1];
    const player3 = accounts[2];
    await merels.startGame({ from: player1, value: GAME_COST });
    await tryCatch(merels.joinGame(player1, { from: player1, value: GAME_COST }), "Already playing");
    await tryCatch(merels.joinGame(player2, { from: player3, value: GAME_COST }), "Oponent has no open game");
    await tryCatch(merels.joinGame(player1, { from: player2, value: GAME_COST / 2 }), "Game cost not met");
    let gameNumber = await merels.gameNumberByAddress(player1);
    await merels.joinGame(player1, { from: player2, value: GAME_COST });
    await tryCatch(merels.joinGame(player1, { from: player3, value: GAME_COST }), "Game already in progres");

  });
});