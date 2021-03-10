const Dex = artifacts.require("Dex");
const Link = artifacts.require("Link");

contract("Dex", accounts => {
    it("shold only be possible for owner to add tokens", async () => {
        await deployer.deploy(Link);
        let dex = await Dex.deployed();
        let link = await Link.deployed();
        await dex.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address);
    })
})