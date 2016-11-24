/**
 * Created by tlaughlin on 11/23/2016.
 */
let http = require('http');

let TeamWorkDesk = function () {
};
TeamWorkDesk.prototype.testConnectivity = function (teamName, apiKey, callback) {

    let base64 = new Buffer(apiKey + ":xxx").toString("base64");

    const options = {
        hostname: teamName + ".teamwork.com",
        path: "/desk/v1/inboxes.json",
        method: "GET",
        headers: {
            "Authorization": "BASIC " + base64,
            "Content-Type": "application/json",
            "User-Agent": "nodeJS SlackApp"
        }
    };

    let req = http.request(options, function (res) {
        console.log("STATUS: " + res.statusCode);
        console.log("HEADERS: " + JSON.stringify(res.headers));
        res.setEncoding("utf8");
        res.on("data", function (chunk) {
            console.log("BODY: " + chunk);
            return callback(res.statusCode,chunk);
        });
    });

    req.on("error", function(e) {

        console.log("ERROR: " + e.message);
        return callback(res.statusCode,null);
    });

    req.end();
};

module.exports = new TeamWorkDesk();