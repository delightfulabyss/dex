const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');


const LINK_TICKER = web3.utils.utf8ToHex("LINK");
const BUY_SIDE = 0;
const SELL_SIDE = 1;

contract("Dex", accounts => {

    //The user must have enough ETH deposited such that deposited ETH >= buy order amount
    it("should throw an error when the user's ETH balance is less than a buy limit order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(
            dex.createLimitOrder(BUY_SIDE, LINK_TICKER, 10, 1)
        )
    });

    it("should pass when the user's ETH balance is greater than than a buy limit order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        dex.depositEth({ value: web3.utils.toWei('2', 'ether') });
        await truffleAssert.passes(
            dex.createLimitOrder(BUY_SIDE, LINK_TICKER, 10, 1)
        )
    });
    
    //The user must have enough tokens deposited such that token balance >= sell order amount

    it("should throw an error when the user's token balance is less than a sell order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(
            dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 10, 1)
        );
    });

    it("should pass when the user's token balance is greater than a sell order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await dex.addTokenSupport(LINK_TICKER, link.address);
        await link.approve(dex.address, 500);
        await dex.deposit(20, LINK_TICKER);
        await truffleAssert.passes(
            dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 10, 1)
        );
    });

    //The buy orderbook should be ordered from highest to lowest in price starting at index 0
    it("should be ordered from highest to lowest in price, starting from index 0", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await link.approve(dex.address, 500);
        await dex.createLimitOrder(BUY_SIDE, LINK_TICKER, 1, 300);
        await dex.createLimitOrder(BUY_SIDE, LINK_TICKER, 1, 100);
        await dex.createLimitOrder(BUY_SIDE, LINK_TICKER, 1, 200);
        let buyOrderBook = await dex.getOrderBook(LINK_TICKER, 0);
        for (let i = 0; i < buyOrderBook.length - 1; i++) {
            assert(buyOrderBook[i].price >= buyOrderBook[i + 1].price, "Orderbook is not in correct order");
        }

    });

    //The sell orderbook should be ordered from lowest to highest in price starting at index 0
    it("should be ordered from lowest to highest in price, starting from index 0", async () => {
        let dex = await Dex.deployed()
        let link = await Link.deployed()
        await link.approve(dex.address, 500);
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 300);
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 100);
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 200);
        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, 1);
        for (let i = 0; i < sellOrderBook.length - 1; i++) {
            assert(sellOrderBook[i].price <= sellOrderBook[i + 1].price, "Orderbook is not in correct order");
        }
    });
    //When creating a sell market order, the seller needs to have enough tokens for the trade
    it("should throw an error if the seller does not have enough tokens for the sell market order", async () => { });
    
    it("should pass if the seller has enough tokens for the sell market order", async () => {});
    //When creating a buy market order, the buyer needs to have enough ETH for the trade
    it("should throw an error if the buyer does not have enough ETH for the buy market order", async () => {});
    
    it("should pass if the buyer has enough ETH for the buy market order", async () => {});
    
    //Market orders can be submitted even if the order book is empty
    it("should pass even if the market order book is empty", async () => {});
    
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    it("", async () => { });
    
    //The eth balance of the buyer should decrease with the filled amounts
    it("should decrease the ETH balance proportionally with filled amounts", async () => { });
    
    //The token balance of the seller should decrease with the filled amounts
    it("should decrease the token balance proportionally with filled amounts", async () => {});

    //Filled limit orders should be removed from the orderbook
    it("should remove limit orders from the orderbook when they are filled", async () => {});
});