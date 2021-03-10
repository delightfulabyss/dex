const Wallet = artifacts.require("Dex");

module.exports = function (deployer) {
  deployer.deploy(Dex);
};
