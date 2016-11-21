let AWS = require("aws-sdk");
let AwsDynamicDb = function () {
};


AwsDynamicDb.prototype.createTable = function () {
    AWS.config.update({
        region: "us-east-2"
    });
    let dynamodb = new AWS.DynamoDB();
    const tableName = "SlackTeamdesk";
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