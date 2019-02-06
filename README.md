Code for my Paper "Front-running Ethereum Oracles".

The Contracts can be deployed using the Truffle framework (You need to configure it in `truffle.js`).  
You then need to replace the `<placeholders>` in the scripts (contracts & accounts).

# Contracts
`SynchronousOracle.sol`: Simple synchronous oracle  
`SynchronousConsumer.sol`: Consumer contract using this oracle
# Scripts
`frontrun-infura.js`: Front-running Oracle to be used with Infura (limited APIs)  
`test-infura.js`: Front-running Oracle to be used with Infura (limited APIs)  
`frontrun-local.js`: Front-running Oracle to be used locally

The code samples are for testing only and lack important security messures
and error handling.
