const ChainlinkAPIClient = require('chainlink-api-client');
const fs = require('fs');
const db = require('./db.js');

const ADAPTER_NAME = 'qtumtxadapter';

let chainlinkEmail, chainlinkPass;
[ chainlinkEmail, chainlinkPass ] = fs.readFileSync('./.api', 'utf8').trim().split("\n");

const chainlink = new ChainlinkAPIClient({
	email: chainlinkEmail,
	password: chainlinkPass,
	basePath: process.env.CHAINLINK_BASE_URL || 'http://localhost:6688'
});

runUninstall();

async function runUninstall(){
	await chainlink.login();
	const result = await chainlink.deleteBridge(ADAPTER_NAME);
	if (!result.errors){
		if (typeof result.data !== 'undefined'){
			console.log('[INFO] - QTUM TX Adapter successfully removed from Chainlink node.');
		}else{
			console.log(result);
		}
		await deleteCredentials();
	}else{
		console.log(result.errors);
	}
	await chainlink.logout();
	process.exit();
}

async function deleteCredentials(){
	return new Promise (async function(resolve, reject){
		try {
			const sqlDelete = `
				TRUNCATE TABLE auth_data;
			`;
			await db.query(sqlDelete);
			console.log('[INFO] - Auth credentials on database have been deleted.');
			resolve(true);
		}catch(e){
			console.log(e);
			reject(e);
		}
	});
}
