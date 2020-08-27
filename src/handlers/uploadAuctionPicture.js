import { getAuctionById } from './getAuction';
import { uploadPictureToS3 } from '../lib/uploadPictureToS3';
import middy from '@middy/core';
import httpErrorHandler from '@middy/http-error-handler';
import createError from 'http-errors';

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);
  const base64 = event.body.replace(/^data:image\/\w+;base64,/, '');//used to encode binary data like images
  const buffer = Buffer.from(base64, 'base64');
  //The easiest way to encode Base64 strings in Node.js is via the Buffer object

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + '.jpg', buffer);
    //pictureUrl
    const result = await setAuctionPictureUrl(pictureUrl).promise();
  } catch (error) {
      throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
}

export const handler = middy(uploadAuctionPicture)
    .use(httpErrorHandler);