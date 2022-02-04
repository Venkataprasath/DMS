const client = require('./client')
const express = require('express');
const e = require('express');
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/folder', (req, res) => {
    client.createFolder({ name: req.body.name, user_id: req.body.user_id }, function(err, response) {
        res.send(response.resource_name);
    });
})

app.post('/user', (req, res) => {
    client.addUser({ email: req.body.email, password: req.body.password }, function(err, response) {
        res.send(response);
    });
})

app.get('/', (req, res) => {
    if (req.query.user_id) {
        client.getResources({ user_id: req.query.user_id }, function(err, response) {
            res.send(response);
        })
    } else {
        client.getAllResources({}, function(err, response) {
            res.send(response);
        })
    }

})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})