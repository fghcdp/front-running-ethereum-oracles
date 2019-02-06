pragma solidity 0.5.0;

import "./SynchronousOracle.sol";

contract SynchronousConsumer {
  bool public payout = true;
  SynchronousOracle public synchronousOracle;

  constructor (address _oracleContract) public {
    synchronousOracle = SynchronousOracle(_oracleContract);
  }

  function requestPayout() public {
  	if(synchronousOracle.price()>10)
      payout = true;
    else
      payout = false;
  }
}