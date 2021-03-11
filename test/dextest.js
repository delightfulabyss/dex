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
        await dex.deposit(500, web3.utils.utf8ToHex('LINK'))
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        assert.equal(balance.toNumber(), 500);
    });

    it("should handle faulty token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(dex.withdraw(600, web3.utils.utf8ToHex('LINK')));
    });

    it("should handle valid token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(dex.withdraw(100, web3.utils.utf8ToHex('LINK')));
    });

    //The user must have enough ETH deposited such that deposited ETH >= buy order amount
    //Get ETH balance => compare to buy order amount
    //ETH balance will be 200 ETH per account
    it("should require that a user's ETH balance must be larger than a buy order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let ethBalance = await web3.eth.getBalance(accounts[0]);
        await dex.limitOrder(web3.utils.utf8ToHex('LINK'), 'BUY', 50, 1);
        let buyOrderBook = await getOrderBook(web3.utils.utf8ToHex('LINK'), 'BUY');
        let buyOrderAmount = buyOrderBook[buyOrderBook.length - 1].amount;
        truffleAssert.passes(ethBalance > buyOrderAmount);
    });

    it("should throw an error when the user's ETH balance is less than a buy order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let ethBalance = await web3.eth.getBalance(accounts[0]);
        await dex.limitOrder(web3.utils.utf8ToHex('LINK'), 'BUY', 150000, 1);
        let buyOrderBook = await getOrderBook(web3.utils.utf8ToHex('LINK'), 'BUY');
        let buyOrderAmount = buyOrderBook[buyOrderBook.length - 1].amount;
        truffleAssert.reverts(ethBalance > buyOrderAmount);
    });

    //The user must have enough tokens deposited such that token balance > sell order amount
    it("should require that a user's token balance is greater than the sell order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let tokenBalance = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        await dex.limitOrder(web3.utils.utf8ToHex('LINK'), 'SELL', 20, 1);
        let sellOrderBook = await getOrderBook(web3.utils.utf8ToHex('LINK'), 'SELL');
        let sellOrderAmount = sellOrderBook[sellOrderBook.length - 1].amount;
        truffleAssert.passes(tokenBalance > sellOrderAmount);
    });

    it("should throw an error when the user's token balance is less than a sell order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let tokenBalance = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        await dex.limitOrder(web3.utils.utf8ToHex('LINK'), 'SELL', 450, 20);
        let sellOrderBook = await getOrderBook(web3.utils.utf8ToHex('LINK'), 'SELL');
        let sellOrderAmount = sellOrderBook[sellOrderBook.length - 1].amount;
        truffleAssert.reverts(tokenBalance < sellOrderAmount);
    });

    //The buy orderbook should be ordered from highest to lowest in price starting at index 0
    it("should be ordered from highest to lowest in price, starting from index 0", async () => {
        let buyOrderBook = getOrderBook(web3.utils.utf8ToHex('LINK'), 'BUY');
        assert.equal(buyOrderBook, buyOrderBook.sort((a, b) => {
            return b.price - a.price;
        }));
    });
});