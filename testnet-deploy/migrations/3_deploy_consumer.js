const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

// const SIDETOKEN_ADDRESS = '0x8bBbd80981FE76d44854D8DF305e8985c19f0e78';
const JOB_SPEC = "YOUR_JOB_ID";

module.exports = async function(deployer, networks, accounts) {
	const oracle = await Oracle.deployed();
	return deployer.deploy(Consumer, '0xa8185eA17FC1D2187dF2AA52bE3056916a82737b', oracle.address, JOB_SPEC);
};
