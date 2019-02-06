pragma solidity 0.5.0;

contract SynchronousOracle {
  address public oracleAddress;
  uint public price;

  constructor (address _oracleAddress) public {
    oracleAddress = _oracleAddress;
  }

  function update(uint _price) public {
  	require(msg.sender == oracleAddress);
  	price = _price;
  }
}