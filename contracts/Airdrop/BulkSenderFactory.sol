pragma solidity ^0.4.19;

import "./BulkSender.sol";

contract BulkSenderFactory {

  address public factory_owner;  

  function BulkSenderFactory()
           public
  {
    factory_owner = msg.sender;
  }

  function createBulkSender(address token_contract_address)
           public
           returns (address _bulk_sender_address)
  {
    BulkSender newBulkSender = new BulkSender(token_contract_address, msg.sender);
    return address(newBulkSender);
  }
}
