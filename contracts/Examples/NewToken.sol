pragma solidity ^0.4.19;

import "../Swap/TokenSwap.sol";

contract NewToken is TokenSwap {
  string public constant name = "New Token";
  string public constant symbol = "NEW";
  uint8 public constant decimals = 8;

  function NewToken(address _old_token_contract, bool _burn_old_tokens)
           public
           TokenSwap(_old_token_contract, _burn_old_tokens) {}
}
