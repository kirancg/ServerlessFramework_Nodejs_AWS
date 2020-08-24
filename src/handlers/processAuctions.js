import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closingAuction } from '../lib/closingAuction';
import createError from 'http-errors';

async function processAuctions(event, auction) {

    try {
        const auctionsToClose = await getEndedAuctions();
        const result = auctionsToClose.map(auction => closingAuction(auction));
        Promise.all(result);
        return { closed: result.length };
    } catch (error) {
        console.log(error);
        throw new createError.InternalServerError(error);
    }
}

export const handler = processAuctions;