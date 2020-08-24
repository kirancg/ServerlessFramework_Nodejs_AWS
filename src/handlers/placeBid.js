import AWS from 'aws-sdk';

//importing common middeleware
import commonMiddleware from '../lib/commonMiddleware';

import createError from 'http-errors';

//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

//To place aBid using Patch
async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;

    //dynamodb update
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount',
        ExpressionAttributeValues: {
            ':amount': amount,
        },
        ReturnValues: 'ALL_NEW',
    };

    let updatedAuction;

    try {
        const result = dynamodb.update(params).promise();
        updatedAuction = result.Attributes;
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }

    return {
    statusCode: 201,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid);
