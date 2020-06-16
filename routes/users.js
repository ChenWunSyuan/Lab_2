var express = require('express')
var app = express()

app.get('/', function (req, res, next) {
    req.getConnection(function (error, conn) {
        conn.query('SELECT * FROM user_data ORDER BY id DESC', function (err, rows, fields) {
            if (err) {
                req.flash('error', err)
                res.render('user/list', {
                    title: 'UID Data List',
                    data: ''
                })
            } else {
                res.render('user/list', {
                    title: 'UID Data List',
                    data: rows
                })
            }
        })
    })
})

app.get('/add', function (req, res, next) {
    res.render('user/add', {
        title: 'Add New Data',
       	uid: '',
       	create_time: '',
        update_time: '',
        update_count: ''
    })
})

app.post('/add', function (req, res, next) {
    req.assert('uid', 'NFC Card UID Is Required').notEmpty()
    var errors = req.validationErrors()
    if (!errors) {
        var user = {
            uid: req.sanitize('uid').escape().trim()
        }
        req.getConnection(function (error, conn) {
            conn.query('INSERT INTO user_data SET ?', user, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('user/add', {
                        title: 'Add New Data',
                        uid: user.uid
                    })
                } else {
                    req.flash('success', 'Data added successfully!')
                    res.render('user/add', {
                        title: 'Add New Data',
                       	uid: ''
                    })
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg + '< br > '
        })
        req.flash('error', error_msg)
        res.render('user/add', {
            title: 'Add New Data',
            uid: req.body.uid
        })
    }
})

app.get('/edit/(:id)', function (req, res, next) {
    req.getConnection(function (error, conn) {
        conn.query('SELECT * FROM user_data WHERE id = ' + req.params.id, function (err, rows, fields) {
            if (err) throw err
            if (rows.length <= 0) {
                req.flash('error', 'UID not found with id = ' + req.params.id)
                res.redirect('/user')
            } else {
                res.render('user/edit', {
                    title: 'Edit UID',
                    data: rows[0],
                    id: rows[0].id,
                    uid: rows[0].uid
                })
            }
        })
    })
})

app.put('/edit/(:id)', function (req, res, next) {
    req.assert('uid', 'UID is required').notEmpty() 
    var errors = req.validationErrors()
    if (!errors) {
        var user = {
            uid: req.sanitize('uid').escape().trim()
        }
        req.getConnection(function (error, conn) {
            conn.query('UPDATE user_data SET ? WHERE id = ' + req.params.id, user, function (err, result) {
                if (err) {
                    req.flash('error', err)
                    res.render('user/edit', {
                        title: 'Edit UID',
                        id: req.params.id,
                        uid: req.body.uid
                    })
                } else {
                    req.flash('success', 'uid updated successfully!')
                    res.render('user/edit', {
                        title: 'Edit UID',
                        id: req.params.id,
                        uid: req.body.uid
                    })
                }
            })
        })
    } else {
        var error_msg = ''
        errors.forEach(function (error) {
            error_msg += error.msg +'<br>'
        })
        req.flash('error', error_msg)
        res.render('user/edit', {
            title: 'Edit UID',
            id: req.params.id,
            uid: req.body.uid
        })
    }
})

app.delete('/delete/(:id)', function (req, res, next) {
    var user = { id: req.params.id }
    req.getConnection(function (error, conn) {
        conn.query('DELETE FROM user_data WHERE id = ' + req.params.id, user, function (err, result) {
            if (err) {
                req.flash('error', err)
                res.redirect('/user')
            } else {
                req.flash('success', 'UID deleted successfully! id = ' + req.params.id)
                res.redirect('/user')
            }
        })
    })
})

module.exports = app