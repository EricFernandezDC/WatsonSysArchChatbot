module.exports = function(RED) {
    var http = require('https');
    const request = require('request-promise');

    function FactNode(config) {
        RED.nodes.createNode(this, config);
        var token = this.credentials.token;
        this.factType = config.factType;
        this.chatId = config.chatId;
        var node = this;

        var restCall = function(node, msg) {
            var id = "";
            var name = "";
            var send = [];
            var fact = node.factType ? node.factType : msg.factType ? msg.factType : "";
            var options = {
                method: "GET",
                uri: "https://vodafone.leanix.net/services/pathfinder/v1/factSheets?type=" + fact + "&pageSize=10&permissions=false",
                headers: {
                    "Authorization": "Bearer " + token
                },
                json: true
            }

            request(options)
                .then(function(repos) {
                    for (var i = 0; i < 10; i++) {
                        id = repos.data[i].id;
                        name = repos.data[i].name;
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
                        content: "Please input your Bearer Token"
                    };
                    node.send(msg);
                });
        }


        node.on('input', function(msg) {
            restCall(node, msg);
        });
    }
    RED.nodes.registerType("leanix-factsheet", FactNode, {
        credentials: {
            token: { type: "text" }
        }
    });
}