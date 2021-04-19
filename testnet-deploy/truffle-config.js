require('dotenv')

module.exports = {
	contracts_build_directory: process.env.CONTRACTS_BUILD_DIRECTORY || './build/contracts',
	networks: {
		development: {
			host: "127.0.0.1",
			port: 8545, // janus QTUM-ETH RPC bridge
			network_id: '*',
		},
		qtum: {
			host: process.env.JANUS_HOST || "localhost",
			port: process.env.JANUS_PORT || 23889, // janus QTUM-ETH RPC bridge
			network_id: '*', // eslint-disable-line camelcase
			from: process.env.HEX_QTUM_ADDRESS || "0x7926223070547d2d15b2ef5e7383e541c338ffe9",
			gasPrice: '0x64', // minimal gas for qtum
		}
	},
	compilers: {
		solc: {
			version: "0.5.17",
			settings: {
				optimizer: {
					enabled: true,
					runs: 200
				}
			}
		}
	}
}
