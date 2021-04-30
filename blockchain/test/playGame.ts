const Merels = artifacts.require("Merels");
const gameCost = 10000000000000000;

contract("Play games", async accounts => {

  it("Win a game", async () => {
    const merels = await Merels.deployed();
    const player1 = accounts[0];
    const player2 = accounts[1];
    let count = await merels.gameCount();
    
    let startBalance =  await web3.eth.getBalance(player1);
    console.log("startBalance: " + startBalance);

    assert.equal(count, 0, "Gamecount is 0");
    await merels.startGame({ from: player1, value: gameCost });
    count = await merels.gameCount();
    assert.equal(count, 1, "Gamecount is 1 after game start");

    await merels.joinGame(player1, { from: player2, value: gameCost });

    await merels.makeMove(0, -1, -1, { from: player1 });

    let gameNumber = await merels.gameNumberByAddress(player1);
    console.log("gameNumber: " + gameNumber)
    let game = await merels.games(gameNumber - 1);
    console.log("game: " + JSON.stringify(game));
    let positions = await merels.getPositions(gameNumber);
    console.log("positions: " + positions);
    assert.equal(positions[0], 1, "move confirmed");


    await merels.makeMove(8, -1, -1, { from: player2 });
    await merels.makeMove(1, -1, -1, { from: player1 });
    await merels.makeMove(9, -1, -1, { from: player2 });
    await merels.makeMove(2, -1, 8, { from: player1 });
    await merels.makeMove(16, -1, -1, { from: player2 });
    await merels.makeMove(3, -1, -1, { from: player1 });
    await merels.makeMove(17, -1, -1, { from: player2 });
    await merels.makeMove(4, -1, 9, { from: player1 });
    await merels.makeMove(8, -1, -1, { from: player2 });
    await merels.makeMove(5, -1, -1, { from: player1 });
    await merels.makeMove(9, -1, -1, { from: player2 });
    await merels.makeMove(6, -1, 8, { from: player1 });
    await merels.makeMove(19, -1, -1, { from: player2 });
    await merels.makeMove(7, -1, 9, { from: player1 });
    await merels.makeMove(20, -1, -1, { from: player2 });
    await merels.makeMove(23, -1, -1, { from: player1 });
    await merels.makeMove(21, -1, -1, { from: player2 });
    await merels.makeMove(15, 7, -1, { from: player1 });
    await merels.makeMove(9, 17, -1, { from: player2 });    
    await merels.makeMove(7, 0, 20, { from: player1 });
    await merels.makeMove(17, 9, -1, { from: player2 });
    await merels.makeMove(0, 7, 21, { from: player1 });
    await merels.makeMove(9, 17, -1, { from: player2 });

    let balanceBefore =  await web3.eth.getBalance(player1);
    console.log("balanceBefore: " + balanceBefore);
    await merels.makeMove(7, 0, 19, { from: player1 });
    
    let balanceAfter =  await web3.eth.getBalance(player1);

    console.log("balanceAfter: " + balanceAfter);
    console.log("winnings: " + (startBalance - balanceBefore));
    assert.equal(balanceBefore < balanceAfter, true, "winnings payed");
    
    positions = await merels.getPositions(gameNumber);
    
    assert.equal(JSON.stringify(positions), JSON.stringify(["0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0","0"]), "positions cleaned");
    
    count = await merels.gameCount();
    assert.equal(count,0, "Games cleaned");

  });

  it("Start 3 games", async () => {
    const merels = await Merels.deployed();
    const player1 = accounts[0];
    const player2 = accounts[1];
    const player3 = accounts[2];
    let count = await merels.gameCount();    
    assert.equal(count, 0, "Gamecount is 0");

    await merels.startGame({ from: player1, value: gameCost });
    await merels.startGame({ from: player2, value: gameCost });
    await merels.startGame({ from: player3, value: gameCost });
    count = await merels.gameCount();
    assert.equal(count, 3, "3 games created");
  });
});