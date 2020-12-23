const bodyParser = require('body-parser');
const ChainlinkAPIClient = require('chainlink-api-client');
const { exec } = require('child_process');
const express = require('express');
const db = require('./db.js');
const fs = require('fs');
const url = require('url');
const Web3 = require('web3');
require('console-stamp')(console);
const qtum = require("qtumjs-eth")
const rpcURL = `http://${process.env.HEX_QTUM_ADDRESS}:@${process.env.JANUS_HOST}:${process.env.JANUS_PORT}`;
const qtumAccount = url.parse(rpcURL).auth.split(":")[0]
const rpc = new qtum.EthRPC(rpcURL, qtumAccount)
const { QtumRPC } = require('qtumjs')
const qtumConnection = new QtumRPC('http://qtum:testpasswd@qtum:3889')
const app = express();
const port = process.env.ADAPTER_PORT || 30056;

let web3 = new Web3();
// Handle the TX count through the currentNonce variable
let currentNonce;

// Setup different configurations if the project is running from inside a Docker container. If not, use defaults
const JANUS_NODE = {
	protocol: 'http',
	hexqtumaddress: process.env.HEX_QTUM_ADDRESS,
	host: process.env.JANUS_HOST || 'localhost',
	port: process.env.JANUS_PORT || 23889,
};
const JANUS_CONFIG = {
	'name': 'JANUS',
	'shortname': 'ETH JSON-RPC ADAPTER',
	'url': `http://${JANUS_NODE.hexqtumaddress}:@${JANUS_NODE.host}:${JANUS_NODE.port}`
};

// Initialize the Chainlink API Client without credentials, the adapter will login using the token
let chainlink = new ChainlinkAPIClient({
	basePath: process.env.CHAINLINK_BASE_URL
});

app.use(bodyParser.json());

// Simple logger middleware that prints the requests received on the adapter endpoints
app.use(function (req, res, next) {
	console.info('Received ' + req.method + ' request on ' + req.baseUrl + req.originalUrl + ' URL');
	next();
});

// Healthcheck endpoint
app.get("/", (req, res) => {
	return res.sendStatus(200);
});

// The main endpoint that receives Chainlink requests
app.post("/adapter", async (req, res) => {
	// Checks if it is a valid request
	if ((typeof req.body.id !== 'undefined') && (typeof req.body.data !== 'undefined')) {
		try {
			if (typeof req.headers['authorization'] !== 'undefined') {
				const outgoingToken = req.headers['authorization'].slice(7);
				const authenticated = await chainlinkAuth(outgoingToken);
				if (!authenticated) {
					return res.sendStatus(401);
				} else {
					const runId = req.body.id;
					console.info(`Adapter received fulfillment request for run id ${runId}`);
					// Process the request while sending pending status to Chainlink
					processRequest(runId, req.body.data);
					var rJson = JSON.stringify({
						"jobRunID": runId,
						"data": {},
						"status": "pending",
						"pending": true,
						"error": null
					});
					return res.send(rJson);
				}
			} else {
				return res.sendStatus(401);
			}
		} catch (e) {
			// On error, print it and report to Chainlink
			console.error(e);
			var rJson = JSON.stringify({
				"jobRunID": runId,
				"data": {},
				"status": "errored",
				"error": "Error trying to fulfill request"
			});
			return res.send(rJson);
		}
	} else {
		return res.sendStatus(400);
	}
});

/* Configures the adapter with a web3 instance connected to a QTUM network and sets up the adapter's wallet */
async function adapterSetup() {
	try {
		// Configures the JSON-RPC connection to the QTUM Network.
		const connection = await setupNetwork(JANUS_CONFIG);
		console.info(`QTUM is connected to the ${JANUS_CONFIG.name} node.`);
		// Initialize currentNonce variable with current account's TX count, may need pending here
		currentNonce = await rpc.getTransactionCount('qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW', 'pending');
	} catch (e) {
		console.error('Adapter setup failed:' + e);
	}
}

/* Validates Chainlink auth credentials */
async function chainlinkAuth(outgoingToken) {
	return new Promise(async function (resolve, reject) {
		const result = await db.query('SELECT outgoing_token_hash FROM auth_data');
		if (result.rows.length > 0) {
			const outgoingTokenHash = web3.utils.sha3(outgoingToken).slice(2);
			if (outgoingTokenHash == result.rows[0].outgoing_token_hash) {
				resolve(true);
			} else {
				resolve(false);
			}
		} else {
			reject('Failed auth: no auth data present');
		}
	});
}

/* Fulfills a Chainlink request sending the given data to the specified address.
   functionSelector and dataPrefix params are optional, but if the request comes
   from the QTUM Initiator, they are surely present */
async function fulfillRequest(req) {
	console.log(req)
	return new Promise(async function (resolve, reject) {
		let functionSelector = '', dataPrefix = '', encodedFulfill = '0x';
		if (typeof req.functionSelector !== 'undefined') {
			functionSelector = req.functionSelector.slice(2);
		}
		if (typeof req.dataPrefix !== 'undefined') {
			dataPrefix = req.dataPrefix.slice(2);
		}
		// Concatenate the data
		encodedFulfill += functionSelector + dataPrefix + req.result.slice(2);
		const gasPrice = parseInt(await rpc.getGasPrice() * 1.3);
		// TX params
		// Sign the transaction with the adapter's private key (Janus already has a copy, no need to pass as argument)
		const signed = await rpc.rawCall('eth_signTransaction', [{
			from: process.env.HEX_QTUM_ADDRESS,
			to: req.address,
			gas: "0x2dc6c0",
			gasPrice: "0x64",
			nonce: web3.utils.toHex(parseInt(currentNonce)),
			data: encodedFulfill,
		}])
		if (signed) {
			rpc.rawCall('eth_sendRawTransaction', [signed]).then((txid) => {
				rpc.rawCall('eth_getTransactionReceipt', [txid]).then((receipt) => {
					console.info('Fulfill Request TX has been mined: ' + receipt.transactionHash);
					if ((typeof receipt.status !== 'undefined') && (typeof receipt.logs !== 'undefined')) {
						console.info(`Transaction ${receipt.transactionHash} is in TX Pool`);
						// Increment nonce for the next TX
						currentNonce++;
						resolve(receipt.transactionHash);
					} else {
						reject(receipt);
					}
				}).catch(async function (e) {
					console.log(JSON.stringify(e))
				})
			}).catch(async function (e) {
				console.log(e)
				// If the nonce counter is wrong, correct it and try again
				if (e.toString().indexOf('nonce too high') > -1 || e.toString().indexOf('Transaction was not mined within') > -1 || e.toString().indexOf('nonce too low') > -1) {
					console.info('There was a nonce mismatch, will correct it and try again...');
					currentNonce = await rpc.getTransactionCount('qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW', 'pending');
					fulfillRequest(req).then(tx => {
						resolve(tx);
					}).catch(e => {
						reject(e);
					});
				} else {
					reject(e);
				}
			})
		}
	}
	)
}
/* Reads the database and returns the Chainlink Node auth data */
function loadCredentials() {
	return new Promise(async function (resolve, reject) {
		const result = await db.query('SELECT * FROM auth_data');
		if (result.rows.length > 0) {
			const auth = {
				incomingToken: result.rows[0].incoming_token
			};
			resolve(auth);
		} else {
			reject('No auth data present');
		}
	});
}

/* Tries to fulfill a request and sends the TX hash to Chainlink */
async function processRequest(runId, reqData) {
	const auth = await loadCredentials();
	fulfillRequest(reqData).then(async function (tx) {
		const data = {
			"id": runId,
			"data": {
				"result": tx
			},
			"status": "completed",
			"pending": false
		}
		// Update the job run, passing auth credentials and data object
		const updateRun = await chainlink.updateJobRun(auth.incomingToken, data);
		if (!updateRun.errors) {
			console.info(`Updated job run with ID ${updateRun.data.attributes.id} status: COMPLETED`);
		} else {
			throw updateRun.errors;
		}
	}).catch(async e => {
		console.error(e);
		const data = {
			"id": runId,
			"data": {},
			"status": "errored",
			"error": "Error trying to fulfill request"
		}
		// Update the job run, passing auth credentials and data object
		const updateRun = await chainlink.updateJobRun(auth.incomingToken, data);
		if (!updateRun.errors) {
			console.info(`Updated job run with ID ${updateRun.data.attributes.id} status: ERRORED`);
		} else {
			throw updateRun.errors;
		}
	});
}

/* Runs the setup script and checks if the Chainlink Node auth data is present */
async function setupCredentials() {
	return new Promise(async function (resolve, reject) {
		try {
			if (process.env.DATABASE_URL) {
				const proc = exec('npm run setup', async (error, stdout, stderr) => {
					if (!error) {
						const result = await db.query('SELECT * FROM auth_data');
						if (result.rows.length > 0) {
							resolve();
						} else {
							reject('No auth data present');
						}
					} else {
						reject(error);
					}
				});
				proc.stdout.on('data', function (data) {
					process.stdout.write(data);
				});
			} else {
				console.error('DATABASE_URL environment variable is not set. Exiting...');
				reject();
			}
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}

/* Creates a new QTUM JSON-RPC instance connected to the specified network */
function setupNetwork(node) {
	return new Promise(async function (resolve, reject) {
		console.log(`[INFO] - Waiting for ${node.name} node to be ready, connecting to ${node.url}`);
		rpc.getBlockNumber().then((value) => {
			resolve(rpc)
		}).catch((e) => {
			console.log(e)
		})
	});
}

const server = app.listen(port, async function () {
	console.info(`QTUM TX Adapter listening on port ${port}!`);
	try {
		await setupCredentials();
	} catch (e) {
		console.error(e);
		process.exit();
	}
	adapterSetup();
});
