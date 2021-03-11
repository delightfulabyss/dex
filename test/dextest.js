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
        await dex.deposit(100, web3.utils.utf8ToHex('LINK'));
        let balance = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        assert.equal(balance.toNumber(), 100);
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
    //ETH balance will be 10 ETH per account
    it("should throw an error when the user's ETH balance is less than a buy order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        dex.depositEth({ value: 1 });
        await truffleAssert.reverts(
            dex.createLimitOrder1, web3.utils.utf8ToHex('LINK'), 10, 1)
        );
        dex.depositEth({value: 9})
        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.utf8ToHex('LINK'), 10, 1)
        );
    });

    //The user must have enough tokens deposited such that token balance >= sell order amount

    it("should throw an error when the user's token balance is less than a sell order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(
            dex.createLimitOrder(1, web3.utils.utf8ToHex('LINK'), 10, 1)
        );
        await link.approve(500, dex.address);
        await dex.deposit(10, web3.utils.utf8ToHex('LINK'));
        await truffleAssert.passes(
            dex.createLimitOrder(1, web3.utils.utf8ToHex('LINK'), 10, 1)
        );
    });

    //The buy orderbook should be ordered from highest to lowest in price starting at index 0
    it("should be ordered from highest to lowest in price, starting from index 0", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(500, dex.address);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 300);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 100);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 200);
        let buyOrderBook = getOrderBook(web3.utils.utf8ToHex('LINK'), 0);
        assert.equal(
            buyOrderBook,
            buyOrderBook.sort((a, b) => {
            return b.price - a.price;
        }));
    });

    //The sell orderbook should be ordered from lowest to highest in price starting at index 0
    it("should be ordered from highest to lowest in price, starting from index 0", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(500, dex.address);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 300);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 100);
        await dex.createLimitOrder(0, web3.utils.utf8ToHex('LINK'), 1, 200);
        let sellOrderBook = getOrderBook(web3.utils.utf8ToHex('LINK'), 1);
        assert.equal(
            sellOrderBook,
            sellOrderBook.sort((a, b) => {
            return a.price - b.price;
        }));
    });
});