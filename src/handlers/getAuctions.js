import AWS from 'aws-sdk';

//middlewares imported
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';

//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

//To get all the items from database
async function getAuctions(event, context) {
    let auctions;

    try {
        const result = await dynamodb.scan({
            TableName: process.env.AUCTIONS_TABLE_NAME
        }).promise();
        auctions = result.Items;
    } catch (error) {
        throw new createError.InternalServerError(error);
    }

  return {
    statusCode: 201,
    body: JSON.stringify(auctions),
  };
}

//wrapping with a common middleware
export const handler = commonMiddleware(getAuctions);
