const Dex = artifacts.require("Dex");

contract("Dex", accounts => {
    it("shold only be possible for owner to add tokens", async () => {
    await deployer.deploy(Link);
    let dex = await Dex.deployed();
    await dex.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address);
    })
})