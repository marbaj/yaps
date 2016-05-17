"use strict"

const http = require('http');
var request = require('request');
const url = require('url')
const path = require('path')
const FileCookieStore = require('tough-cookie-filestore');
const freeport = require('freeport')
var j = request.jar(new FileCookieStore('../bombarder/.bombarder/cookies.json'))
const Q = require('q');
const fs = require('fs');
const K = require('./comparator')

var BombarderProxy = function(domain) {
	request = request.defaults({ jar: j })

	var port = () => {
		var deferred = Q.defer();
		freeport((err, port) => {
			if (!err) {
				deferred.resolve(port);
			} else {
				deferred.reject()
			}
		});

		return deferred.promise;
	}

	this.proxy = (domain, proxyPort, cb) => {

		domain = domain || '127.0.0.1';

		if (proxyPort) {
			localServer(proxyPort, cb);
		} else {
			port().then((port) => {
				localServer(port, cb);
			});
		}

		function localServer(port, cb) {
			console.log('proxy running at port: ' + port)
			http.createServer((req, resp) => {	
				const endpoint = url.resolve(domain, req.url)
				const body = [];
				cb = cb || {};

				var s = Date.now();

				req.on('data', function(chunk) {
					body.push(chunk);
				}).on('end', function() {
					cb(Buffer.concat(body).toString(), req)
				});

				const x = request(endpoint)

				x.on('data', function(chunk) {
					body.push(chunk);
				}).on('end', function() {
					const d = Date.now() - s;
					cb(Buffer.concat(body).toString(), req, d)
				});

				req.pipe(x)
				x.pipe(resp)


			}).listen(port);
		}
	}

	this.run = (domain, cb) => {
		const deferred = Q.defer();
		port().then((port) => {		
			proxy(port, domain, cb)
			deferred.resolve(port)
		})
		.catch((error) => {
			deferred.deferred()
		})
		
		return deferred.promise;
	}
}

const b = new BombarderProxy()

const es_server = 'http://52.1.232.211:9200';
const search_api = 'http://localhost:3000';
const fc7 = 'http://localhost:8081';
var index = 0;
var index1 = 0;

//var streamEs = fs.createWriteStream("es-queryes.txt");
//var streamSearchapi = fs.createWriteStream("search-api.txt");

const k = new K();

b.proxy(es_server, 5000, (body, req, d) => {

	var hits = k.add(body)


	var queryString = JSON.stringify(body);
//	streamEs.write(queryString);
//	streamEs.write('\n');
	console.log(req.url)
	console.log(body)
	console.log('es_server: ' + index++ + '  hits: '+hits + '  time: '+d)
//	console.log(body + '\n\n\n')
});

b.proxy(search_api, 5500, (body, req, d) => {
//	var queryString = JSON.stringify(body, req);
	//console.log(req.url)
	//streamSearchapi.write(req.url);
	//streamSearchapi.write('\n');
	//console.log('\nsearch_api: ' + index1++ + '  time: '+d)
});

b.proxy(fc7, 6000, (body, req, d) => {
//	var queryString = JSON.stringify(body, req);
//console.log(req.url)
	//streamSearchapi.write(req.url);
	//streamSearchapi.write('\n');
	//console.log('search_api: ' + index1++ + '  time: '+d)
});




module.exports = BombarderProxy;