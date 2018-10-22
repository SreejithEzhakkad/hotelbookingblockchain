var Hotel = artifacts.require("./Hotel.sol");

module.exports = function(deployer) {
  deployer.deploy(Hotel);
};
