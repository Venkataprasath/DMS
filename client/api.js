const client = require('./client')
const express = require('express');
const helpers = require('./handlebars-helper')
const urlValidator = require('./rules')
const cookieParser = require("cookie-parser");
const path = require('path')

const app = express();
const port = 3000;
const exphbs = require('express-handlebars');
const e = require('express');
var hbs = exphbs.create({
    helpers: helpers //only need this
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/dms', express.static(path.join(__dirname, '..', 'web')))

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.get('/', (req, res) => {
    res.redirect('/dms/login.html')
});

app.use((req, res, next) => {
    console.log(req.url)
    urlValidator.validate(req, function(user_id) {
        req.user_id = user_id

        next()
    }, function() {
        res.redirect('/dms/login.html')
    })
})

app.post('/dms/api/folder', (req, res) => {
    client.createFolder({ name: req.body.name, user_id: req.user_id }, function(err, response) {
        res.send(response.resource_name);
    });
})

app.post('/dms/api/file', (req, res) => {
    var body = req.body;
    body.user_id = req.user_id
    console.log(body);
    client.createFile(body, function(err, response) {
        if (err) {

        } else {
            res.send(response.resource_id);
        }
    })
})

app.put('/dms/api/file/:id', (req, res) => {
    var body = req.body;
    body.resource_id = req.params.id
    body.user_id = req.user_id
    client.updateFile(body, function(err, response) {
        if (err) {

        } else {
            res.send(response.resource_id);
        }
    })
})

app.get('/dms/api/file/:id', (req, res) => {
    var body = req.body;
    body.resource_id = req.params.id
    body.user_id = req.user_id
    client.getFile(body, function(err, response) {
        if (err) {

        } else {
            res.send(response);
        }
    })
})

app.put('/dms/api/file/:id/move', (req, res) => {
    var body = req.body;
    body.resource_id = req.params.id
    body.user_id = req.user_id
    console.log(body)
    client.moveFile(body, function(err, response) {
        if (err) {

        } else {
            res.send(response.resource_id);
        }
    })
})

app.post('/user', (req, res) => {
    client.addUser({ email: req.body.email, password: req.body.password }, function(err, response) {
        res.send(response);
    });
})

app.get('/dms/api/resources', (req, res) => {
    client.getResources({ user_id: req.user_id }, function(err, response) {
        res.send(response);
    });
})

app.get('/dms/resources', (req, res) => {
    client.getResources({ user_id: req.user_id }, function(err, response) {
        response.homeFolder = true;
        res.render('home', response);
    });
})

app.get('/dms/resources/:resource_id', (req, res) => {
    client.getResources({ user_id: req.user_id, parent_id: req.params.resource_id }, function(err, response) {
        response.homeFolder = false;
        res.render('home', response);
    });
})

app.get('/dms/file/:id', (req, res) => {
    var body = req.body;
    body.resource_id = req.params.id
    body.user_id = req.user_id
    client.getFile(body, function(err, response) {
        if (err) {

        } else {
            if (req.query.edit) {
                response.edit = true
            }
            res.render('fileview', response);
        }
    });
});

app.get('/dms/api/resources/:resource_id', (req, res) => {
    client.getResources({ user_id: req.user_id, parent_id: req.params.resource_id }, function(err, response) {

        res.send(response);
    });
});


app.post('/login', (req, res) => {
    client.getUser({ email: req.body.email, password: req.body.password }, function(err, response) {
        console.log(response);
        if (response.error_code) {
            res.send("Invalid credientials")
        } else {
            var encrypted = urlValidator.encrypt(JSON.stringify(response));
            res.cookie('dms_auth', encrypted)
            res.send("Success");
        }

    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})