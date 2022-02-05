var PROTO_PATH = '../resources.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var services = require('./services');
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
 * Starts an RPC server 
 */
function main() {
    var server = new grpc.Server();
    console.log(services)
    server.addService(resourcesProto.ResourceService.service, services);
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
    });
}

main();