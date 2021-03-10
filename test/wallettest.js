const Dex = artifacts.require("Dex");

contract("Dex", accounts => {
    it("shold only be possible for owner to add tokens", async () => {
    await deployer.deploy(Link);
    let wallet = await Wallet.deployed();
    let link = await Link.deployed();
    await wallet.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address);
    await link.approve(wallet.address, 500);
    })
})