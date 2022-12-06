const crypto = require("crypto");

const SALT_BYTE_SIZE = 33;
const HASH_BYTE_SIZE = 33;

class GeradorHash {
	static async criarHash(senha) {
		return new Promise((resolve, reject) => {
			const salt = crypto.randomBytes(SALT_BYTE_SIZE);
			crypto.pbkdf2(Buffer.from(senha), salt, 1024, HASH_BYTE_SIZE, "sha512", (err, derivedKey) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(derivedKey.toString("base64") + ":" + salt.toString("base64"));
			});
		});
	}

	static async validarSenha(senha, hash) {
		return new Promise((resolve, reject) => {
			let i;
			if (!senha || !hash || (i = hash.indexOf(":")) <= 0) {
				resolve(false);
				return;
			}
			const senhaHash = hash.substring(0, i);
			const saltHash = hash.substring(i + 1);
			if (!senhaHash || !saltHash) {
				resolve(false);
				return;
			}
			crypto.pbkdf2(Buffer.from(senha), Buffer.from(saltHash, "base64"), 1024, HASH_BYTE_SIZE, "sha512", (err, derivedKey) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(derivedKey.toString("base64") === senhaHash);
			});
		});
	}
}

module.exports = GeradorHash;
