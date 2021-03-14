const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');

const ETH_TICKER = web3.utils.utf8ToHex("ETH");
const LINK_TICKER = web3.utils.utf8ToHex("LINK");
const BUY_SIDE = 0;
const SELL_SIDE = 1;

contract("Dex", accounts => {

    //When creating a sell market order, the seller needs to have enough tokens for the trade
    it("should throw an error if the seller does not have enough tokens for the sell market order", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let balance = await dex.balances(accounts[0], LINK_TICKER);
        assert(balance.toNumber(), 0, "Initial LINK balance is not 0");
        await truffleAssert.reverts(
            dex.createMarketOrder(SELL_SIDE, LINK_TICKER, 10)
        );
    });
    
    it("should pass if the seller has enough tokens for the sell market order", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await dex.addTokenSupport(LINK_TICKER, link.address);
        await link.approve(dex.address, 500);
        await dex.deposit(10, LINK_TICKER);
        let balance = await dex.balances(accounts[0], LINK_TICKER);
        assert(balance.toNumber(), 10, "Initial LINK balance is not 10")
        await truffleAssert.passes(
            dex.createMarketOrder(SELL_SIDE, LINK_TICKER, 10)
        );
    });
    //When creating a buy market order, the buyer needs to have enough ETH for the trade
    it("should throw an error if the buyer does not have enough ETH for the buy market order", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let balance = await dex.balances(accounts[0], ETH_TICKER);
        assert(balance.toNumber(), 0, "Initial ETH balance is not 0");
        await truffleAssert.reverts(
            dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
        );
    });
    
    it("should pass if the buyer has enough ETH for the buy market order", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        dex.depositEth({ value: web3.utils.toWei('5', 'ether') });
        let balance = await dex.balances(accounts[0], ETH_TICKER);
        assert(balance.toNumber(), 5, "Initial ETH balance is not 5");
        await truffleAssert.reverts(
            dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
        );
    });
    
    //Market orders can be submitted even if the order book is empty
    it("should pass even if the market order book is empty", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        let buyOrderBook = await dex.getOrderBook(LINK_TICKER, 0);
        assert.equal(sellOrderBook, [], "Sell orderbook is not empty");
        await truffleAssert.passes(
            dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
        );
    });

    
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    it("", async () => {

     });
    
    //The eth balance of the buyer should decrease with the filled amounts
    it("should decrease the ETH balance proportionally with filled amounts", async () => {
        
    });
    
    //The token balance of the seller should decrease with the filled amounts
    it("should decrease the token balance proportionally with filled amounts", async () => {

    });

    //Filled limit orders should be removed from the orderbook
    it("should remove limit orders from the orderbook when they are filled", async () => {

    });
});