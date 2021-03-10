const Link = artifacts.require("Link");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Link);
  let dex = await Dex.deployed();
  let link = await Link.deployed();
  await dex.addTokenSupport(web3.utils.utf8ToHex('LINK'), link.address);
  await link.approve(dex.address, 500);
  await dex.deposit(100, web3.utils.utf8ToHex('LINK'));
  let balanceOfLink = await dex.balances(accounts[0], web3.utils.utf8ToHex('LINK'));
  console.log(balanceOfLink);
};
