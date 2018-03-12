pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract OldToken is StandardToken {
  string public constant name = "Old Token";
  string public constant symbol = "OLD";
  uint8 public constant decimals = 8;
  uint256 public constant INITIAL_SUPPLY = 10000000000;

  function OldToken() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}
