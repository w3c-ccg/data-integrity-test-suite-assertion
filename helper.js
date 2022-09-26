const {klona} = require('klona');
const {v4: uuidv4} = require('uuid');

export const createInitialVc = async ({issuer, vc}) => {
  const {settings: {id: issuerId, options}} = issuer;
  const body = {credential: klona(validVc), options};
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
