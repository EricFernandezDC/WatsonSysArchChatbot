module.exports = function(RED) {
    var http = require('https');
    const request = require('request-promise');

    function GraphNode(config) {
        RED.nodes.createNode(this, config);
        this.token = this.credentials.token;
        this.factType = config.factType;
        this.chatId = config.chatId;
        this.factTag = config.factTag;
        this.factTagId = config.factTagId;
        this.factLevel = config.factLevel;
        var node = this;

        var restCall = function(node, msg) {
            var id = "";
            var options = "";
            var name = "";
            var send = [];
            var fact = node.factType ? node.factType : msg.factType ? msg.factType : "";
            var tag = node.factTag ? node.factTag : msg.factTag ? msg.factTag : "";
            var tagId = node.factTagId ? node.factTagId : msg.factTagId ? msg.factTagId : "";
            var token = node.token ? node.token : msg.token ? msg.token : "";
            var level = node.factLevel ? node.factLevel : msg.factLevel ? msg.factLevel : [""];
            options = {
                method: "POST",
                uri: "https://vodafone.leanix.net/services/pathfinder/v1/graphql",
                headers: {
                    "Authorization": "Bearer " + token,
                    'content-type': 'application/json'
                },
                body: {
                    query: 'query($filter: FilterInput){allFactSheets(filter: $filter){edges{node{id name}}}}',
                    variables: {
                        filter: { facetFilters: [{ facetKey: 'FactSheetTypes', keys: [fact] }, { facetKey: tag, keys: [tagId] }] }
                    }
                },
                json: true
            };


            request(options)
                .then(function(parsedBody) {
                    for (var i = 0; i < 10; i++) {
                        id = parsedBody.data.allFactSheets.edges[i].node.id;
                        name = parsedBody.data.allFactSheets.edges[i].node.name;
                        send.push("\n" + name + " https://vodafone.leanix.net/vgsl/factsheet/" + fact + "/" + id + " ");
                    }
                    send = send.toString();
                    msg.payload = {
                        chatId: node.chatId ? node.chatId : msg.chatId,
                        type: "message",
                        content: "Here are the top 10 factsheets matching your query: " + send
                    };
                    node.send(msg);
                })
                .catch(function(err) {
                    msg.payload = {
                        chatId: node.chatId ? node.chatId : msg.chatId,
                        type: "message",
                        content: err + ", please check your inputs"
                    };
                    node.send(msg);
                });
        }


        node.on('input', function(msg) {
            restCall(node, msg);
        });
    }
    RED.nodes.registerType("leanix-graphql", GraphNode, {
        credentials: {
            token: {
                type: "text"
            }
        }
    });
}