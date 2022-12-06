const fs = require("fs");
const path = require("path");

function salvarArquivo(caminho, dados, flag, mode, encoding) {
	return new Promise(function (resolve, reject) {
		if (!dados) {
			reject(new Error("Sem dados"));
			return;
		}

		try {
			// Para mais informações:
			// https://nodejs.org/api/fs.html#fswritefilefile-data-options-callback

			const opcoes = {
				flag: flag || "w"
			};

			if (mode !== undefined)
				opcoes.mode = mode;

			if (encoding !== undefined)
				opcoes.encoding = encoding;

			fs.writeFile(caminho, dados, opcoes, function (err) {
				if (err)
					reject(err);
				else
					resolve();
			});
		} catch (e) {
			reject(e);
		}
	});
}

module.exports = salvarArquivo;
