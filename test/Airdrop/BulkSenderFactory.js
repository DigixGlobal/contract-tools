const BulkSenderFactory = artifacts.require('./BulkSenderFactory.sol');
const BulkSender = artifacts.require('./BulkSender.sol');

const {
  randomAddresses,
} = require('../helpers');

contract('BulkSenderFactory', function (accounts) {
  let contracts;

  before(async function () {
    await setupTestSystem();
  });

  const setupTestSystem = async function () {
    contracts = {};
    contracts.bulkSenderFactory = await BulkSenderFactory.new();
  };

  describe('Initialization', function () {
    it('[BulkSenderFactory has the correct owner]', async function () {
      assert.deepEqual(await contracts.bulkSenderFactory.factory_owner.call(), accounts[0]);
    });
  });

  describe('createBulkSender', function () {
    it('[create BulkSender and check initial set values]', async function () {
      const randomTokenContractAddresses = randomAddresses(2);
      const bulkSenderAddress1 = await contracts.bulkSenderFactory.createBulkSender.call(randomTokenContractAddresses[0], { from: accounts[1] });
      await contracts.bulkSenderFactory.createBulkSender(randomTokenContractAddresses[0], { from: accounts[1] });
      const bulkSenderAddress2 = await contracts.bulkSenderFactory.createBulkSender.call(randomTokenContractAddresses[1], { from: accounts[2] });
      await contracts.bulkSenderFactory.createBulkSender(randomTokenContractAddresses[1], { from: accounts[2] });

      assert.deepEqual(await BulkSender.at(bulkSenderAddress1).owner.call(), accounts[1]);
      assert.deepEqual(await BulkSender.at(bulkSenderAddress1).token_contract_address.call(), randomTokenContractAddresses[0]);

      assert.deepEqual(await BulkSender.at(bulkSenderAddress2).owner.call(), accounts[2]);
      assert.deepEqual(await BulkSender.at(bulkSenderAddress2).token_contract_address.call(), randomTokenContractAddresses[1]);
    });
  });
});
