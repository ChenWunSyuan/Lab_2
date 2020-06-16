var express = require('express')
var app = express()

app.get('/', function (req, res) {
    res.render('index', {title: 'LinkIt 7697 PN532 WebPage'})
})

module.exports = app;