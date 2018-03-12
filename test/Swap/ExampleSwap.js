const a = require('awaiting');

const OldToken = artifacts.require('./OldToken.sol');
const NewToken = artifacts.require('./NewToken.sol');

const {
  randomBigNumbers,
} = require('../helpers');

contract('ExampleSwap', function (accounts) {
  let contracts;

  const oldTokenUserBalances = randomBigNumbers(10);

  before(async function () {
    await setupTestSystem();
  });
  const setupTestSystem = async function () {
    contracts = {};
    contracts.oldToken = await OldToken.new();
    // if transfer to 0x0 is allowed, use _burn_old_tokens = true
    contracts.newToken = await NewToken.new(contracts.oldToken.address, false);

    for (let i = 1; i < 11; i += 1) {
      await contracts.oldToken.transfer(accounts[i], oldTokenUserBalances[i-1]);
    }

    for (let i = 0; i < 11; i += 1) {
      if (i !== 5) { // for all accounts except accounts[5]
        await contracts.oldToken.approve(
          contracts.newToken.address,
          await contracts.oldToken.balanceOf(accounts[i]),
          { from: accounts[i] },
        );
      }
    }
  };
  describe('Swap', function () {
    it('[valid swaps for accounts[0] to accounts[10], except accounts[5]]', async function () {
      let balance;
      const oldTokenCreatorBalanceAfterTransfers = await contracts.oldToken.balanceOf.call(accounts[0]);
      const totalSupplyOldToken = await contracts.oldToken.totalSupply.call();

      for (let i = 0; i < 11; i += 1) {
        if (i !== 5) { // accounts[5] has not yet approved
          balance = await contracts.oldToken.balanceOf.call(accounts[i]);
          assert.deepEqual(await contracts.newToken.swapTokens.call(balance, { from: accounts[i] }), true);
          await contracts.newToken.swapTokens(balance, { from: accounts[i] });
        }
      }

      // accounts[5] throws when try to swapTokens
      balance = await contracts.oldToken.balanceOf.call(accounts[5]);
      assert.ok(await a.failure(contracts.newToken.swapTokens.call(balance, { from: accounts[5] })));

      assert.deepEqual(await contracts.newToken.balanceOf.call(accounts[0]), oldTokenCreatorBalanceAfterTransfers);
      for (let i = 1; i < 11; i += 1) {
        if (i !== 5) {
          assert.deepEqual(await contracts.newToken.balanceOf.call(accounts[i]), oldTokenUserBalances[i-1]);
        }
      }

      // since only accounts[5] has not yet swapped tokens
      // totalSupply_ for newToken should be
      // (totalSupply_ of oldToken minus balanceOf accounts[5])
      const balance5 = await contracts.oldToken.balanceOf.call(accounts[5]);
      assert.deepEqual(await contracts.newToken.totalSupply.call(), totalSupplyOldToken.minus(balance5));
    });
    it('[accounts[5] approves and now is valid swap]', async function () {
      await contracts.oldToken.approve(
        contracts.newToken.address,
        await contracts.oldToken.balanceOf(accounts[5]),
        { from: accounts[5] },
      );

      const balance5 = await contracts.oldToken.balanceOf.call(accounts[5]);
      assert.deepEqual(await contracts.newToken.swapTokens.call(balance5, { from: accounts[5] }), true);
      await contracts.newToken.swapTokens(balance5, { from: accounts[5] });

      assert.deepEqual(await contracts.newToken.balanceOf.call(accounts[5]), balance5);
    });
  });
});
