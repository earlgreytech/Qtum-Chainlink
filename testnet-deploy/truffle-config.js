/* Truffle config object */
module.exports = {
	contracts_directory: './contracts',
	networks: {
		qtum: {
			host: process.env.JANUS_HOST,
			port: process.env.JANUS_PORT, // janus QTUM-ETH RPC bridge
			network_id: '*', // eslint-disable-line camelcase
			from: process.env.HEX_QTUM_ADDRESS,
			gasPrice: '0x64', // minimal gas for qtum
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
