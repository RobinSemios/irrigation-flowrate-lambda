'use strict';

const crypto = require('crypto');

// should algorithm shouldn't be changed once rolled to production
const AES_ALGORITHM = 'aes-256-ctr';

/**
 * @description encrypt a text using an AES Key
 * @function encryptAES
 * @developmentFunction
 * @param {string} text text to be encrypted
 * @param {string} aesKey AES_KEY for encryption
 * @return {string} encryptedText encrypted text
 */
const encryptAES = (text, aesKey) => {
  const key = Buffer.from(aesKey, 'utf8');
  const ivBuffer = Buffer.alloc(16); // we don't need random iv, init with all 0s
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, ivBuffer);
  const crypted = cipher.update(text, 'utf8', 'hex');

  return crypted;
};

/**
 * @description decrypt a encrypted text using an AES Key
 * @developmentFunction
 * @function decryptAES
 * @param {string} encryptedText encrypted text
 * @param {string} aesKey AES_KEY for decryption
 * @return {string} text decrypted text
*/
const decryptAES = (encryptedText, aesKey) => {
  const ivBuffer = Buffer.alloc(16); // we don't need random iv, init with all 0s
  const decipher = crypto.createDecipheriv(AES_ALGORITHM, aesKey, ivBuffer);
  const dec = decipher.update(encryptedText, 'hex', 'utf8');

  return dec;
};

module.exports = {
  encryptAES,
  decryptAES,
};
