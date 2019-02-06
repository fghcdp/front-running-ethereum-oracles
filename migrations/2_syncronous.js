var SynchronousOracle = artifacts.require("./SynchronousOracle.sol");
var SynchronousConsumer = artifacts.require("./SynchronousConsumer.sol");

module.exports = function(deployer, _network, acounts) {
  deployer.deploy(SynchronousOracle, acounts[1]).then(function() {
  	return deployer.deploy(SynchronousConsumer, SynchronousOracle.address);
	});;
};
