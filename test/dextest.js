const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    it("shold only be possible for owner to add tokens", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(
            dex.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address, { from: accounts[0] })
        );
        await truffleAssert.reverts(
            dex.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address, { from: accounts[1] })
        );
    });

    it("should handle token deposits correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(dex.address, 500);
        await dex.deposit(100, web3.utils.utf8ToHex('LINK'))
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        assert.equal(balance.toNumber(), 100);
    });

    it("should handle faulty token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(dex.withdraw(200, web3.utils.utf8ToHex('LINK')));
    });

        it("should handle valid token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(dex.withdraw(100, web3.utils.utf8ToHex('LINK')));
    });

    //The user must have enough ETH deposited such that deposited ETH >= buy order amount
    it("should require that a user's balance must be larger than a buy order amount", async () => {
        truffleAssert.passes(dex.limitOrder(web3.utils.utf8ToHex('LINK'), 'BUY',);
    });

    it("should throw an error when the user's balance is less than a buy order amount", async () => {

    });
    //The user must have enough tokens depsoited such that token balance > sell order amount
    it("should require that a user's token balance is greater than the sell order amount", async () => {
        
    });
    it("should throw an error when the user's token balance is less than a sell order amount", async () => {

    });
    //The buy orderbook should be ordered from highest to lowest in price starting at index 0
    it("should be ordered from highest to lowest in price, starting from index 0", async () => {
        let buyOrderBook = getOrderBook(web3.utils.utf8ToHex('LINK'), 'BUY');
        for (let index = 0; index < buyOrderBook.length; index++) {
            let currentElement = buyOrderBook[index];
            let nextElement = buyOrderBook[index + 1];
            if (currentElement >= nextElement) {
                continue;
            } else {
            
            }
        }
    });
});