const fs = require('fs');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const deployerKey = fs.readFileSync(".deployerKey").toString().trim();
const Web3 = require('web3');

// Setup different configurations if the project is running from inside a Docker container. If not, use defaults
const eth = {
	host: process.env.ETHEREUM_HOST || 'localhost',
	port: process.env.ETHEREUM_WS_PORT || 8546,
	url: process.env.ETHEREUM_WS_URL || '/'
}
const qtum = {
	host: process.env.QTUM_HOST || 'localhost',
	port: process.env.QTUM_PORT || 4444,
	url: process.env.QTUM_URL || '/2.0.1'
}

const eth_url = `ws://${eth.host}:${eth.port}${eth.url}`;
const qtum_url = `http://${qtum.host}:${qtum.port}${qtum.url}`;

/* Truffle config object */
module.exports = {
	contracts_build_directory: process.env.CONTRACTS_BUILD_DIRECTORY || './build/contracts',
	networks: {
		fund_gethdev: {
			host: eth.host,
			port: eth.port,
			network_id: "*",
			gas: 5000000,
			url: eth_url,
			websockets: true
		},

		fund_regtest: {
			host: qtum.host,
			port: qtum.port,
			network_id: "*",
			gas: 5000000,
			url: qtum_url
		},

		gethdev: {
			provider: () => new HDWalletProvider(deployerKey, eth_url),
			network_id: "*",
			gas: 5000000,
			url: eth_url,
			websockets: true
		},

		regtest: {
			provider: () => new HDWalletProvider(deployerKey, qtum_url),
			network_id: "*",
			gas: 5000000,
			url: qtum_url
		}
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
