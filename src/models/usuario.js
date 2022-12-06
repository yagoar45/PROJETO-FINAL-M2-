const express = require("express");
const crypto = require("crypto");
const Database = require("../utils/database");
const GeradorHash = require("../utils/geradorHash");

const nomeDoCookie = "nomeDoCookie";

class Usuario {
	static async cookie(req) {
		const cookieStr = req.cookies[nomeDoCookie];
		if (!cookieStr || cookieStr.length !== 40) {
			return null;
		} else {
			const id = parseInt(cookieStr.substring(0, 8), 16);

			const obj = await Database.get("select id, email, nome, token from usuario where id = ?", [id]);

			if (!obj)
				return null;

			const token = cookieStr.substring(8);

			if (!obj.token || token !== obj.token)
				return null;

			const usuario = new Usuario();
			usuario.id = id;
			usuario.email = obj.email;
			usuario.nome = obj.nome;

			return usuario;
		}
	}

	static async efetuarLogin(email, senha, res) {
		if (!email || !senha)
			return "Usuário ou senha inválidos";

		const usuario = await Database.get("select id, senha from usuario where email = ?", [email]);

		if (!usuario || !(await GeradorHash.validarSenha(senha, usuario.senha)))
			return "Usuário ou senha inválidos";

		let idStr = "0000000" + usuario.id.toString(16);
		idStr = idStr.substring(idStr.length - 8);

		const token = crypto.randomBytes(16).toString("hex");

		const cookieStr = idStr + token;

		await Database.run("update usuario set token = ? where id = ?", [token, usuario.id]);

		res.cookie(nomeDoCookie, cookieStr, { maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: true, path: "/", secure: false });

		return null;
	}

	static async efetuarLogout(usuario, res) {
		await Database.run("update usuario set token = null where id = ?", [usuario.id]);

		res.cookie(nomeDoCookie, "", { expires: new Date(0), httpOnly: true, path: "/", secure: false });
	}
}

module.exports = Usuario;
