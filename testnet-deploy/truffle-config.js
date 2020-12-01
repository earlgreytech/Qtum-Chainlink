const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const deployerKey = fs.readFileSync(".deployerKey").toString().trim();
const Web3 = require('web3');

// const rskNode = 'YOUR_NODE_RPC_URL';

/* Truffle config object */
module.exports = {
	contracts_directory: '../test-runner/src/contracts',
	networks: {
		qtum: {
			host: '127.0.0.1',
			port: 23889, // janus QTUM-ETH RPC bridge
			network_id: '*', // eslint-disable-line camelcase
			from: '0x7926223070547d2d15b2ef5e7383e541c338ffe9',
			gasPrice: '0x64', // minimal gas for qtum
	},
	compilers: {
		solc: {
			version: "0.5.0",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}
	}
}
