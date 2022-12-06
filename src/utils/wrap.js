// Essa função wrap serve apenas para garantir que erros ocorridos
// em ambientes assíncronos não sejam engolidos e ignorados pelo
// Express.
function wrap(tratador) {
	return function(req, res, next) {
		const r = tratador(req, res, next);
		if (r)
			Promise.resolve(r).catch(next);
	};
};

module.exports = wrap;
