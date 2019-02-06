const Web3 = require("web3")
const web3 = new Web3(new Web3.providers.WebsocketProvider(("ws://127.0.0.1:8546")))
const ORACLE_ABI = require("../build/contracts/SynchronousOracle.json").abi

const ORACLE_CONTRACT_ADDRESS = "<ORACLE_CONTRACT_ADDRESS_ALL_UPPER_CASE>"
const ORACLE_ADDRESS = "<ORACLE_ADDRESS_ALL_UPPER_CASE>"

const oracleContract = new web3.eth.Contract(ORACLE_ABI, ORACLE_CONTRACT_ADDRESS)

const getStockPrice = () => {
  // Real implementation would call some external source to determine stock price
  return Math.floor(Math.random() * Math.floor(15)) + 1
}

const oracle = () => {
  updatePrice(getStockPrice())
  setTimeout(oracle, 10 * 60 * 1000)
}

const updatePrice = (stockPrice) => {
  oracleContract.methods.update(stockPrice)
    .send({ from: ORACLE_ADDRESS })
}

oracle()
