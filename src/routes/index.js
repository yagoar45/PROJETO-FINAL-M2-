const express = require("express");
// https://expressjs.com/en/resources/middleware/multer.html
const multer = require("multer");
const path = require("path");
const Database = require("../utils/database");
const Usuario = require("../models/usuario");
const wrap = require("../utils/wrap");
const salvarArquivo = require("../utils/salvarArquivo");

const router = express.Router();

// Ao criar o middleware do multer, passamos algumas opções por seguraça,
// para evitar ataques simples ao servidor. Por exemplo, limita o tamanho
// máximo do nome do arquivo, a quantidade de arquivos, e o tamanho individual
// de cada arquivo, que aqui foi um limite de 1 MB!
const objMulter = multer({
	limits: {
		fieldNameSize: 256,
		files: 1,
		fileSize: 1 * 1024 * 1024
	}
});

router.all("/", wrap(async (req, res) => {
	const usuario = await Usuario.cookie(req);
	if (!usuario) {
		res.redirect("/login");
		return;
	}

	const opcoes = {
		usuario: usuario
	};

	res.render("index/index", opcoes);
}));

router.all("/lista", wrap(async (req, res) => {
	const usuario = await Usuario.cookie(req);
	if (!usuario) {
		res.redirect("/login");
		return;
	}

	const pessoas = await Database.all("SELECT id, nome, email FROM pessoa ORDER BY nome ASC");

	const opcoes = {
		usuario: usuario,
		pessoas: pessoas
	};

	res.render("index/lista", opcoes);
}));

router.get("/criar", wrap(async (req, res) => {
	const usuario = await Usuario.cookie(req);
	if (!usuario) {
		res.redirect("/login");
		return;
	}

	const opcoes = {
		usuario: usuario
	};

	res.render("index/criar", opcoes);
}));

// Apesar do limite de um arquivo acima, que serve por segurança, para descartar
// requisições maliciosas, o método single() serve para criar um middleware
// que vai receber um único arquivo, e colocar esse arquivo na propriedade
// req.file.
router.post("/criar", objMulter.single("foto"), wrap(async (req, res) => {
	const usuario = await Usuario.cookie(req);
	if (!usuario) {
		res.status(403).json("Sem permissão");
		return;
	}

	const pessoa = req.body;

	if (!pessoa) {
		res.status(400).json("Pessoa faltando");
		return;
	}

	if (!pessoa.nome) {
		res.status(400).json("Nome faltando");
		return;
	}

	if (!pessoa.email) {
		res.status(400).json("E-mail faltando");
		return;
	}

	if (!req.file || !req.file.buffer) {
		res.status(400).json("Foto faltando");
		return;
	}

	const resultado = await Database.run("INSERT INTO pessoa (nome, email) VALUES (?, ?)", [pessoa.nome, pessoa.email]);

	const id = resultado.lastID;

	const caminhoDaFoto = path.resolve(__dirname, "../../public/images/pessoas/" + id + ".jpg");

	await salvarArquivo(caminhoDaFoto, req.file.buffer);

	res.sendStatus(204);
}));

router.all("/login", wrap(async (req, res) => {
	let usuario = await Usuario.cookie(req);
	if (!usuario) {
		if (req.body.email || req.body.senha) {
			let mensagem = await Usuario.efetuarLogin(req.body.email, req.body.senha, res);
			if (mensagem) {
				const opcoes = {
					mensagem: mensagem
				};

				res.render("index/login", opcoes);
			} else {
				res.redirect("/");
			}
		} else {
			const opcoes = {
				mensagem: null
			};

			res.render("index/login", opcoes);
		}
	} else {
		res.redirect("/");
	}
}));

router.all("/logout", wrap(async (req, res) => {
	const usuario = await Usuario.cookie(req);
	if (usuario)
		await Usuario.efetuarLogout(usuario, res);

	res.redirect("/login");
}));

module.exports = router;
