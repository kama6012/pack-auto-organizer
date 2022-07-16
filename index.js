const express = require('express')
const fs = require('fs')
const querystring = require('querystring');
const parse = querystring.parse;
const crypto = require('crypto')
const fetch = require('cross-fetch')
const buffer = require("buffer");
globalThis.Blob = buffer.Blob;
const JSZip = require('jszip')
JSZip.support.blob = true;
const app = express()
const port = process.env.PORT || 5000

app.get('/gen/:UUID', (req, res) => {
		console.log("generating pack of "+req.params.UUID)
		let zip = JSZip();
		fetch('https://api.github.com/repos/kama6012/texturepack/contents/MyPack/MyPack.zip?ref=main',{
			headers: {
				authorization: '${{ secrets.apikey }}',
				accept: "application/vnd.github.v3+json"
			}
		})
		.then(response => response.json())
		.then(data => {
			let content = JSON.stringify(data['content'])
			content = content.replace(/\"/g, "").replace(/\\n/g, "");
			zip.loadAsync(content, {base64: true})
			.then(dev => {
				fetch('https://crafatar.com/skins/'+req.params.UUID)
				.then(response => response.buffer())
				.then(buffer => buffer.toString('base64'))
				.then(skin =>{
						zip.remove("assets/minecraft/textures/skin.png")
						zip.file("assets/minecraft/textures/skin.png", skin, {base64: true})
				})
				.then(dev=>{
					zip.generateAsync({type:"arraybuffer"}).then(content => {
						fs.mkdir('/tmp', { recursive: true }, (err) => {
							if (err) throw err;
						});
						fs.writeFileSync("/tmp/" + req.params.UUID + ".zip", Buffer.from(content))
						fs.readFile("/tmp/" + req.params.UUID + ".zip", (err, result) => {
							if (err) throw err;
							const u8 = new Uint8Array( result.buffer );
							res.type("application/zip");
							res.send(Buffer.from(u8));
						})
					})
				})
			})
		})
	})

app.get('/send/:UUID', (req, res) => {
	console.log("send pack of " + req.params.UUID)
	fs.readFile("/tmp/" + req.params.UUID + ".zip", (err, result) => {
			if (err) throw err;
			const u8 = new Uint8Array( result.buffer );
			res.type("application/zip");
			res.send(Buffer.from(u8));
	})
})
app.listen(port, () => {
	console.log(`test app listening on port ${port}`)
})