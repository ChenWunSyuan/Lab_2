var express = require('express')
var app = express()
var mysql = require('mysql')
var myConnection = require('express-myconnection')
var config = require('./config')
var logger = require('morgan')
var dbOptions = {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
    database: config.database.db
}

app.use(logger('dev'));
app.use(myConnection(mysql, dbOptions, 'pool'))
app.set('view engine', 'ejs')

var index = require('./routes/index')
var users = require('./routes/users')
var expressValidator = require('express-validator')

app.use(expressValidator())
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

var methodOverride = require('method-override')

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method
        delete req.body._method
        return method
    }
}))

var flash = require('express-flash')
var cookieParser = require('cookie-parser');
var session = require('express-session');
app.use(cookieParser('keyboardcat'))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))

app.use(flash())
app.use('/', index)
app.use('/user', users)

let UID_Data = [];

function isEmpty(obj) { // 為null 或 undeifned 則為空值
	if ([null,undefined].indexOf(obj) != -1)
	{
		return true;	
	}
	if (typeof obj !== "object") 
	{
		return true;
	}
	
	// 型別如果不是object 則為空值(這邊將淘汰掉string的型別)
	// 判斷object 或 array(算是object)是否有值，如沒有則為空
	for (var key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			return false;
		}
	return true;
	}
}

app.post('/tagid', (req, res) => 
{
	// 如果解析為空，回傳狀態碼400(請求錯誤 = > bad request)
	if (isEmpty(req.body)) {
		console.log('Bad request');
		return res.sendStatus(400);
	}
	console.log('POST:', req.body); // 後端印出請求內容
	UID_Data.push(req.body.tagid); // 將溫度資料存入變數
	console.log(UID_Data);
	var user = {
            uid: UID_Data
    }

	req.getConnection(function (error, conn) {
        conn.query('INSERT INTO user_data SET ?', UID_Data, function (err, result) {
            if (err) {
                console.log("Fail !!!");
            } else {
				console.log("Suceess !!!");
            }
        })
	})
	res.sendStatus(200); // 回傳狀態碼200(代表成功 => ok)
});

app.listen(3000, function () {
    console.log('Server running at port 3000: http://127.0.0.1:3000')
})
