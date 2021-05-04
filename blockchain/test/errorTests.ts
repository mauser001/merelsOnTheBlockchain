contract("Force errors", async accounts => {
    
  const Merels = require("./testBase.ts").Merels;
  const GAME_COST = require("./testBase.ts").GAME_COST;
  let tryCatch = require("./testBase.ts").tryCatch;
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
});