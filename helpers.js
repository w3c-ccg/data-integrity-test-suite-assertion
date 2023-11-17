/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import chai from 'chai';
import {klona} from 'klona';
import {v4 as uuidv4} from 'uuid';

const should = chai.should();

/**
 * Calls on an issuer to create a Vc for the test.
 *
 * @param {object} options - Options to use.
 * @param {object} options.issuer - An issuer endpoint.
 * @param {object} options.vc - A vc to be issued.
 *
 * @throws {Error} Throws if the issuer fails.
 *
 * @returns {Promise<object>} The resulting data from the issuer.
 */
export const createInitialVc = async ({issuer, vc} = {}) => {
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

// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

export const verificationFail = async ({
  credential, verifier, options = {}
} = {}) => {
  const body = {
    verifiableCredential: credential,
    options: {
      checks: ['proof'],
      ...options
    }
  };
  const {result, error} = await verifier.post({json: body});
  should.not.exist(result, 'Expected no result from verifier.');
  should.exist(error, 'Expected verifier to error.');
  should.exist(error.status, 'Expected verifier to return an HTTP Status code');
  error.status.should.equal(
    400,
    'Expected HTTP Status code 400 invalid input!'
  );
};

// Regex for valid  XML Schema 1.1 dateTimeStamp value
export const dateRegex = new RegExp('-?([1-9][0-9]{3,}|0[0-9]{3})' +
  '-(0[1-9]|1[0-2])' +
  '-(0[1-9]|[12][0-9]|3[01])' +
  'T(([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?|(24:00:00(\\.0+)?))' +
  '(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00))');

export function isObjectOrArrayOfObjects(data) {
  if(Array.isArray(data)) {
    return data.every(
      item => typeof item === 'object' && item !== null);
  }
  return typeof data === 'object' && data !== null;
}

export function isStringOrArrayOfStrings(data) {
  if(Array.isArray(data)) {
    return data.every(item => typeof item === 'string');
  }
  return typeof data === 'string';
}

export function getKeyType(supportedEcdsaKeyTypes) {
  const supportedKeyTypes = ['P-256', 'P-384'];
  for(const keyType of supportedKeyTypes) {
    if(supportedEcdsaKeyTypes.includes(keyType)) {
      return keyType;
    }
  }
  return null;
}
