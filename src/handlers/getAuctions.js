import AWS from 'aws-sdk';

//middlewares imported
import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler';
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

export const handler = middy(getAuctions)
  .use(httpJsonBodyParser()) //automatically parse stringfied event body
  .use(httpEventNormalizer()) //will automatically adjust api gateway event object to prevent us from accidentally having non existent object when trying to access path parameters or query parameters which are not provided(avoid room for errors)
  .use(httpErrorHandler()); //handles error smoothly
//wrapping the function with middleware