const Merels = artifacts.require("Merels");
const GAME_COST = 10000000000000000;
async function tryCatch(promise, message) {
    try {
        await promise;
        console.log("hmm no error for-> "+message);
        throw null;
    }
    catch (error) {
        assert.equal(error != null, true, "no error for -> " + message);
        assert.equal(error.message.indexOf(message) >= 0, true, "Expected an error message: " + message + "|not found in->" + error.message);
    }
};

module.exports = {
    Merels: Merels,
    GAME_COST: GAME_COST,
    tryCatch: tryCatch
};