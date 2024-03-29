const bodyParser = require('body-parser');
const url = require('url');
const cbor = require('cbor');
const ChainlinkAPIClient = require('chainlink-api-client');
const { exec } = require('child_process');
const express = require('express');
const fs = require('fs');
const Web3 = require('web3');
const db = require('./db.js');
require('console-stamp')(console);
const qtum = require("qtumjs-eth")
const rpcURL = `http://${process.env.HEX_QTUM_ADDRESS}:@${process.env.JANUS_HOST}:${process.env.JANUS_PORT}`;
const qtumAccount = url.parse(rpcURL).auth.split(":")[0]
const rpc = new qtum.EthRPC(rpcURL, qtumAccount)
const { QtumRPC } = require('qtumjs')
const qtumConnection = new QtumRPC('http://qtum:testpasswd@qtum:3889')
// The OracleRequest event ABI for decoding the event logs
const oracleRequestAbi = [{ "indexed": true, "name": "specId", "type": "bytes32" }, { "indexed": false, "name": "requester", "type": "address" }, { "indexed": false, "name": "requestId", "type": "bytes32" }, { "indexed": false, "name": "payment", "type": "uint256" }, { "indexed": false, "name": "callbackAddr", "type": "address" }, { "indexed": false, "name": "callbackFunctionId", "type": "bytes4" }, { "indexed": false, "name": "cancelExpiration", "type": "uint256" }, { "indexed": false, "name": "dataVersion", "type": "uint256" }, { "indexed": false, "name": "data", "type": "bytes" }];

const app = express();
const port = process.env.INITIATOR_PORT || 30055;
const confirmations = 1;


let web3 = new Web3()
// The Subscriptions array holds the current job/oracle pairs that needs to be watched for events
let Subscriptions = [];

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

// Initialize the Chainlink API Client without credentials, the initiator will login using the access key and secret
let chainlink = new ChainlinkAPIClient({
	basePath: process.env.CHAINLINK_BASE_URL
});

app.use(bodyParser.json());

/* Simple logger middleware that prints the requests received on the initiator endpoints */
app.use(function (req, res, next) {
	console.info('Received ' + req.method + ' request on ' + req.baseUrl + req.originalUrl + ' URL');
	next();
});

/* Healthcheck endpoint */
app.get("/", (req, res) => {
	return res.sendStatus(200);
});

/* TODO: on delete request should delete the job from the subscriptions list */
app.delete('/initiator', (req, res) => {
	return res.sendStatus(200);
});

/* The main endpoint that receives new jobs to subscribe to */
app.post("/initiator", async (req, res) => {
	try {
		// Check for auth headers and return 401 if not present
		if (typeof req.headers['x-chainlink-ea-accesskey'] !== 'undefined' && typeof req.headers['x-chainlink-ea-secret'] !== 'undefined') {
			const outgoingAccessKey = req.headers['x-chainlink-ea-accesskey'];
			const outgoingSecret = req.headers['x-chainlink-ea-secret'];
			console.info('Received a new job from Chainlink');

			const authenticated = await chainlinkAuth(outgoingAccessKey, outgoingSecret);

			if (!authenticated) {
				return res.sendStatus(401);
			} else {
				// Add the new job to the subscriptions list
				console.info(`Adding Job ${req.body.jobId} to the subscription list...`);
				Subscriptions.push({ 'jobId': req.body.jobId, 'address': req.body.params.address });

				// Save the new subscription to database
				console.info(`Saving subscription...`);
				await saveSubscription(req.body.jobId, req.body.params.address);

				// Subscribe to QTUM node for events from that Oracle corresponding to that new job id
				newSubscription(req.body.jobId, req.body.params.address);

				return res.sendStatus(200);
			}
		} else {
			return res.sendStatus(401);
		}
	} catch (e) {
		// Print error and return 500 status code
		console.error(e);
		return res.sendStatus(500);
	}
});

/* Validates Chainlink auth credentials */
async function chainlinkAuth(outgoingAccessKey, outgoingSecret) {
	return new Promise(async function (resolve, reject) {
		const result = await db.query('SELECT outgoing_token_hash, outgoing_secret_hash FROM auth_data');
		if (result.rows.length > 0) {
			const outgoingAccessKeyHash = web3.utils.sha3(outgoingAccessKey).slice(2);
			const outgoingSecretHash = web3.utils.sha3(outgoingSecret).slice(2);
			if (outgoingAccessKeyHash == result.rows[0].outgoing_token_hash && outgoingSecretHash == result.rows[0].outgoing_secret_hash) {
				resolve(true);
			} else {
				resolve(false);
			}
		} else {
			reject('Failed auth: no auth data present');
		}
	});
}

/* Configures the initiator with a QTUM JSON-RPC instance connected to a QTUM network and tries to load the
   subscriptions file and configuration file. */
async function initiatorSetup() {
	try {
		// Configures the JSON-RPC connection to the QTUM Network.
		const connection = await setupNetwork(JANUS_CONFIG);
		console.info(`QTUM is connected to the ${JANUS_CONFIG.name} node.`);
		// Load the subscriptions from database
		let subs = await loadSubscriptions();
		if (subs.length > 0) {
			console.info('Loaded subscriptions from database');
			subs.forEach(sub => {
				Subscriptions.push({
					'jobId': sub.job,
					'address': sub.address
				});
				newSubscription(sub.job, sub.address);
			});
		} else {
			console.info('No subscriptions yet');
		}
	} catch (e) {
		console.error('Initiator setup failed:' + e);
	}
}

/* Reads the database and returns the Chainlink Node auth data */
function loadCredentials() {
	return new Promise(async function (resolve, reject) {
		const result = await db.query('SELECT * FROM auth_data');
		if (result.rows.length > 0) {
			const auth = {
				incomingAccessKey: result.rows[0].incoming_accesskey,
				incomingSecret: result.rows[0].incoming_secret
			};
			resolve(auth);
		} else {
			reject('No auth data present');
		}
	});
}

/* Loads the subscriptions list from database */
async function loadSubscriptions() {
	return new Promise(async function (resolve, reject) {
		try {
			const sql = 'SELECT * FROM subscriptions;';
			const result = await db.query(sql);
			resolve(result.rows);
		} catch (e) {
			console.error(e);
			reject(e);
		}
	});
}


/* Subscribes to the QTUM node for events emitted from the given Oracle address that contains a request
   for the specified job ID */
async function newSubscription(jobId, oracleAddress) {
	console.info(`Subscribing to Oracle at ${oracleAddress} for requests to job ID ${jobId}...`);
	let fromBlock = await rpc.getBlockNumber();
	let index = 0;
	// Topics include OracleRequest event signature and hex job Id to wait for logs for the given job
	const waitForLogsRequest = (from) => qtumConnection.rawCall('waitforlogs', [from, null, { "addresses": [oracleAddress.split('0x')[1]], "topics": ['d8d7ecc4800d25fa53ce0372f13a416d98907a7ef3d8d3bdd79cf4fe75529c65', web3.utils.toHex(jobId).split('0x')[1]] }, 1]).then((event) => {
		// Temporary workaround for one log per block
		if (typeof event.entries[index] !== 'undefined') {
			try {
				// The timer variable to increment on every log check
				let timer = 0;
				// Check every 1 sec if there are changes in the log state
				const checkLog = setInterval(() => {
					timer++;
					// The Initiator will wait MIN_INCOMING_CONFIRMATIONS blocks (30 secs per block, plus 2 more secs)
					// If the log remains unchanged after that, then will trigger the job run
					// If there is a chain reorg longer than that, the job run will be triggered again
					if (timer == ((confirmations * 30) + 2)) {
						let txid = event.entries[index].transactionHash
						qtumConnection.rawCall("gettransactionreceipt", [txid]).then((theResult) => {
							let eventData = event.entries[index].data
							let topics = theResult[0].log[0].topics
							triggerJobRun(eventData, topics, jobId, oracleAddress)
							// Call itself after triggering job run to reset.
							index++;
							waitForLogsRequest(fromBlock)
							})
					}
				}, 1000);
			} catch (e) {
				console.error(e);
			}
		}
	}).catch((e) => {
		console.log(e)
	})
	waitForLogsRequest(fromBlock)
}
/* Saves a new subscription to database */
async function saveSubscription(jobId, oracleAddress) {
	return new Promise(async function (resolve, reject) {
		try {
			const sqlInsert = `
				INSERT INTO subscriptions (address, job)
				VALUES ('${oracleAddress}', '${jobId}');
			`;
			const result = await db.query(sqlInsert);
			resolve(true);
		} catch (e) {
			console.error(e);
			reject(e);
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
				proc.stdout.on('data', (data) => {
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
		// Checks to see if connection is successful
		rpc.getBlockNumber().then((value) => {
			resolve(rpc)
		}).catch((e) => {
			console.log(e)
		})
	});
}

/* Fires a job run on Chainlink Core passing the parameters received through the event logs */
async function triggerJobRun(eventData, topics, jobId, oracleAddress) {
	// Decode the event logs
	const logs = web3.eth.abi.decodeLog(oracleRequestAbi, eventData, topics)
	const specId = logs.specId;
	console.info(`Processing Oracle Request ID ${logs.requestId}. Triggering a job run for ${specId}...`);
	// If there's request data present in the logs, then extract and decode it
	let clReq;
	if (logs.data !== null) {
		// Extract the CBOR data buffer from the log, adding the required initial and final bytes for proper format
		const encodedReq = new Buffer.from(('bf' + logs.data.slice(2) + 'ff'), 'hex');
		// Decode the Chainlink request from the CBOR data buffer
		clReq = await cbor.decodeFirst(encodedReq);
	} else {
		clReq = {};
	}
	/* Add to the request some custom parameters destined for the QTUM TX adapter:
	   @address is the address of the Oracle contract that the adapter has to call
	   @dataPrefix is the encoded parameters that the adapter will need to call the Oracle
	   @functionSelector is the selector of the Oracle fulfill function */
	clReq.address = oracleAddress;
	clReq.dataPrefix = web3.eth.abi.encodeParameters([
		'bytes32', 'uint256', 'address', 'bytes4', 'uint256'
	], [
		logs.requestId, logs.payment, logs.callbackAddr, logs.callbackFunctionId, logs.cancelExpiration
	]
	);
	// 0x4ab0d190 is the selector for the Oracle fulfillRequest() function
	clReq.functionSelector = '0x4ab0d190';
	// Load auth credentials from database
	const auth = await loadCredentials();
	// Trigger the job run, passing auth credentials and the complete request
	const newRun = await chainlink.initiateJobRun(jobId, auth.incomingAccessKey, auth.incomingSecret, clReq);
	if (!newRun.errors) {
		console.info(`Initiated job run with ID ${newRun.data.attributes.id}...`);
	} else {
		throw newRun.errors;
	}
}

const server = app.listen(port, async function () {
	console.info(`QTUM Initiator listening on port ${port}!`);
	try {
		await setupCredentials();
	} catch (e) {
		console.error(e);
		process.exit();
	}
	initiatorSetup();
});
