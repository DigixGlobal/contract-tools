const crypto = require('crypto');

const bN = web3.toBigNumber;

function randomAddress() {
  return `0x${crypto.randomBytes(20).toString('hex')}`;
}

function randomAddresses(n) {
  return new Array(n).fill().map(randomAddress);
}

function randomBytes32() {
  return `0x${crypto.randomBytes(32).toString('hex')}`;
}

function randomBytes32s(n) {
  return new Array(n).fill().map(randomBytes32);
}

function randomBigNumber(range = 1000000) {
  return bN(Math.floor(Math.random() * range));
}

function randomBigNumbers(n, range = 1000000) {
  return new Array(n).fill().map(randomBigNumber);
}

const noCodeAccount = '0x0';

module.exports = {
  randomAddress,
  randomAddresses,
  randomBytes32,
  randomBytes32s,
  randomBigNumber,
  randomBigNumbers,
  noCodeAccount,
};
