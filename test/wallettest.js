const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");
const truffleAssert = require('truffle-assertions');

contract("Dex", accounts => {
    it("shold only be possible for owner to add tokens", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(
            wallet.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address, { from: accounts[0] })
        );
        await truffleAssert.reverts(
            wallet.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address, { from: accounts[1] })
        );
    });

    it("should handle token deposits correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await link.approve(wallet.address, 500);
        await wallet.deposit(100, web3.utils.utf8ToHex('LINK'));
        let balance = await wallet.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
        assert.equal(balance.toNumber(), 100);
    });

    it("should handle faulty token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.reverts(wallet.withdraw(600, web3.utils.utf8ToHex('LINK')));
    });

    it("should handle valid token withdrawals correctly", async () => {
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await truffleAssert.passes(wallet.withdraw(100, web3.utils.utf8ToHex('LINK')));
    });
});
