/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import chai from 'chai';

const should = chai.should();
// RegExp with bs58 characters in it
const bs58 =
  /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;

/**
 *  Regex to test conformity to base-64-url-no-pad character set.
 *
 * @see {@link https://www.w3.org/TR/vc-data-integrity/#multibase-0} for
 * specification.
*/
const BASE_64URL_NOPAD_REGEX = /^[A-Za-z0-9\-_]+$/;

// assert something is entirely bs58 encoded
export const shouldBeBs58 = s => bs58.test(s);

export const shouldBeBase64NoPadUrl = s => BASE_64URL_NOPAD_REGEX.test(s);

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

export function expectedMultibasePrefix(cryptosuite) {
  const b64urlNoPadSuites = ['ecdsa-sd-2023', 'bbs-2023'];

  if(b64urlNoPadSuites.includes(cryptosuite)) {
    return {
      prefix: 'u',
      name: 'base64url-no-pad'
    };
  }

  return {
    prefix: 'z',
    name: 'base58btc'
  };
}

export function isValidMultibaseEncoded(rawValue, multibasePrefix) {
  switch(multibasePrefix) {
    case 'z':
      return shouldBeBs58(rawValue);
    case 'u':
      return shouldBeBase64NoPadUrl(rawValue);
    default:
      throw new Error(`Unhandled encoding prefix: ${multibasePrefix}.`);
  }
}

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

export function checkKeyType(keyType) {
  const supportedKeyTypes = ['P-256', 'P-384'];
  if(supportedKeyTypes.includes(keyType)) {
    return keyType;
  }
  throw new Error(`Unsupported ECDSA key type: ${keyType}.`);
}
