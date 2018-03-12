pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

contract TokenSwap is StandardToken {
  event Burn(address indexed burner, uint256 amount);
  event Swap(address indexed to, uint256 amount);

  address public old_token_contract;
  bool public burn_old_tokens;

  modifier isValidSwap(uint256 _amount) {
    require(StandardToken(old_token_contract).balanceOf(msg.sender) >= _amount);
    require(StandardToken(old_token_contract).allowance(msg.sender, this) >= _amount);
    _;
  }

  function TokenSwap(address _old_token_contract, bool _burn_old_tokens)
           public
  {
    old_token_contract = _old_token_contract;
    burn_old_tokens = _burn_old_tokens;
    totalSupply_ = 0;
    balances[msg.sender] = 0;
  }

  function swapTokens(uint256 _amount)
           isValidSwap(_amount)
           public
           returns (bool _success)
  {
    if (burn_old_tokens) {
      require(StandardToken(old_token_contract).transferFrom(msg.sender, 0x0, _amount));
    }
    require(mintNewTokens(msg.sender, _amount));
    Swap(msg.sender, _amount);
    _success = true;
  }

  function mintNewTokens(address _to, uint256 _amount)
           internal
           returns (bool _success)
  {
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    _success = true;
  }
}
