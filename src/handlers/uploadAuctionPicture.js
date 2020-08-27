import { getAuctionById } from './getAuction';
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import { setAuctionPictureUrl } from '../lib/setAuctionPictureUrl';

import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');//used to encode binary data like images
  const buffer = Buffer.from(base64, 'base64');
  //The easiest way to encode Base64 strings in Node.js is via the Buffer object

  if (auction.seller !== email) {
      throw new createError.Forbidden(`You are not the seller of this auction`);
  }
  let updatedAuction;
    try {
    //uploading picture to s3 bucket
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    console.log(pictureUrl);
    //updating the dynamodb table with pictureUrl
    updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
    console.log(updatedAuction);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({updatedAuction}),
  };
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler());