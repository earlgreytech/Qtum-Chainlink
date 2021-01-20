# Chainlink-QTUM Integration MVP

This repository contains an MVP boilerplate for testing the integration of Chainlink Oracle services with the QTUM blockchain network.
The objective is to provide external data to a Consumer contract deployed on QTUM network through the Chainlink Oracle system,
using a simple and natural way to join both services thanks to the help of an external initiator and external adapter. 

`Consumer contract => Oracle contract => QTUM Initiator => Chainlink => QTUM TX Adapter => Oracle contract => Consumer contract`

## Services:

This boilerplate has 6 services, each running in its own Docker container

- `chainlink-node`, a Chainlink node for testing with qtum-initiator and qtumtx-adapter bridges, using the develop Docker image.
- `postgres-server`, a PostgreSQL server for the Chainlink node, QTUM Initiator and QTUMTX Adapter databases.
- `qtum`, a single QTUM node configured to work on regtest network (private development network), using latest Docker image.
- `janus`, a QTUM adapter to the ETH JSON-RPC node configured to work with the qtum node (private development network), using latest Docker image.
- `qtum-initiator`, an external initiator connected to the QTUM node that reads the event log from an Oracle contract and invokes a job run. A new
run created by the QTUM Initiator is automatically given the parameters needed for the QTUM TX adapter task to report the run
back to the contract that originally created the event log, just like the native Runlog initiator.
- `qtumtx-adapter`, an external adapter connected to the QTUM node that takes the input given and places it into the data field of a transaction, just like the native EthTx adapter. It then signs the transaction and sends it to an address on QTUM network.
- `automated-deployment`, a node script that initializes the testing environment, first deploying the LinkToken contract and
   an Oracle contract. Then configures the Chainlink node, creating a job that uses the QTUM Initiator and QTUM TX adapter.
   Once the Chainlink node is ready, it deploys a Consumer contract configured with the previously deployed LinkToken and
   Oracle contracts, and the previously created job. Then mints tokens and send some to the Consumer contract. Finally it
   calls the requestQTUMPrice of the Consumer contract and then polls for current price. */

## Contracts:

- `Oracle`, the Oracle contract is the 0.5 version
- `Link`, is the contract that will be deployed on the QTUM network, mirroring the LinkToken contract deployed on Ethereum network (deployed via Remix as it has a different solc version than majority of contracts).
- `Consumer`, is the contract that will request the data to the Oracle. On test run, it will request last traded price of QTUM/BTC pair from Liquid.com exchange.

Note: solc version I used is: `0.5.17+commit.d19bba13.Darwin.appleclang`

## .env Configuration

Before spinning up the docker containers, make sure to properly configure your `.env` files in the `qtum-initiator` and `qtumtx-adapter` folders. You will most certainly need to provide your QTUM address in hexadecimal formatting for `HEX_QTUM_ADDRESS` and you may run into issues when working with your docker containers locally, if the `qtum-initiator` or `qtumtx-adapter` return an error along the lines of localhost as the host name is incorrect or `Error: connect ECONNREFUSED 127.0.0.1:23889`, you will find it helpful to change the `JANUS_HOST` from `localhost` to your private ip address by running `ifconfig` and finding your inet address which should be identifiable in the `en0:` object.

#### QTUM Initiator 

 Key | Description | Example |
|-----|-------------|---------|
| `INITIATOR_HOST` | The hostname of the QTUM Initiator | `qtum-initiator` |
| `INITIATOR_NAME` | The Initiator name that will be registered on Chainlink Core | `qtuminitiator` |
| `INITIATOR_PORT` | The port where the Initiator service will be listening | `30055` |
| `CHAINLINK_BASE_URL` | The URL of the Chainlink Core service with a trailing slash | `http://chainlink-node:6688/` |
| `DATABASE_URL` | The URL of the Postgres connection | `postgresql://postgres:chainlink@postgres-server:5432/qtumtx_adapter?sslmode=disable&client_encoding=utf8&connect_timeout=5000` |
| `HEX_QTUM_ADDRESS` | The hexadecimal formatted version of your QTUM Address | `0x7926223070547d2d15b2ef5e7383e541c338ffe9` |
| `JANUS_HOST` | The hostname of the JANUS RPC-API Adapter | `localhost` |
| `JANUS_PORT` | The port of the JANUS RPC-API Adapter | `23889` |

#### QTUMTX Adapter

 Key | Description | Example |
|-----|-------------|---------|
| `ADAPTER_HOST` | The hostname of the QTUM Initiator | `qtumtx-adapter` |
| `ADAPTER_NAME` | The Initiator name that will be registered on Chainlink Core | `qtumtxadapter` |
| `ADAPTER_PORT` | The port where the Initiator service will be listening | `30056` |
| `CHAINLINK_BASE_URL` | The URL of the Chainlink Core service with a trailing slash | `http://chainlink-node:6688/` |
| `DATABASE_URL` | The URL of the Postgres connection | `postgresql://postgres:chainlink@postgres-server:5432/qtumtx_adapter?sslmode=disable&client_encoding=utf8&connect_timeout=5000` |
| `HEX_QTUM_ADDRESS` | The hexadecimal formatted version of your QTUM Address | `0x7926223070547d2d15b2ef5e7383e541c338ffe9` |
| `JANUS_HOST` | The hostname of the JANUS RPC-API Adapter | `localhost` |
| `JANUS_PORT` | The port of the JANUS RPC-API Adapter | `23889` |


## Install

[Install Docker](https://docs.docker.com/get-docker/)

## Install QTUM Core

Install qtum here: https://github.com/qtumproject/qtum/releases

After installing and running, you will want to export the `/bin` folder to your PATH.


## Automated Deployment Script

If you are planning on running the automated-deployment docker service, at this point you can just run `./spin_up.sh` in the root directory, else follow the instructions below for manual testing.

## Build qtumjs-eth

The qtumjs-eth package requires running an internal build command, so before proceeding to the next step, follow the following instructions to avoid module not found issues.

`cd qtum-initiator/src && yarn`

`cd qtumtx-adapter/src && yarn`

`cd testnetdeploy && yarn`

## Run Local Development Setup

<bold>IMPORTANT:</bold> If you do not intend to run the `spin_up.sh` shell script, at this point, you should go into the `docker-compose.yaml` file and comment out lines 97-122.

To start the services, simply run:

```bash
docker-compose up
```
Docker will download the required images, build the containers and start services.

To stop the containers and delete the volumes, so that the configuration and chain resets:

```bash
docker-compose down -v
```

## Fill QTUM Accounts for Gas

`cd docker/standalone`

`chmod 755 fill_user_account.sh`

`./fill_user_account.sh`

`await` an array of hashes to return to the console. ;)

## Install Solar Smart Contract Deployment Tool

After following the instructions for setting up Solar at https://github.com/qtumproject/solar, you will likely need to add solar to your path for access in other directories.

## LinkToken

If you running this on a private QTUM network/regtest mode, you are going to need to deploy the LinkToken contract for further interaction with the services. You can deploy via Remix (point endpoint to http://localhost:23889) or Solar, but Remix may be a better choice to deploy as the majority of the other contracts we will be interacting with are not compatible with the LinkToken solidity version.

## Oracle Contract

To deploy the Oracle Contract, run the following command replacing LINKTOKEN_ADDRESS with the LinkToken Address from the previously deployed LinkToken smart contract. Replace HEX_QTUM_ADDRESS with the hexadecimal formatted version of your QTUM address.

`cd testnet-deploy`

`solar deploy contracts/Oracle.sol '[LINKTOKEN_ADDRESS]' --eth_rpc=http://HEX_QTUM_ADDRESS:@localhost:23889 --gasPrice=0.0000001 --force`

Take note of the oracle contract address returned by Solar for use later.

Note: If an error is returned noting that localhost as the host name is incorrect or `Error: connect ECONNREFUSED 127.0.0.1:23889`, you will need to run `ifconfig` and find you inet address which should be identifiable in the `en0:` object.

Next, you will need to set the ETH_RPC environment variable and allow the adapter to fulfill oracle requests by running the following command. Once again, replace HEX_QTUM_ADDRESS with the hexadecimal formatted version of your QTUM address in both the export call and `setFulfillmentPermission` call.

`export ETH_RPC=http://HEX_QTUM_ADDRESS:@localhost:23889`

`node scripts/oracle-fulfill.js setFulfillmentPermission HEX_QTUM_ADDRESS true`

## Job Creation via Chainlink Web UI

After deploying the LinkToken and Oracle Contract and before proceeding to the creation of the consumer contract, you will want to create a Job for your Chainlink Node.

Use the following template to create the job, replacing ORACLE_CONTRACT_ADDRESS with the Oracle Contract address returned from solar.

```json
{
	"initiators": [
		{
			"type": "external",
			"params": {
				"name": "qtuminitiator",
				"body": {
					"address": ORACLE_CONTRACT_ADDRESS
				}
			}
		}
	],
	"tasks": [
		{
			"type": "httpget"
		},
		{
			"type": "jsonparse"
		},
		{
			"type": "multiply"
		},
		{
			"type": "ethuint256"
		},
		{
			"type": "qtumtxadapter"
		}
	]
}
```
Take note of the Job Id use https://web3-type-converter.onbrn.com/ or a different method to convert the string returned to bytes32.


## Consumer Contract

The consumer contract will allow you to `requestQTUMPrice` and return the `price`, run the following command replacing LINKTOKEN_ADDRESS, ORACLE_CONTRACT_ADDRESS, and BYTES32_JOB_ID with the previous collected values.

`cd testnet-deploy`

`solar deploy contracts/Consumer.sol '[LINKTOKEN_ADDRESS, ORACLE_CONTRACT_ADDRESS, BYTES32_JOB_ID]' --eth_rpc=http://0x7926223070547d2d15b2ef5e7383e541c338ffe9:@localhost:23889 --gasPrice=0.0000001 --force`

Note: If an error is returned noting that localhost as the host name is incorrect or `Error: connect ECONNREFUSED 127.0.0.1:23889`, you will need to run `ifconfig` and find you inet address which should be identifiable in the `en0:` object.

Next, you will run `node scripts/consumer-request.js requestQTUMPrice` which will broadcast a Chainlink Request, the external initiator will pick up on a new subscription from the Chainlink Node, encode the data and initiate a job run, triggering a POST request to the /adapter endpoint which will fulfill the Oracle Request and post the data on-chain via the qtumtxadapter.

We should now be able to query the `price` by running the following command...

`node scripts/consumer-request.js requestCurrentPrice`

