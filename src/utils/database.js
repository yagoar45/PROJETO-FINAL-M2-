const sqlite3 = require("sqlite3");
const path = require("path");

let db;

class Database {
	static init() {
		return new Promise(function (resolve, reject) {
			db = new sqlite3.Database(path.resolve(__dirname, "../../data/database"), function (err) {
				if (err) {
					reject(err);
				} else {
					console.log("Conectado ao sqlite3");
					resolve();
				}
			});
		});
	}

	static run(sql, params) {
		return new Promise(function (resolve, reject) {
			db.run(sql, params, function (err) {
				if (err)
					reject(err);
				else
					resolve(this);
			});
		});
	}

	static get(sql, params) {
		return new Promise(function (resolve, reject) {
			db.get(sql, params, function (err, row) {
				if (err)
					reject(err);
				else
					resolve(row);
			});
		});
	}

	static all(sql, params) {
		return new Promise(function (resolve, reject) {
			db.all(sql, params, function (err, rows) {
				if (err)
					reject(err);
				else
					resolve(rows);
			});
		});
	}
}

module.exports = Database;
