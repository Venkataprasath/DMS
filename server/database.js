const sqlite3 = require("sqlite3").verbose();

function init() {
    connectToDB(function(db) {
        db.serialize(() => {
            db.run('PRAGMA foreign_keys = ON')
            db.run('CREATE TABLE IF NOT EXISTS USERS(user_id integer PRIMARY KEY AUTOINCREMENT,email text UNIQUE,password text)', err => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            })
            db.run('CREATE TABLE IF NOT EXISTS RESOURCES(resource_id integer PRIMARY KEY AUTOINCREMENT,resource_name text,resource_type integer,parent_id integer,created_by integer NOT NULL, FOREIGN KEY (created_by) REFERENCES users (user_id) )', (err) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
            });

            db.each(`SELECT * FROM users`, (err, row) => {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log(row);
            }, () => {
                console.log('query completed')
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

function createResource(resource_name, user_id, callback) {
    connectToDB(function(db) {
        //get Root id of user;
        var parent_id = 0;
        var query = 'INSERT INTO RESOURCES(resource_name,resource_type,parent_id,created_by) VALUES(?,?,?,?)';
        console.log(query);
        db.run(query, [resource_name, 1, parent_id, user_id], (err) => {
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

function addUserToDatabase(email, password, callback) {
    connectToDB(function(db) {
        var query = 'INSERT into users(email,password) VALUES(?,?)';
        db.run(query, [email, password], (err) => {
            if (err) {
                console.log(err)
            }
            callback(this.lastID);
        })
    })
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

function getResourcesByUserID(user_id, callback) {
    connectToDB(function(db) {
        db.all('select * from RESOURCES where created_by=' + user_id, (err, rows) => {
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
    getAllResources: getAllResources,
    addUserToDatabase: addUserToDatabase,
    getResourcesByUserID: getResourcesByUserID
}

init();

module.exports = dbService