const Link = artifacts.require("Link");
const Wallet = artifacts.require("Wallet");

module.exports = async function (deployer) {
  await deployer.deploy(Link);
  let wallet = await Wallet.deployed();
  let link = await Link.deployed();
  await link.approve(wallet.address, 500);
  await wallet.deposit(100, web3.utils.utf8ToHex('LINK'));
};
