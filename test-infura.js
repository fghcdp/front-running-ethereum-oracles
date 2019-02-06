const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.HttpProvider(("https://ropsten.infura.io/v3/<INFURA_API_KEY>")))

const CONSUMER_ABI = require("./build/contracts/SynchronousConsumer.json").abi
const ORACLE_ABI = require("./build/contracts/SynchronousOracle.json").abi

const CONSUMER_KEY = "<CONSUMER_PRIVATE_KEY>"
const ORACLE_KEY = "<ORACLE_PRIVATE_KEY>"
const CONSUMER_CONTRACT_ADDRESS = "<CONSUMER_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_CONTRACT_ADDRESS = "<ORACLE_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_ADDRESS = "<ORACLE_ADDRESS_ALL_UPPER_CASE>"
const CONSUMER_ADDRESS = "<CONSUMER_ADDRESS_ALL_UPPER_CASE>"

const OracleContract = new web3.eth.Contract(ORACLE_ABI, ORACLE_CONTRACT_ADDRESS)
const ConsumerContract = new web3.eth.Contract(CONSUMER_ABI, CONSUMER_CONTRACT_ADDRESS)

const REQUEST_PAYOUT = ConsumerContract.methods.requestPayout().encodeABI()
const RESET_ORACLE = OracleContract.methods.update(1).encodeABI()

const testFrontrun = async () => {
  let race = false
  do {
    race = false
    try {
      const tx = {
        nonce: await web3.eth.getTransactionCount(CONSUMER_ADDRESS),
        to: CONSUMER_CONTRACT_ADDRESS,
        data: REQUEST_PAYOUT,
        from: CONSUMER_ADDRESS,
        gas: 30000
      }
      const signedRequest = await web3.eth.accounts.signTransaction(tx, "0x" + CONSUMER_KEY)
      await web3.eth.sendSignedTransaction(signedRequest.rawTransaction)
    } catch (e) {
      console.log("Request failed, sleeping 5s: " + e.message)
      await new Promise(resolve => setTimeout(resolve, 5000))
      race = true
    };
  } while (race)
  return ConsumerContract.methods.payout().call()
}

const resetOracle = async () => {
  let race = false
  do {
    race = false
    try {
      const tx = {
        nonce: await web3.eth.getTransactionCount(ORACLE_ADDRESS),
        to: ORACLE_CONTRACT_ADDRESS,
        data: RESET_ORACLE,
        from: ORACLE_ADDRESS,
        gas: 30000
      }
      const signedRequest = await web3.eth.accounts.signTransaction(tx, "0x" + ORACLE_KEY)
      await web3.eth.sendSignedTransaction(signedRequest.rawTransaction)
    } catch (e) {
      console.log("Reseting failed, sleeping 10s: " + e.message)
      await new Promise(resolve => setTimeout(resolve, 10000))
      race = true
    };
  } while (race)
}

(async () => {
  const initialBlockNumber = await web3.eth.getBlockNumber()
  const initialBlock = await web3.eth.getBlock(initialBlockNumber)
  const oldBlock = await web3.eth.getBlock(initialBlockNumber - 500)
  // Default to 15 Seconds if there are problems fetching the Data
  const blockTimeBefore = (initialBlock && oldBlock && ((initialBlock.timestamp - oldBlock.timestamp) / 500)) || 15.00
  console.log("Average block time before the Experiment (used as max sleep time): " + blockTimeBefore)
  let successes = 0
  const tries = 1
  for (let i = 1; i <= tries; i++) {
    await resetOracle()
    await new Promise(resolve => setTimeout(resolve, ((Math.floor(Math.random() * blockTimeBefore)) * 1000)))
    if (await testFrontrun()) {
      successes++
    }
    console.log("Tries: " + i + " Successful Tries: " + successes)
  }
  const lastBlockNumber = await web3.eth.getBlockNumber()
  const lastBlock = await web3.eth.getBlock(lastBlockNumber)
  console.log("Sucessfull front-runs:" + successes + " / " + tries)
  console.log("Block at test start: " + initialBlockNumber + " - Block at test end:" + lastBlockNumber)
  console.log("Average block time while the experiment was running: " + ((lastBlock && initialBlock && (lastBlock.timestamp - initialBlock.timestamp)) || 0) / (((lastBlockNumber - initialBlockNumber) > 0) ? (lastBlockNumber - initialBlockNumber) : 1))
  process.exit()
})()
