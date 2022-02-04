var PROTO_PATH = '../resources.proto';

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
var resourcesProto = grpc.loadPackageDefinition(packageDefinition).resources;

function main() {
    var target = 'localhost:50051';

    var client = new resourcesProto.ResourceService(target,
        grpc.credentials.createInsecure());
    module.exports = client;
}

main();