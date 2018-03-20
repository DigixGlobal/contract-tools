const crypto = require('crypto');

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

function randomBigNumber(bN, range = 1000) {
  return bN(Math.floor(Math.random() * range));
}

function randomBigNumbers(bN, n, range = 1000) {
  return new Array(n).fill().map(() => randomBigNumber(bN, range));
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
