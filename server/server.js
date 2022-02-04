var PROTO_PATH = '../resources.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var dbService = require('./database');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });
var resourcesProto = grpc.loadPackageDefinition(packageDefinition).resources;

/**
 * Create Folder
 */
function createFolder(message, callback) {
    var folder_name = message.request.name
    dbService.createResource(folder_name, message.request.user_id, function(id) {
        callback(null, {
            resource_id: id,
            resource_name: folder_name
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

function addUser(message, callback) {
    dbService.addUserToDatabase(message.request.email, message.request.password, function(id) {
        console.log(id);
        callback(null, { user_id: id })
    })
}

function getResources(message, callback) {
    dbService.getResourcesByUserID(message.request.user_id, function(resources) {
        callback(null, { resources });
    });
}


/**
 * Starts an RPC server 
 */
function main() {
    var server = new grpc.Server();
    server.addService(resourcesProto.ResourceService.service, {
        createFolder: createFolder,
        getAllResources: getAllResources,
        addUser: addUser,
        getResources: getResources
    });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();