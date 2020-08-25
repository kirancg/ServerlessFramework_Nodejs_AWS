import { v4 as uuid } from 'uuid';
import AWS from 'aws-sdk';

//middlewares imported
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import createAuctionSchema from '../lib/schemas/createAuctionSchema';
import validator from '@middy/validator';

//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createAuction(event, context) {
  const { title } = event.body;
  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now.toISOString(),
    //setting a global secondary index
    endingAt: endDate.toISOString(),
    highestBid: {
      amount: 0,
    }
  };

  //inserting item(record) to dynamodb
  try {
    await dynamodb.put({
      TableName: process.env.AUCTIONS_TABLE_NAME,
      Item: auction,
    }).promise();
  } catch(error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
//first service

  return {
    statusCode: 201,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(createAuction)
  .use(validator({ inputSchema: createAuctionSchema, useDefaults: true }));

/*
  .use(httpJsonBodyParser()) //automatically parse stringfied event body
  .use(httpEventNormalizer()) //will automatically adjust api gateway event object to prevent us from accidentally having non existent object when trying to access path parameters or query parameters which are not provided(avoid room for errors)
  .use(httpErrorHandler()); //handles error smoothly
//wrapping the function with middleware */