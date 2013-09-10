#!/bin/env node

var http    = require('http').createServer(handler)
var io      = require('socket.io').listen(http)
var tpl     = require('swig')
var bot     = require('./bot')
var irc     = require('irc')
var url     = require('url')
var fs      = require('fs')
var qs      = require('querystring')

var board = require("pixelboard")

var local = (typeof process.env.OPENSHIFT_INTERNAL_PORT != "undefined")
var ipadr = (process.env.OPENSHIFT_NODEJS_IP)
var port  = (process.env.OPENSHIFT_NODEJS_PORT || 8080)

http.listen(port, ipadr)
io.set('log level', 1)
tpl.init({'cache': false})
board.set_io(io)


var paths = {
	'static': function(req, res){
	 	fs.readFile(process.cwd()+"/data"+req.url, function(err, data){
			if(err) return console.log(err);
			res.end(data)
		})
	},
	'bot': function(req, res){
		if(req.method == "POST"){
			req.content = "";
			req.addListener("data", function(chunk){ req.content += chunk })
			req.addListener("end", function(chunk){ 
				var data = qs.parse(req.content)
				console.log(data)
				console.log(data.action)
				console.log(bot)
				console.log(bot[data.action])
				if(bot[data.action] != null){
					bot[data.action](data)
				}
				res.writeHead(302, {'Location': "/"})
				return res.end()
			})
		}	else if(req.method == "GET__"){
			// do not happen
		} else {
			console.log(req.method)
			res.writeHead(302, {'Location': "/"})
			return res.end()
		}
	}
}

var index = tpl.compileFile(process.cwd()+"/data/html/index.html")

function handler(req, res){
	req.setEncoding("utf8")
	console.log(req.url)

	// static
	if(req.url.match("^/(css|js)/[a-z.]+")) return paths.static(req, res)
	// bot commande
	if(req.url.match("^/bot/[a-z./]+")) return paths.bot(req, res) 
	// pixelboard
	if(req.url.match("^/board/?")) return board.handler(req, res)
	// index
	if(req.url == "/"){
	 	return res.end(index.render({'channels': bot.channels()}) )
	}
	// default: redirect to /
	res.writeHead(302, {'Location': "/"})
	res.end()
}


