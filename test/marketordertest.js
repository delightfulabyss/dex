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
        let balance = await dex.balances(accounts[0], LINK_TICKER);
        assert.equal(balance.toNumber(), 0, "Initial LINK balance is not 0");
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
        let balance = await dex.balances(accounts[0], ETH_TICKER);
        assert.equal(balance.toNumber(), 0, "Initial ETH balance is not 0");
        await truffleAssert.reverts(
            dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
        );
    });
    
    // it("should pass if the buyer has enough ETH for the buy market order", async () => {
    //     let dex = await Dex.deployed();
    //     let link = await Link.deployed();
    //     dex.depositEth({ value: web3.utils.toWei('5', 'ether') });
    //     let balance = await dex.balances(accounts[0], ETH_TICKER);
    //     assert(balance.toNumber(), 5, "Initial ETH balance is not 5");
    //     await truffleAssert.reverts(
    //         dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
    //     );
    // });
    
    //Market orders can be submitted even if the order book is empty
    it("should pass even if the market order book is empty", async () => {
        let dex = await Dex.deployed();
        await dex.depositEth({ value: web3.utils.toWei("1", 'ether') });
        let buyOrderBook = await dex.getOrderBook(LINK_TICKER, 0);
        assert.equal(buyOrderBook.length, 0, "Buy orderbook is not empty");
        await truffleAssert.passes(
            dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10)
        );
    });

    
    //Market orders should be filled until the order book is empty or the market order is 100% filled
    it("should not fill more limit orders than the market order amount", async () => {
        let dex = await Dex.deployed();
        let link = await Dex.deployed();

        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, 1);
        assert.equal(sellOrderBook.length, 0, "Orderbook is not empty");

        await dex.addTokenSupport(LINK_TICKER, link.address);

        //Send LINK tokens to accounts 1-3 from account 0
        await link.transfer(accounts[1], 50);
        await link.transfer(accounts[2], 50);
        await link.transfer(accounts[3], 50);

        //Approve dex address for accounts 1, 2, 3
        await link.approve(dex.address, 50, { from: accounts[1] });
        await link.approve(dex.address, 50, { from: accounts[2] });
        await link.approve(dex.address, 50, { from: accounts[3] });

        //Deposit LINK into dex for accounts 1, 2, 3 
        await dex.deposit(50, LINK_TICKER, { from: accounts[1] });
        await dex.deposit(50, LINK_TICKER, { from: accounts[2] });
        await dex.deposit(50, LINK_TICKER, { from: accounts[3] });

        //Fill sell orderbook with 3 limit orders
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 300, { from: accounts[1] });
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 400, { from: accounts[2] });
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 500, { from: accounts[3] });

        //Create market order that should fill 2/3 of the orders in the orderbook
        await dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 10);

        sellOrderBook = await dex.getOrderBook(LINK_TICKER, 1);
        assert.equal(sellOrderBook.length, 1, "Sell orderbook should only have 1 order left");
        assert.equal(sellOrderBook[0].filled, 0, "Sell orderbook should have 0 orders filled");
     });

    it("should fill market orders until the orderbook is empty", async () => {
        let dex = await Dex.deployed();       

        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, 1);
        assert.equal(sellOrderBook.length, 1, "Sell orderbook should only have 1 order left");

        //Fill sell orderbook again for a total of 3
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 300, { from: accounts[1] });
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 400, { from: accounts[2] });

        //Get link balance of buyer before link purchase
        let balanceBefore = await dex.balances(accounts[0], LINK_TICKER);

        //Create market order thant could fill more than the entire orderbook (15 link)
        await dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 50);

        //Get link balance of buyer after link purchase 
        let balanceAfter = await dex.balances(accounts[0], LINK_TICKER);

        //Verify buyer should only have 15 more link after purchase, event though the buy order was for 50
        assert.equal(balanceBefore + 15, balanceAfter);
        
     });
    
    //The eth balance of the buyer should decrease with the filled amounts
    it("should decrease the ETH balance proportionally with filled amounts", async () => {
        let dex = await Dex.deployed();
        let link = await Dex.deployed();

        //Seller deposits link and creates a sell limit order for 1 link and 300 wei
        await link.approve(dex.address, 500, { from: accounts[1] });
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 300, { from: accounts[0] });

        //Check buyer ETH balance before trade
        let balanceBefore = await dex.balances(accounts[0], ETH_TICKER);
        await dex.createMarketOrder(BUY_SIDE, 1);
        let balanceAfter = await dex.balances(accounts[0], ETH_TICKER);

        assert.equal(balanceBefore - 300, balanceAfter);
    });
    
    //The token balance of the seller should decrease with the filled amounts
    it("should decrease the token balance proportionally with filled amounts", async () => {
        let dex = await Dex.deployed();
        let link = await Dex.deployed();

        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, 1);
        assert.equal(sellOrderBook.length, 0, "Sell orderbook should be empty");

        //Seller account[1] already has approved and deposited link
        //Deposit link for account[2]
        await link.approve(dex.address, 500, { from: accounts[2] });
        await dex.deposit(100, LINK_TICKER, { from: accounts[2] });

        //Create 2 sell limit orders for 1 link each
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 300, { from: accounts[1] });
        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 400, { from: accounts[2] });
        
        //Get seller link balances before trade
        let account1BalanceBefore = await dex.balances(accounts[1], LINK_TICKER);
        let account2BalanceBefore = await dex.balances(accounts[2], LINK_TICKER);

        //Account[0] creats market order that consumes both limit orders
        await dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 2);

        //Get seller link balances after trade
        let account1BalanceAfter = await dex.balances(accounts[1], LINK_TICKER);
        let account2BalanceAfter = await dex.balances(accounts[2], LINK_TICKER);

        assert.equal(account1BalanceBefore - 1, account1BalanceAfter);
        assert.equal(account2BalanceBefore - 1, account2BalanceAfter);
    });

    //Filled limit orders should be removed from the orderbook
    it("should remove limit orders from the orderbook when they are filled", async () => {
        let dex = await Dex.deployed();

        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, SELL_SIDE);
        assert.equal(sellOrderBook.length, 0, "Sell orderbook should be empty before trade");

        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 1, 300, { from: accounts[1] });
        await dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 1);

        sellOrderBook = await dex.getOrderBook(LINK_TICKER, SELL_SIDE);
        assert.equal(sellOrderBook.length, 0, "Sell orderbook should be empty after trade");

    });

    //Partially-filled limit orders should be modified to represent the remaining amount
    it("should modify partially-filled limit orders to represent the remaining amount", async () => {
        let dex = await Dex.deployed();
        let link = await Dex.deployed();

        let sellOrderBook = await dex.getOrderBook(LINK_TICKER, SELL_SIDE);
        assert.equal(sellOrderBook.length, 0, "Sell orderbook should be empty before trade");

        await dex.createLimitOrder(SELL_SIDE, LINK_TICKER, 5, 300, { from: accounts[1] });
        await dex.createMarketOrder(BUY_SIDE, LINK_TICKER, 2);

        sellOrderBook = await dex.getOrderBook(LINK_TICKER, SELL_SIDE);
        assert.equal(sellOrderBook[0].filled, 2, "Filled property was not updated correctly");
        assert.equal(sellOrderBook[0].amount, 5, "Amount is not correct");
    });
});