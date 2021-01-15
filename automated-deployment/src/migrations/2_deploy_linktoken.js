const LinkToken = artifacts.require("LinkToken");

module.exports = async function(deployer, network, accounts) {
	return deployer.deploy(LinkToken);
};
