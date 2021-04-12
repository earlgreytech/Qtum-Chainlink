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
- `automated-deployment (TESTING)`, a node script that initializes the testing environment, first deploying the LinkToken contract and
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

Before spinning up the docker containers, make sure to properly configure your `.env` files in the `qtum-initiator` and `qtumtx-adapter` folders. You will most certainly need to provide your QTUM address in hexadecimal formatting for `HEX_QTUM_ADDRESS`

#### QTUM Initiator 

 Key | Description | Example |
|-----|-------------|---------|
| `INITIATOR_HOST` | The hostname of the QTUM Initiator | `qtum-initiator` |
| `INITIATOR_NAME` | The Initiator name that will be registered on Chainlink Core | `qtuminitiator` |
| `INITIATOR_PORT` | The port where the Initiator service will be listening | `30055` |
| `CHAINLINK_BASE_URL` | The URL of the Chainlink Core service with a trailing slash | `http://chainlink-node:6688/` |
| `DATABASE_URL` | The URL of the Postgres connection | `postgresql://postgres:chainlink@postgres-server:5432/qtumtx_adapter?sslmode=disable&client_encoding=utf8&connect_timeout=5000` |
| `HEX_QTUM_ADDRESS` | The hexadecimal formatted version of your QTUM Address | `0x7926223070547d2d15b2ef5e7383e541c338ffe9` |
| `JANUS_HOST` | The hostname of the JANUS RPC-API Adapter | `janus` |
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
| `JANUS_HOST` | The hostname of the JANUS RPC-API Adapter | `janus` |
| `JANUS_PORT` | The port of the JANUS RPC-API Adapter | `23889` |


## Install

[Install Docker](https://docs.docker.com/get-docker/)

## Setting things up with Docker

Run `./spin_up.sh` in the root directory in order to spin up the necessary containers as well fund the accounts with QTUM.

Alternatively, if there's an error with the script due to fas execution, you can run the following commands in the root directory in order:

- `docker-compose -f  docker-compose.yaml up --always-recreate-deps -d`  
- `docker cp ./docker/standalone/fill_user_account.sh qtum:.`
- `docker exec qtum /bin/sh -c ./fill_user_account.sh`

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

`await` an array of hashes to return to the console.

## LinkToken

Enter `automated-deployment/src` and run `truffle migrate --f 1 --to 2 --network qtum` to deploy the LinkToken into the local testnet. It is important that you keep the address of this contract for the next steps.

## Oracle Contract

Inside of `testnet-deploy/migrations/2_deploy_oracle.js`, change the values for `LINKTOKEN_ADDRESS` to the address of your LinkToken previously deployed, and `ADAPTER_ADDRESS` to the address used to fulfill requests, `0x7926223070547d2d15b2ef5e7383e541c338ffe9` is used in the env files, so that would be our value unless a different address is used to fulfill the requests. 

Use `truffle migrate --f 2 --to 2 --network qtum` to deploy the oracle to the local testnet.

Take note of the oracle contract address.

## Job Creation via Chainlink Web UI

After deploying the LinkToken and Oracle Contract and before proceeding to the creation of the consumer contract, you will want to create a Job for your Chainlink Node located at `http://localhost:6688`

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

Next, in `testnet-deploy/migrations/3_deploy_consumer.js`, put in the values for `LINKTOKEN_ADDRESS`, `"ORACLE_ADDRESS"` from the previous migrations, and `"YOUR_JOB_ID_IN_HEX"` from the values of the job id converted to bytes32.

Then proceed to deploy the consumer contrat by running `truffle migrate --f 3 --to 3 --network qtum`

## Making a request

To test out making a request, go inside of `testnet_deploy` and run `truffle exec ./scripts/request.js --network qtum`, to trigger a jub run.

After running the script, a job will be triggered and can be seen insode of the chainlink web ui at `http://localhost:6688`, and a price can be received after the first run since the value get's stored inside of the contract `Consumer.sol` as `currentPrice`.



