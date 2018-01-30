module.exports = function (RED) {
    var http = require('https');
    const request = require('request-promise');

    function GraphNode(config) {
        RED.nodes.createNode(this, config);
        var token = this.credentials.token;
        var node = this;

        var restCall = function (node, msg) {
            var options = {
                method: "POST",
                uri: "https://vodafone.leanix.net/services/pathfinder/v1/graphql",
                headers: {
                    "Authorization": "Bearer " + token,
                    'content-type': 'application/json'
                },
                body: {
                    query: 'query ($factSheetType: FactSheetType!) {allFactSheets(factSheetType: $factSheetType){edges{node{id}}}}',
                    variables: {
                        factSheetType: 'ITComponent'
                    }
                },
                json: true
            };

            request(options)
                .then(function (parsedBody) {
                    msg.payload.content= "It Works!";
                    console.log(parsedBody);
                    node.send(msg);
                })
                .catch(function (err) {
                    msg.payload.content= "Please input your Bearer Token";
                    node.send(msg);
                });
        }


        node.on('input', function (msg) {
            restCall(node, msg);
        });
    }
    RED.nodes.registerType("leanix-test", GraphNode, {
        credentials: {
            token: {
                type: "text"
            }
        }
    });
}