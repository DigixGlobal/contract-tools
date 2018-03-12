const a = require('awaiting');

const BulkSenderFactory = artifacts.require('./BulkSenderFactory.sol');
const BulkSender = artifacts.require('./BulkSender.sol');
const Token = artifacts.require('./MockToken.sol');

const {
  randomAddresses,
  randomBigNumbers,
  noCodeAccount,
} = require('../helpers');

const bN = web3.toBigNumber;

contract('BulkSender', function (accounts) {
  let contracts;
  let bulkSenderAddress;

  before(async function () {
    await setupTestSystem();
  });

  const setupTestSystem = async function () {
    contracts = {};
    contracts.bulkSenderFactory = await BulkSenderFactory.new();
    contracts.token = await Token.new('Test Token', 'TTT', 8, bN(1000000), { from: accounts[1] });

    bulkSenderAddress = await contracts.bulkSenderFactory.createBulkSender.call(contracts.token.address, { from: accounts[1] });
    await contracts.bulkSenderFactory.createBulkSender(contracts.token.address, { from: accounts[1] });
  };

  describe('bulkSend', function () {
    const randomAmounts = randomBigNumbers(2, bN(100000));
    const randomAccounts = randomAddresses(2);
    it('[non-owner of BulkSender calls bulkSend]: throws', async function () {
      for (let i = 0; i < 20; i += 1) {
        if (i !== 1) { // accounts[1] is the owner
          assert.ok(await a.failure(BulkSender.at(bulkSenderAddress).bulkSend.call(randomAccounts, randomAmounts, { from: accounts[i] })));
        }
      }
    });
    it('[bulkSend without BulkSender contract having TTT tokens]: `transfer` throws', async function () {
      assert.ok(await a.failure(BulkSender.at(bulkSenderAddress).bulkSend.call(randomAccounts, randomAmounts, { from: accounts[1] })));
    });
    it('[bulkSend after sending tokens to BulkSender]: valid', async function () {
      // transfer all tokens to bulkSenderAddress
      await contracts.token.transfer(bulkSenderAddress, await contracts.token.balanceOf.call(accounts[1]), { from: accounts[1] });

      assert.deepEqual(await BulkSender.at(bulkSenderAddress).bulkSend.call(randomAccounts, randomAmounts, { from: accounts[1] }), true);
      await BulkSender.at(bulkSenderAddress).bulkSend(randomAccounts, randomAmounts, { from: accounts[1] });

      // check balances
      assert.deepEqual(await contracts.token.balanceOf.call(randomAccounts[0]), randomAmounts[0]);
      assert.deepEqual(await contracts.token.balanceOf.call(randomAccounts[1]), randomAmounts[1]);
      assert.deepEqual(await contracts.token.balanceOf.call(bulkSenderAddress), bN(1000000).minus(randomAmounts[0]).minus(randomAmounts[1]));
    });
  });

  describe('kill', function () {
    it('[non-owner calls kill]: throws', async function () {
      for (let i = 0; i < 20; i += 1) {
        if (i !== 1) { // accounts[1] is the owner
          assert.ok(await a.failure(BulkSender.at(bulkSenderAddress).kill.call({ from: accounts[i] })));
        }
      }
    });
    it('[after killed, remaining tokens come back to owner, i.e. accounts[1]]', async function () {
      // note balance before killing BulkSender
      const ownerBalanceBefore = await contracts.token.balanceOf.call(accounts[1]);
      const contractBalanceBefore = await contracts.token.balanceOf.call(bulkSenderAddress);

      // kill the BulkSender contract
      await BulkSender.at(bulkSenderAddress).kill({ from: accounts[1] });

      // check balances
      const ownerBalanceAfter = await contracts.token.balanceOf.call(accounts[1]);
      const contractBalanceAfter = await contracts.token.balanceOf.call(bulkSenderAddress);

      assert.deepEqual(contractBalanceAfter, bN(0));
      assert.deepEqual(ownerBalanceAfter, ownerBalanceBefore.plus(contractBalanceBefore));
      assert.deepEqual(web3.eth.getCode(bulkSenderAddress), noCodeAccount);
    });
  });
});
