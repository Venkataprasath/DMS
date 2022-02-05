const { all } = require('async');
const constants = require('../constants');
var dbService = require('./database');
var error = require('../error');

/**
 * Create Folder
 */
function createFolder(message, callback) {
    var folder_name = message.request.name
    dbService.getRootID(message.request.user_id, function(parent_id) {
        dbService.createResource(folder_name, message.request.user_id, parent_id, constants.RESOURCE_TYPE.FOLDER, function(id) {
            callback(null, {
                resource_id: id,
                resource_name: folder_name
            });
        });
    });
}
/**
 * get all resource from database
 * @param {*} message 
 * @param {*} callback 
 */
function getAllResources(message, callback) {
    dbService.getAllResources(function(resources) {
        callback(null, { resources });
    })
}

/**
 * Add user to database
 * @param {*} message 
 * @param {*} callback 
 */
function addUser(message, callback) {
    dbService.addUserToDatabase(message.request.email, message.request.password, function(id) {
        console.log(id);
        callback(null, { user_id: id })
    })
}

/**
 * Get resources by user id & parent id
 * @param {*} message 
 * @param {*} callback 
 */
function getResources(message, callback) {
    if (!message.request.parent_id) {
        dbService.getRootID(message.request.user_id, function(parent_id) {
            getFromDB(message.request.user_id, parent_id)
        })
    } else
        getFromDB(message.request.user_id, message.request.parent_id)

    function getFromDB(user_id, parent_id) {
        dbService.getResources({ user_id: user_id, parent_id: parent_id }, function(resources) {
            callback(null, { resources });
        });
    }
}

function checkPermissions(resources, callback, errcallback) {
    dbService.checkResources(resources, callback, errcallback)
}

function createFile(message, callback) {
    checkPermissions([message.request.parent_id], function() {
        var file = message.request;
        dbService.createFile(file.resource_name, fileuser_id, message.file.parent_id, file.content, function(id) {
            callback(null, { id })
        })
    }, err => {
        callback(null, { error_code: error.NOT_ALLOWED })
    })
}

function updateFile(message, callback) {
    checkPermissions([message.request.resource_id], function() {
        var file = message.request;
        dbService.updateFileContent(file.resource_id, file.content, function(id) {
            callback(null, { id })
        })
    }, err => {
        callback(null, { error_code: error.NOT_ALLOWED })
    })
}

function moveFile(message, callback) {
    var request = message.request;
    checkPermissions([request.resource_id, request.new_parent_id], function() {
        dbService.moveFile(request.resource_id, file.new_parent_id, function(id) {
            callback(null, { id })
        })
    }, err => {
        callback(null, { error_code: error.NOT_ALLOWED })
    })
}

var _this = {
    createFolder: createFolder,
    getAllResources: getAllResources,
    getResources: getResources,
    addUser: addUser,
    createFile: createFile,
    updateFile: updateFile,
    moveFile: moveFile
}
module.exports = _this