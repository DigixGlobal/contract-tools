pragma solidity ^0.4.19;

import "zeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol";

contract BulkSender {

  address public token_contract_address;
  address public owner;

  modifier if_owner() {
    require(msg.sender == owner);
    _;
  }

  function BulkSender(address _token_contract_address, address _owner)
           public
  {
    token_contract_address = _token_contract_address;
    owner = _owner;
  }

  function bulkSend(address[] _recipients, uint256[] amounts)
           if_owner()
           public
           returns (bool _success)
  {
    uint256 length = _recipients.length;
    for (uint256 i = 0; i < length; i += 1) {
      require(ERC20Basic(token_contract_address).transfer(_recipients[i], amounts[i]));
    }
    _success = true;
  }

  function kill()
           if_owner()
           public
  {
    uint256 _balance = ERC20Basic(token_contract_address).balanceOf(address(this));
    require(ERC20Basic(token_contract_address).transfer(owner, _balance));
    selfdestruct(owner);
  }
}
