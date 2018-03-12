pragma solidity ^0.4.19;

import "../../Swap/TokenSwap.sol";

contract MockTokenSwap is TokenSwap {
  string public name;
  string public symbol;
  uint8 public decimals;

  function MockTokenSwap(string _name, string _symbol, uint8 _decimals, address _old_token_contract, bool _burn_old_tokens)
           public
           TokenSwap(_old_token_contract, _burn_old_tokens)
  {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
  }

  function testIsValidSwap(uint256 _amount)
           isValidSwap(_amount)
           public
           constant
           returns (bool _success)
  {
    _success = true;
  }

  function testMintNewTokens(address _to, uint256 _amount)
           public
           returns (bool _success)
  {
    _success = mintNewTokens(_to, _amount);
  }
}
