const Merels = artifacts.require("Merels");
const GAME_COST = 10000000000000000;
async function tryCatch(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error.message.indexOf(message) >= 0,true,"Expected an error message ");
    }
};

module.exports = {
    Merels            : Merels,
    GAME_COST          : GAME_COST,
    tryCatch       : tryCatch
};