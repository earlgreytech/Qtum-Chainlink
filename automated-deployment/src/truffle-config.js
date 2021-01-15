/* Truffle config object */
require('dotenv')
module.exports = {
	contracts_build_directory: process.env.CONTRACTS_BUILD_DIRECTORY || './build/contracts',
	networks: {
		qtum: {
			networkCheckTimeout: 10000,
			host: process.env.JANUS_HOST,
			port: process.env.JANUS_PORT, // janus QTUM-ETH RPC bridge
			network_id: '*', // eslint-disable-line camelcase
			from: process.env.HEX_QTUM_ADDRESS,
			gasPrice: '0x64', // minimal gas for qtum
		}
	},
	compilers: {
		solc: {
			version: "0.4.24",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}
	}
}
