let AWS = require("aws-sdk");
const tableName = "SlackTeamdesk";

let AwsDynamicDb = function () {
};
AwsDynamicDb.prototype.getSlackTeamDataFromMsg = function (msg,callback) {
    AWS.config.update({
        region: "us-east-2"
    });
    let docClient = new AWS.DynamoDB.DocumentClient();
    let params;
    params = {
        TableName: tableName,
        Key: {
            "teamId": msg.meta.team_id
        }
    };
    docClient.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            return callback(err,data);
        } else {
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            return callback(err,data);
        }
    });
};
AwsDynamicDb.prototype.CreateTeam = function(msg,data) {
    AWS.config.update({
        region: "us-east-2"
    });
    let docClient = new AWS.DynamoDB.DocumentClient();


    let params;
    params = {
        TableName: tableName,
        Item: {
            "teamId": msg.meta.team_id,
            "data": data
        }
    };


    console.log("Adding a new item...");
    docClient.put(params, function(err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
};

AwsDynamicDb.prototype.createTable = function () {
    AWS.config.update({
        region: "us-east-2"
    });
    let dynamodb = new AWS.DynamoDB();
    let params = {
        TableName: tableName,
        KeySchema: [
            {AttributeName: "teamId", KeyType: "HASH"}
        ],
        AttributeDefinitions: [
            {AttributeName: "teamId", AttributeType: "S"}
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    };
    let listTablesParams = {};
    let tableExists = false;
    dynamodb.listTables(listTablesParams, function (err, data) {
        if (err)
            console.log(JSON.stringify(err, null, 2));
        else
            {
                let i = 0, len = data.TableNames.length;
                for (; i < len; i++) {
                                if (data.TableNames[i] === tableName) {
                                    tableExists = true;
                                }
                            }
            }
        if (tableExists === false) {
            dynamodb.createTable(params, function (err, data) {
                if (err) {
                    console.error(err);
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                }
            });
        } else {
            console.log("Table already exists")
        }

    });


};

module.exports = new AwsDynamicDb();