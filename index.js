const express = require('express')
const fs = require('fs')
const fetch = require('cross-fetch')
const buffer = require("buffer");
globalThis.Blob = buffer.Blob;
const JSZip = require('jszip')
JSZip.support.blob = true;
const app = express()
const port = process.env.PORT || 5000

app.get('/', (req, res) => {
    let zip = JSZip();
    fetch('https://crafatar.com/skins/565d64224b444734a22eca9ac6039ceb')
    .then(response => response.buffer())
    .then(buffer => buffer.toString('base64'))
    .then(skin =>{
        zip.file("assets/minecraft/textures/skin.png", skin, {base64: true});
    }).then(dev => {
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
            zip.generateAsync({type:"blob"}).then(content => {
                console.log(content)
                res.type(content.type)
                content.arrayBuffer().then((buf) => {
                    res.send(Buffer.from(buf))
                })
            })
          })
        })
        .catch(error => console.error('通信に失敗しました', error));
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})