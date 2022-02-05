const client = require('./client')
const express = require('express');
const urlValidator = require('./rules')
var crypto = require('crypto');
const e = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//     console.log(req)
//     urlValidator.validate(req, function(user_id) {
//         req.user_id = user_id
//         next()
//     }, function() {

//     })
// })

app.post('/folder', (req, res) => {
    client.createFolder({ name: req.body.name, user_id: req.body.user_id }, function(err, response) {
        res.send(response.resource_name);
    });
})

app.post('/file', (req, res) => {
    var body = req.body;
    body.user_id = req.user_id
    client.createFile(body, function(err, response) {
        if (err) {

        } else {
            res.send(response.resource_id);
        }
    })
})

app.put('/file/:id', (req, res) => {
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

app.put('/file/:id/move', (req, res) => {
    var body = req.body;
    body.resource_id = req.params.id
    body.user_id = req.user_id
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

app.get('/resources/:resource_id', (req, res) => {
    client.getResources({ user_id: req.user_id, resource_id: req.params.resource_id }, function(err, response) {

    });
})
app.get("/test", (req, res) => {
    console.log("test")
    res.send("Working");
});
app.post('/login', (req, res) => {
    console.log(req.body);
    client.getUser({ email: req.body.email, password: req.body.password }, function(err, response) {
        console.log(response);
        if (response.error_code) {
            res.send("Invalid credientials")
        } else {
            var encrypted = urlValidator.encrypt(JSON.stringify(response));
            res.cookie('dms_auth', encrypted)
            res.send("Logged in with cookie " + encrypted);
        }

    });
});

app.get('/', (req, res) => {
    res.send("I am working")
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})