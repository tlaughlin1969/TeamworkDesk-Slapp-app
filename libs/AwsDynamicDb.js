let AWS = require("aws-sdk");
let AwsDynamicDb = function () {
};



AwsDynamicDb.prototype.createTable =function () {
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


    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.log("Table already exists");
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
};

module.exports = new AwsDynamicDb();