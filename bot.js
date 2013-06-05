#!/bin/env node

var irc     = require('irc')

var local = (typeof process.env.OPENSHIFT_INTERNAL_PORT == "undefined")

var client = new irc.Client("irc.quakenet.org", local?"pi_dev":"pichu", {})

client.addListener("error", function(err){
	console.log("error: ", err)
})

this.talk = function talk(data){
	console.log("talk: "+data.txt)
	client.say(data.chan, data.txt)
}
this.join = function join(data){
	console.log("join: "+data.chan)
	client.join(data.chan)
}
this.channels = function channels(){
	console.log("chans: ")
	console.log(client.chans)
	return client.chans
}



