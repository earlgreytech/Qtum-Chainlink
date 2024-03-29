const fs = require('fs');
const LinkToken = artifacts.require("LinkToken");
const Oracle = artifacts.require("Oracle");
const Consumer = artifacts.require("Consumer");

module.exports = async function(deployer, networks, accounts) {
	const linkToken = await LinkToken.deployed();
	const oracle = await Oracle.deployed();
	const jobSpec = await getJobSpec();

	return deployer.deploy(Consumer, linkToken.address, oracle.address, jobSpec);
};

/* Reads the configuration file generated by the test runner and returns the ID
   of the job created on the Chainlink node */
function getJobSpec(){
	return new Promise(async function(resolve, reject){
		fs.readFile('./job.json', 'utf8', (err, data) => {
			if (err) throw err;
			const jobSpec = web3.utils.utf8ToHex(JSON.parse(data).jobId);
			resolve(jobSpec);
		}).catch(e => {
			reject(e);
		});
	});
}
