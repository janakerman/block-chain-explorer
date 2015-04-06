define(['crypto'], function (crypto) {

	Block = function (rawBlock) {
	this.block = rawBlock;
	};

	Block.prototype.getVersion = function () {
	return this.block.ver;
	}

	Block = function(rawBlock) {
		return {
			getHash: function () {
				return rawBlock.hash
			},

			getVersion: function () {
				return rawBlock.ver;
			},

			getHashPrevBlock: function () {
				return rawBlock.prev_block;
			},

			getHashMerkleRoot: function () {
				return rawBlock.mrkl_root;
			},

			getTime: function () {
				return rawBlock.time;
			},

			getBits: function () {
				return rawBlock.bits;
			},

			getNonce: function () {
				return rawBlock.nonce;
			}
		};
	};

	reverseHex = function (hexString) {
		var splitByLength = function (string, splitLength) {
			var chunks = [];

			for (var i = 0, charsLength = string.length; i < charsLength; i += splitLength) {
				chunks.push(string.substring(i, i + splitLength));
			};

			return chunks;
		}

		return splitByLength(hexString, 2).reverse().join('');
	};


	var numberToHexLE = function (number) {
		var hex = number.toString(16);

		var pad = function(num, size) {
			var s = num+"";
			while (s.length < size) {
				s = "0" + s;
			};
			return s;
		}
		return reverseHex(pad(hex, 8));
	};

	var hex2Bin = function (hex) {
		var bytes = [];

		for(var i=0; i< hex.length-1; i+=2){
			bytes.push(parseInt(hex.substr(i, 2), 16));
		}

		return String.fromCharCode.apply(String, bytes);
	}

	return function(rawBlock) {
		var block = new Block(rawBlock);

		var headerHex = numberToHexLE(block.getVersion()) +
		reverseHex(block.getHashPrevBlock()) +
		reverseHex(block.getHashMerkleRoot()) +
		numberToHexLE(block.getTime()) +
		numberToHexLE(block.getBits()) +
		numberToHexLE(block.getNonce());

		var binaryHeader = hex2Bin(headerHex);

		var hash1 = crypto.createHash('sha256').update(binaryHeader, 'binary').digest('binary');
		var hash2 = crypto.createHash('sha256').update(hash1, 'binary').digest('hex');
		hash2 = reverseHex(hash2);

		return (hash2 == block.getHash()).toString();
	}
});