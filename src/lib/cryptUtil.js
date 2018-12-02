'use strict';

var crypto = require('crypto');
var algorithm = 'aes-128-ecb';  
var clearEncoding = 'utf8';  //'utf8', 'ascii' or 'binary'
var cipherEncoding = 'base64'; // 'binary', 'base64' or 'hex'.
var seKey = 'gJ6CwAYOL0XbzcSeqL/zPg==';
var key = new Buffer(seKey, 'base64');
var iv = new Buffer('');

var crypt = function () {
	return {
		encrypt: function(plaintext) {
		  var cipher = crypto.createCipheriv(algorithm, key, iv);  
		  var cipherChunks = [];  
		  cipherChunks.push(cipher.update(plaintext, clearEncoding, cipherEncoding));  
		  cipherChunks.push(cipher.final(cipherEncoding));  

		 	return cipherChunks;  
		},
		decrypt: function(encryptedText) {
		  var ciphertext = ["", encryptedText]
		  var decipher = crypto.createDecipheriv(algorithm, key, iv);  
		  var plainChunks = [];  
		  for (var i = 0;i < ciphertext.length;i++) {
		   plainChunks.push(decipher.update(ciphertext[i], cipherEncoding, clearEncoding));  
		  }  
		  plainChunks.push(decipher.final(clearEncoding));  
		  var plaintext = plainChunks.join('');  
		  
		 	return plaintext;  
		}
	};
};

module.exports = crypt();
