const BulkSenderFactory = artifacts.require('./BulkSenderFactory.sol');
const BulkSender = artifacts.require('./BulkSender.sol');
const Token = artifacts.require('./MockToken.sol');

const {
  randomAddresses,
  randomBigNumbers,
} = require('../helpers');

const bN = web3.toBigNumber;

contract('Bulk Sender Gas Report', function (accounts) {
  let contracts;
  let bulkSenderAddress;
  let gas = {};

  before(async function () {
    await setupTestSystem();
  });

  const pushToGasArray = function (index, gasUsed) {
    gas[index] = gasUsed;
    console.log('n = ', index, 'per unit gas = ', (gasUsed/index));
  };

  const setupTestSystem = async function () {
    contracts = {};
    contracts.bulkSenderFactory = await BulkSenderFactory.new();
    contracts.token = await Token.new('Test Token', 'TTT', 8, bN(20000000), { from: accounts[1] });

    bulkSenderAddress = await contracts.bulkSenderFactory.createBulkSender.call(contracts.token.address, { from: accounts[1] });
    await contracts.bulkSenderFactory.createBulkSender(contracts.token.address, { from: accounts[1] });
    contracts.bulkSender = BulkSender.at(bulkSenderAddress);

    await contracts.token.transfer(bulkSenderAddress, await contracts.token.balanceOf.call(accounts[1]), { from: accounts[1] });
  };

  describe('bulkSend', function () {
    const recipients = randomAddresses(500000);
    const amounts = randomBigNumbers(bN, 500000);
    it('[n = 1]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(0, 1), amounts.slice(0, 1), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(0, 1), amounts.slice(0, 1), { from: accounts[1] });
      pushToGasArray(1, tx.receipt.gasUsed);
    });
    it('[n = 2]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(1, 3), amounts.slice(1, 3), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(1, 3), amounts.slice(1, 3), { from: accounts[1] });
      pushToGasArray(2, tx.receipt.gasUsed);
    });
    it('[n = 3]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(3, 6), amounts.slice(3, 6), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(3, 6), amounts.slice(3, 6), { from: accounts[1] });
      pushToGasArray(3, tx.receipt.gasUsed);
    });
    it('[n = 4]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(6, 10), amounts.slice(6, 10), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(6, 10), amounts.slice(6, 10), { from: accounts[1] });
      pushToGasArray(4, tx.receipt.gasUsed);
    });
    it('[n = 5]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(10, 15), amounts.slice(10, 15), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(10, 15), amounts.slice(10, 15), { from: accounts[1] });
      pushToGasArray(5, tx.receipt.gasUsed);
    });
    it('[n = 6]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(15, 21), amounts.slice(15, 21), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(15, 21), amounts.slice(15, 21), { from: accounts[1] });
      pushToGasArray(6, tx.receipt.gasUsed);
    });
    it('[n = 7]', async function () {
      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(recipients.slice(21, 29), amounts.slice(21, 29), { from: accounts[1] }), true);
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(21, 29), amounts.slice(21, 29), { from: accounts[1] });
      pushToGasArray(7, tx.receipt.gasUsed);
    });
    it('[n = 100]', async function () {
      const tx = await contracts.bulkSender.bulkSend(recipients.slice(29, 130), amounts.slice(29, 130), { from: accounts[1] });
      pushToGasArray(100, tx.receipt.gasUsed);
    });
    it('[find max n] [n = 200 to 300]', async function () {
      let initial = 130;
      for(let i = 200; i < 300; i += 5) {
        const tx = await contracts.bulkSender.bulkSend(recipients.slice(initial, initial+i+1), amounts.slice(initial, initial+i+1), { from: accounts[1] });
        console.log('done n = ', i);
        initial = initial + i + 1;
        pushToGasArray(i, tx.receipt.gasUsed);
      }
    });
  });
});
