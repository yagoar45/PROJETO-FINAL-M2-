const express = require("express");
const wrap = require("../utils/wrap");

const router = express.Router();

router.all("/", wrap(async (req, res) => {
	res.render("exemplo/index");
}));

router.all("/outra", wrap(async (req, res) => {
	const id = req.query["id"];

	const opcoes = {
		idDaQueryString: id
	};

	res.render("exemplo/outra", opcoes);
}));

module.exports = router;
