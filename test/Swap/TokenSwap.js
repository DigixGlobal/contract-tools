const a = require('awaiting');

const Token = artifacts.require('./MockToken.sol');
const TokenSwap = artifacts.require('./MockTokenSwap.sol');

const bN = web3.toBigNumber;

const {
  randomBigNumber,
  randomBigNumbers,
  randomAddress,
} = require('../helpers');

contract('TokenSwap', function (accounts) {
  let contracts;

  const mockTokenName = 'Old Token Test';
  const mockTokenSymbol = 'OTT';
  const mockTokenDecimals = 8;
  const mockTokenSupply = bN(10000000000);

  const mockTokenSwapName = 'New Token Test';
  const mockTokenSwapSymbol = 'NTT';
  const mockTokenSwapDecimals = 8;

  const randomUserBalances = randomBigNumbers(10);

  before(async function () {
    await setupTestSystem();
  });
  const setupTestSystem = async function () {
    // instantiate contracts
    contracts = {};
    contracts.token = await Token.new(mockTokenName, mockTokenSymbol, mockTokenDecimals, mockTokenSupply);
    contracts.tokenSwap = await TokenSwap.new(mockTokenSwapName, mockTokenSwapSymbol, mockTokenSwapDecimals, contracts.token.address, false);

    // initialize balance of 10 random users
    for (let i = 1; i < 11; i += 1) {
      await contracts.token.transfer(accounts[i], randomUserBalances[i-1]);
    }

    // accounts[1], accounts[2] and accounts[3] `approve`
    // tokenSwap to be spenders of all their balances
    for (let i = 1; i < 4; i += 1) {
      await contracts.token.approve(
        contracts.tokenSwap.address,
        await contracts.token.balanceOf(accounts[i]),
        { from: accounts[i] },
      );
    }

    // accounts[4] approves tokenSwap
    // to be spender of only some of their balance
    const approveAmount = randomBigNumber(await contracts.token.balanceOf(accounts[4]));
    await contracts.token.approve(
      contracts.tokenSwap.address,
      approveAmount,
      { from: accounts[4] },
    );
  };

  describe('Initialization', function () {
    it('[token and tokenSwap have correct total supply]', async function () {
      assert.deepEqual(await contracts.token.totalSupply.call(), mockTokenSupply);
      assert.deepEqual(await contracts.tokenSwap.totalSupply.call(), bN(0));
    });
    it('[tokenSwap has the correct old_token_contract address]', async function () {
      assert.deepEqual(await contracts.tokenSwap.old_token_contract.call(), contracts.token.address);
    });
  });
  describe('isValidSwap', function () {
    it('[allowance valid, amount > balance]: throw', async function () {
      // accounts[2] has approved all their balance
      // try to swap more tokens than balance
      const amountToSwap = bN(1000000).plus(randomBigNumber());
      assert.ok(await a.failure(contracts.tokenSwap.testIsValidSwap.call(amountToSwap, { from: accounts[2] })));
    });
    it('[amount valid, allowance < amount]: throw', async function () {
      // accounts[4] has approved less than their balance
      // try to swap entire balance
      const amountToSwap = await contracts.token.balanceOf.call(accounts[4]);
      assert.ok(await a.failure(contracts.tokenSwap.testIsValidSwap.call(amountToSwap, { from: accounts[4] })));
    });
    it('[allowance valid, amount valid]: success', async function () {
      // accounts[1] trying to swap entire balance
      const amountToSwap1 = await contracts.token.balanceOf.call(accounts[1]);
      assert.deepEqual(await contracts.tokenSwap.testIsValidSwap.call(amountToSwap1, { from: accounts[1] }), true);

      // accounts[3] trying to swap less than entire balance
      const amountToSwap3 = randomBigNumber(await contracts.token.balanceOf.call(accounts[3]));
      assert.deepEqual(await contracts.tokenSwap.testIsValidSwap.call(amountToSwap3, { from: accounts[3] }), true);

      // accounts[0] (creator of oldToken also swaps)
      const balance0 = await contracts.token.balanceOf.call(accounts[0]);
      await contracts.token.approve(
        contracts.tokenSwap.address,
        balance0,
        { from: accounts[0] },
      );
      assert.deepEqual(await contracts.tokenSwap.testIsValidSwap.call(balance0, { from: accounts[0] }), true);
    });
  });
  describe('mintNewTokens', function () {
    it('[totalSupply_ and balance[msg.sender] updated successfully]', async function () {
      const randomUser = randomAddress();
      const randomAmount = randomBigNumber();

      const totalSupplyBefore = await contracts.tokenSwap.totalSupply.call();
      const balanceRandomUserBefore = await contracts.tokenSwap.balanceOf.call(randomUser);

      assert.deepEqual(await contracts.tokenSwap.testMintNewTokens.call(randomUser, randomAmount), true);
      await contracts.tokenSwap.testMintNewTokens(randomUser, randomAmount);

      // check total supply increased
      assert.deepEqual(await contracts.tokenSwap.totalSupply.call(), totalSupplyBefore.plus(randomAmount));

      // check total balance increased
      assert.deepEqual(await contracts.tokenSwap.balanceOf.call(randomUser), balanceRandomUserBefore.plus(randomAmount));
    });
  });
});
