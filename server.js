#!/bin/env node

var http    = require('http')
var tpl     = require('swig')
var bot     = require('./bot')
var irc     = require('irc')
var url     = require('url')
var fs      = require('fs')
var qs      = require('querystring')

tpl.init({'cache': false})

var local = (typeof process.env.OPENSHIFT_INTERNAL_PORT != "undefined")

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

	// static
	if(req.url.match("^/(css|js)/[a-z.]+")) return paths.static(req, res)
	// bot commande
	if(req.url.match("^/bot/[a-z./]+")) return paths.bot(req, res) 
	// index
	if(req.url == "/"){
	 	return res.end(index.render({'channels': bot.channels()}) )
	}
	// default: redirect to /
	res.writeHead(302, {'Location': "/"})
	res.end()
}

var server = http.createServer(handler)
                 .listen(process.env.OPENSHIFT_INTERNAL_PORT || 8080)

