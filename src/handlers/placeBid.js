import AWS from 'aws-sdk';

//importing common middeleware
import commonMiddleware from '../lib/commonMiddleware';
import createError from 'http-errors';
import { getAuctionById } from './getAuction';
import placeBidSchema from '../lib/schemas/placeBidSchema';
import validator from '@middy/validator';


//get dynamodDB package from AWS-SDK
const dynamodb = new AWS.DynamoDB.DocumentClient();

//To place aBid using Patch
async function placeBid(event, context) {
    const { id } = event.pathParameters;
    const { amount } = event.body;
    const { email } = event.requestContext.authorizer;

    const auction = await getAuctionById(id);

    //bid identity check
    if (email === auction.seller) {
        throw new createError.Forbidden(`You cannot bid for your auction`);
    }

    if (email === auction.highestBid.bidder) {
        throw new createError.Forbidden(`You have already bid for this auction`);
    }

    //Auction status check
    if (auction.status !== 'OPEN') {
        throw new createError.Forbidden('You cannot bid,auction is closed');
    }

    //Auction amount check
    if (amount <= auction.highestBid.amount) {
        throw new createError.Forbidden(`Your bid must be higher than ${auction.highestBid.amount}`);
    }


    //dynamodb update
    const params = {
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
        UpdateExpression: 'set highestBid.amount = :amount, highestBid.bidder = :bidder',
        ExpressionAttributeValues: {
            ':amount': amount,
            ':bidder': email,
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

export const handler = commonMiddleware(placeBid)
    .use(validator({ inpurSchema: placeBidSchema }));
