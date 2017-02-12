var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var NodeCache = require("node-cache");
var crypto = require('crypto');
var RateLimit = require('express-rate-limit');
var atob = require('atob');
var btoa = require('btoa');
var fs = require('fs');
var http = require('http');
var https = require('https');
var options = {key: fs.readFileSync('server.key'), cert: fs.readFileSync('server.crt')} // Your TLS certs!
var notes = new NodeCache({
	stdTTL: 900,
	checkperiod: 120
});
app.use(bodyParser.json({
	extended: true,
	limit: 10240
}));
var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/
var router = express.Router();
var limit = new RateLimit({
	windowMs: 1000 * 60,
	max: 10,
	delayMs: 0
});

app.use(function(error, req, res, next) {
	if (error instanceof SyntaxError) {
		res.status(400)
		console.log("----------------------------------")
		console.log(req.headers);
		console.log(req.body)
		console.log("----------------------------------")
		res.json({
			error: "Invalid request, the submitted json is malformed."
		})
	} else {
		next();
	}
})
var port = process.env.PORT || 8080;
var online = true
var alphanumaric = /^[a-z0-9]+$/i
router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header('Access-Control-Allow-Methods', 'GET,POST');
	res.header('Access-Control-Allow-Headers', 'Content-Type')
	res.header("Cache-Control", "no-cache, no-store, must-revalidate");
	res.header("Pragma", "no-cache");
	res.header("Expires", 0);
	console.log("----------------------------------")
	console.log(req.headers);
	console.log("----------------------------------")
	if (online == true) {
		next();
	} else {
		res.json({
			error: 'The server is currently offline, this could be for scheduled maintenance or technical failure.'
		})
	}

});

function validateType(type) {
	var types = ["other"]
	if (types.indexOf(type) !== -1) {
		return true;
	} else {
		return false;
	}
}

function proccessBase64(res, string, callback) {
	try {
		if (base64regex.test(string)) {
			callback(btoa(encodeURIComponent(atob(string))))
		} else {
			res.json({
				error: "Invalid base64 string."
			})
		}

	} catch (e) {
		res.json({
			error: "Invalid base64 string."
		})
	}
}
router.get('/', function(req, res) {
	res.json({
		status: 'online',
		error: 'none'
	});
});
router.post('/create', function(req, res) {
	if (req.body.type && req.body.body && req.body.name && alphanumaric.test(req.body.name) && req.body.name.length <= 64 && req.body.name.length >= 1 && validateType(req.body.type)) {
		var name = crypto.createHash('sha256').update(req.body.name).digest('base64')
		proccessBase64(res, req.body.body, function(notebody) {
			notes.get(name, function(err, value) {
				if (!err) {
					if (value == undefined) {
						var final = {
							note: notebody,
							type: req.body.type
						};
						notes.set(name, final, function(err, success) {
							if (!err && success) {
								res.json({
									error: "none"
								})
								body = null
								name = null
								final = null
								notebody = null
							} else {
								res.json({
									error: "There was a problem with your request."
								})
								body = null
								name = null
								final = null
								notebody = null
							}
						})
					} else {
						res.json({
							error: "The note name that you entered already exists!"
						})
					}
				} else {
					res.json({
						error: "There was a problem while proccessing your request."
					})
				}
			});
		})


	} else {
		res.json({
			error: "Invalid request, the submitted data does not match the requirements of the API."
		})
	}
})
router.get('/get/*', function(req, res) {
	var name = req.url.replace("/get/", "")
	if (name.length >= 1) {
		name = crypto.createHash('sha256').update(name).digest('base64')
		notes.get(name, function(err, value) {
			if (!err) {
				if (value == undefined) {
					res.json({
						error: "That note does not exist!"
					})
					name = null
				} else {
					res.json({
						note: value.note,
						type: value.type,
						error: "none"
					})
					name = null
				}
			} else {
				res.json({
					error: "There was a problem while proccessing your request."
				})
			}
		});
	} else {
		res.json({
			error: "The note name is invalid"
		})
	}


})
app.use('/', router);
https.createServer(options, app).listen(2053)
http.createServer(app).listen(2054)
app.use('/create', limit);
console.log('Server started on port ' + 2053);
