import AWS from 'aws-sdk';

//middlewares imported
/*import middy from '@middy/core';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpEventNormalizer from '@middy/http-event-normalizer';
import httpErrorHandler from '@middy/http-error-handler'; */

//importing common middeleware
import commonMiddleware from '../lib/commonMiddleware';

import createError from 'http-errors';

//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
    let auction;
    try {
        const result = await dynamodb.get({
            TableName: process.env.AUCTIONS_TABLE_NAME,
            Key: { id }
        }).promise();
        auction = result.Item;
    } catch (error) {
        throw new createError.InternalServerError(error);
    }

    if (!auction) {
        throw new createError.NotFound(`Auction with ID "${id}" not found `);
    }

    return auction;
}

//To get all the items from database
async function getAuction(event, context) {
    const { id } = event.pathParameters;
    const auction = await getAuctionById(id);

    return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);

    /*middy(getAuction)
  .use(httpJsonBodyParser()) //automatically parse stringfied event body
  .use(httpEventNormalizer()) //will automatically adjust api gateway event object to prevent us from accidentally having non existent object when trying to access path parameters or query parameters which are not provided(avoid room for errors)
  .use(httpErrorHandler()); //handles error smoothly
//wrapping the function with middleware */