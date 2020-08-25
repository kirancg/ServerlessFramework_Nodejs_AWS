import AWS from 'aws-sdk';
import validator from '@middy/validator';

//middlewares imported
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import getAuctionSchema from '../lib/schemas/getAuctionSchema';

//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

//To get all the items from database
async function getAuctions(event, context) {
  let auctions;
  const { status } = event.queryStringParameters;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: 'statusAndEndDate',
    KeyConditionExpression: '#status = :status',
    ExpressionAttributeValues: {
      ':status': status
    },
    ExpressionAttributeNames: {
      '#status': 'status'
    }
  };
  try {
    const result = await dynamodb.query(params).promise();
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
export const handler = commonMiddleware(getAuctions)
  .use(validator({ inputSchema: getAuctionSchema, useDefaults: true }));
