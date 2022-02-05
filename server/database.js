const sqlite3 = require("sqlite3").verbose();
const e = require("express");
const constants = require('../constants');

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

            db.run('CREATE TABLE IF NOT EXISTS FILES(resource_id integer,content blob,\
              FOREIGN KEY (resource_id) REFERENCES RESOURCES (resource_id) )', (err) => {
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

function createResource(resource_name, user_id, parent_id, resource_type, callback) {
    connectToDB(function(db) {
        var query = 'INSERT INTO RESOURCES(resource_name,resource_type,parent_id,created_by) VALUES(?,?,?,?)';
        db.run(query, [resource_name, resource_type, parent_id, user_id], function(err) {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log(this.lastID);
            callback(this.lastID);
        })
    })
}

function createFile(resource_name, user_id, parent_id, content, callback) {
    connectToDB(function(db) {
        createResource(resource_name, user_id, parent_id, constants.RESOURCE_TYPE.FILE, function(id) {
            var query = 'INSERT INTO FILES(resource_id,content) VALUES(?,?)';
            db.run(query, [id, content], function(err) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                callback(id);
            })
        });
    });
}

function updateFileContent(resource_id, content, callback) {
    console.log(resource_id, content)
    connectToDB(function(db) {
        var query = 'UPDATE FILES SET content=? where resource_id=?'
        db.run(query, [content, resource_id], function(err) {
            if (err) {
                throw err;
            }
            console.log(`Row(s) updated: ${this.changes}`);
            callback(resource_id)
        });
    });
}

function moveFile(resource_id, new_parent_id, callback) {
    connectToDB(function(db) {
        var query = 'UPDATE RESOURCES SET parent_id=? where resource_id=?'
        console.log(query);
        db.run(query, [new_parent_id, resource_id], function(err) {
            if (err) {
                throw err;
            }
            console.log(`Row(s) updated: ${this.changes}`);
            callback(resource_id);
        });
    });
}

function connectToDB(callback) {
    if (!local.db) {
        const db = new sqlite3.Database('../dms.db', (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Connected to the users.db database.');
            callback(db);
        });
    } else {
        callback(db);
    }
}
var local = {}

function closeDB() {
    // Always close the connection with database
    if (local.db) {
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
            delete local.db
        });
    }
}

function addUserToDatabase(email, password, callback) {
    connectToDB(function(db) {
        var query = 'INSERT into users(email,password) VALUES(?,?)';
        db.run(query, [email, password], function(err) {
            if (err) {
                console.log(err)
                throw err
            }
            var addroot_query = 'INSERT INTO RESOURCES(resource_name,resource_type,parent_id,created_by) VALUES(?,?,?,?)';
            console.log(this.lastID)
            var user_id = this.lastID
            db.run(addroot_query, ['root', constants.RESOURCE_TYPE.ROOT, 0, user_id], (err) => {
                if (err) {
                    console.log(err)
                    throw err
                }
                callback(user_id)
            })
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

function getResourcesByParentID(user_id, parent_id, callback) {
    connectToDB(function(db) {
        db.all('select * from RESOURCES where parent_id=? and created_by=?', [parent_id, user_id], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log(rows);
            callback(rows);
        });
    })
}

function getRootID(user_id, callback) {
    connectToDB(function(db) {
        db.get('select * from RESOURCES where resource_type=? and created_by=?', [constants.RESOURCE_TYPE.ROOT, user_id], (err, row) => {
            if (err) {
                throw err
            }
            console.log(row)
            callback(row.resource_id)
        });
    })
}

function checkResources(resource_ids, user_id, success, error) {

    connectToDB(function(db) {
        var query = 'select resource_id from RESOURCES where resource_id in (' + resource_ids.map(function() { return '?' }).join(',') + ') and created_by=?';
        console.log(query);
        db.all(query, resource_ids.concat([user_id]), (err, rows) => {
            console.log("test" + rows.length)
            if (err) {
                console.log(err);
            } else if (resource_ids.length == rows.length) {
                success()
            } else {
                error()
            }
        });
    })
}

function getUser(email, password, callback, errcallback) {
    console.log(email, password)
    connectToDB(function(db) {
        db.get('select * from users where email=? and password=?', [email, password], (err, row) => {
            console.log(row)
            if (err) {
                throw err;
            }
            if (row) {
                callback(row.user_id);
            } else {
                errcallback()
            }
        });
    })
}

function getFile(resource_id, callback) {
    connectToDB(function(db) {
        db.get('select RESOURCES.resource_id,content,resource_name,resource_type,parent_id from RESOURCES JOIN FILES ON RESOURCES.resource_id=FILES.resource_id where RESOURCES.resource_id=?', [resource_id], (err, rows) => {
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
    getResourcesByUserID: getResourcesByUserID,
    getResourcesByParentID: getResourcesByParentID,
    getRootID: getRootID,
    createFile: createFile,
    updateFileContent: updateFileContent,
    moveFile: moveFile,
    checkResources: checkResources,
    getUser: getUser,
    getFile: getFile
}

init();

module.exports = dbService