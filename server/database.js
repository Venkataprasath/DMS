const sqlite3 = require("sqlite3").verbose();

function init() {
    connectToDB(function(db) {
        db.serialize(() => {
            db.run('CREATE TABLE IF NOT EXISTS RESOURCES(resource_id integer PRIMARY KEY AUTOINCREMENT,resource_name text,resource_type integer,parent_id integer)', (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });
        });
        // Always close the connection with database
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
    });
}

function createResource(resource_name, parent_id, callback) {
    connectToDB(function(db) {
        var query = 'INSERT INTO RESOURCES(resource_name,resource_type,parent_id) VALUES(?,?,?)';
        console.log(query);
        db.run(query, [resource_name, 1, parent_id], (err) => {
            if (err) {
                console.log(err);
                throw err;
            }
            callback(this.lastID);
        })
    })
}

function connectToDB(callback) {
    const db = new sqlite3.Database('../dms.db', (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the users.db database.');
        callback(db);
    });
}

function getAllResources(callback) {
    connectToDB(function(db) {
        db.all('select * from RESOURCES', (err, rows) => {
            if (err) {
                throw err;
            }
            console.log(rows);
            callback(rows);
        });
    })
}

var dbService = {
    createResource: createResource,
    getAllResources: getAllResources
}

init();

module.exports = dbService