const client = require('./client')
const express = require('express')
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/folder', (req, res) => {
    client.createFolder({ name: req.body.name }, function(err, response) {
        res.send(response.resource_name);
    });
})

app.get('/', (req, res) => {
    client.getAllResources({}, function(err, response) {
        console.log(response);
        res.send(response);
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})