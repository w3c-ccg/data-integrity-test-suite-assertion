import {klona} from 'klona';
import {v4 as uuidv4} from 'uuid';

export const createInitialVc = async ({issuer, vc}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const body = {credential: klona(vc), options};
  // set a fresh id on the credential
  body.credential.id = `urn:uuid:${uuidv4()}`;
  // use the issuer's id for the issuer property
  body.credential.issuer = issuerId;
  const {data, error} = await issuer.post({json: body});
  if(error) {
    throw error;
  }
  return data;
};
