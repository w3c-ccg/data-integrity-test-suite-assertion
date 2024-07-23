/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {v4 as uuidv4} from 'uuid';

/**
 * Calls on an issuer to create a Vc for the test.
 *
 * @param {object} options - Options to use.
 * @param {object} options.issuer - An issuer endpoint.
 * @param {object} options.credential - A credential to be issued.
 *
 * @throws {Error} Throws if the issuer fails.
 *
 * @returns {Promise<object>} The resulting data from the issuer.
 */
export async function createInitialVc({issuer, credential} = {}) {
  const {settings: {id: issuerId, options}} = issuer;
  const _credential = structuredClone(credential);
  // set a fresh id on the credential
  _credential.id = `urn:uuid:${uuidv4()}`;
  // use the issuer's id for the issuer property
  _credential.issuer = issuerId;
  const {data, error} = await issuer.post({json: {
    credential: _credential,
    options: {...options}
  }});
  if(error) {
    throw error;
  }
  return data;
}
