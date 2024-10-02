/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import chai from 'chai';
import jsonld from 'jsonld';

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

/**
 * Posts a VC to a verifier and asserts on the response.
 *
 * @param {object} options - Options to use.
 * @param {object} options.credential - The credential to post.
 * @param {object} options.verifier - The verifier to post to.
 * @param {string} [options.reason] - The expected reason for the failure.
 * @param {object} [options.options] - Request specific options.
 *
 * @returns {Promise<object>} The result of the verification.
 */
export async function verificationSuccess({
  credential, verifier, reason, options = {}
} = {}) {
  const {settings: {options: verifierOptions}} = verifier;
  const body = {
    verifiableCredential: credential,
    options: {
      ...verifierOptions,
      // request specific options should overwrite endpoint options
      ...options
    }
  };
  const {data, error, result} = await verifier.post({json: body});
  should.not.exist(error, reason || 'Expected no error from verifier.');
  should.exist(result, reason || 'Expected verification to succeed.');
  result.status.should.equal(
    200,
    reason || 'Expected HTTP status 200 for successful verification'
  );
  return {data, result, error};
}

/**
 * Posts a VC to a verifier and asserts on the response.
 *
 * @param {object} options - Options to use.
 * @param {object} options.credential - The credential to post.
 * @param {object} options.verifier - The verifier to post to.
 * @param {string} [options.reason] - The expected reason for the failure.
 * @param {object} [options.options] - Request specific options.
 *
 * @returns {Promise<object>} The result of the verification.
 */
export async function verificationFail({
  credential, verifier, reason, options = {}
} = {}) {
  const {settings: {options: verifierOptions}} = verifier;
  const body = {
    verifiableCredential: credential,
    options: {
      ...verifierOptions,
      // request specific options should overwrite endpoint options
      ...options
    }
  };
  const {data, error, result} = await verifier.post({json: body});
  should.not.exist(result, reason || 'Expected no result from verifier.');
  should.exist(error, reason || 'Expected verifier to error.');
  shouldBeErrorResponse({response: error, reason});
  return {data, error, result};
}

export async function shouldFailIssuance({
  credential,
  issuer,
  reason,
  options = {}
}) {
  const {settings: {id: issuerId, options: issuerOptions}} = issuer;
  credential.issuer = issuerId;
  const body = {
    credential,
    options: {
      ...issuerOptions,
      ...options
    }
  };
  const {data, error, result} = await issuer.post({json: body});
  should.not.exist(result, reason || 'Expected no result from issuer.');
  should.exist(error, reason || 'Expected issuer to error.');
  shouldBeErrorResponse({
    response: error,
    //FIXME remove 500 after informing implementers that issuers must return 400
    //for invalid credentials
    expectedStatuses: [400, 422, 500],
    reason
  });
  return {data, error, result};
}

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

export function isObjectOrArrayOfObjects(value) {
  if(Array.isArray(value)) {
    return value.every(isObject);
  }
  return isObject(value);
}

/**
 * Returns true of a value is an object and is not null.
 *
 * @param {object} value - A value.
 *
 * @returns {boolean} Is the value a non-null object?
 */
export function isObject(value) {
  return (typeof value === 'object' && value !== null);
}

export function isStringOrArrayOfStrings(value) {
  if(Array.isArray(value)) {
    return value.every(isString);
  }
  return isString(value);
}

export function isString(value) {
  return (typeof value === 'string');
}

export function checkKeyType(keyType) {
  const supportedKeyTypes = ['P-256', 'P-384'];
  if(supportedKeyTypes.includes(keyType)) {
    return keyType;
  }
  throw new Error(`Unsupported ECDSA key type: ${keyType}.`);
}

export function shouldBeUrl({url, prop}) {
  should.exist(url, `Expected "${prop}" URL to exist.`);
  url.should.be.a('string', `Expected "${prop}" URL to be a string.`);
  let parsedUrl;
  let err;
  try {
    parsedUrl = new URL(url);
  } catch(e) {
    err = e;
  }
  should.not.exist(err, `Expected "${prop}" URL to be parsed.`);
  should.exist(parsedUrl, `Expected "${prop}" parsed URL to exist.`);
  parsedUrl.should.be.an.instanceOf(
    URL,
    `Expected "${prop}" parsed URL to be a URL.`);
}

export function shouldHaveProof({vc}) {
  should.exist(vc, 'Expected a Verifiable Credential.');
  vc.should.be.an('object', 'Expected Verifiable Credential to be an object.');
  const {proof} = vc;
  should.exist(proof, 'Expected proof to exist.');
}

export async function shouldMapToUrl({doc, term, prop, documentLoader}) {
  const expanded = await jsonld.expand({...doc}, {documentLoader});
  for(const terms of expanded) {
    const termProps = terms[term];
    should.exist(termProps,
      `Expected property "${term}" to exist.`);
    for(const term of termProps) {
      const url = term [prop];
      shouldBeUrl({url, prop: `"${term}" "${prop}"`});
    }
  }
}

/**
 * Checks that the proof has all mandatory values.
 *
 * @param {object} options - Options to use.
 * @param {object} options.proof - A DI Proof.
 */
export function shouldBeProof({proof}) {
  should.exist(proof, 'Expected VC to exist.');
  proof.should.be.an('object', 'Expected proof to be an object.');
  should.exist(proof.type, 'Expected proof to have a type.');
  isStringOrArrayOfStrings(proof.type).should.equal(
    true, 'Expected "proof.type" to be a string or an array of strings');
  should.exist(proof.proofPurpose, 'Expected "proof.proofPurpose" to exist.');
  proof.proofPurpose.should.be.a(
    'string', 'Expected "proof.proofPurpose" to be a string.');
  should.exist(proof.proofValue, 'Expected "proof.proofValue" to exist.');
  proof.proofValue.should.be.a(
    'string', 'Expected "proof.proofValue" to be a string.');
}

const statusReasons = {
  401: 'Received 401 Unauthorized.',
  404: 'Received 404 Not Found.',
  405: 'Received 405 Method Not Allowed.',
  408: 'Received 408 Request Timeout.',
  409: 'Received 409 Conflict.',
  413: 'Received 413 Payload to large.',
  415: 'Received 415 Unsupported Media Type.',
  500: 'Received 500 Internal Server Error.',
  501: 'Received 501 Not Implemented.'
};

/**
 * Throws an error if a negative test does not return 400 or 422.
 * A reason maybe provided such as "invalid proofValue" etc.
 *
 * @param {object} options - Options to use.
 * @param {Response} options.response - A fetch response.
 * @param {string} [options.reason = ''] - An optional reason.
 * @param {Array<number>} [options.expectedStatuses = [400, 422]] -
 *   An optional list of expected statuses.
 */
export function shouldBeErrorResponse({
  response,
  expectedStatuses = [400, 422],
  reason
}) {
  should.exist(response, reason || 'Expected an Error Response.');
  const {status} = response;
  should.exist(status, reason || 'Expected "errorResponse.status" to exist.');
  const statusNumber = Number.parseInt(status);
  if(!expectedStatuses.includes(statusNumber)) {
    const statusReason = statusReasons[statusNumber];
    statusNumber.should.be.oneOf(
      expectedStatuses, statusReason || 'received HTTP status ${status}');
  }
}

/**
 * Takes in a proof and verifies the proofValue.
 *
 * @param {object} options - Options to use.
 * @param {object} options.proof - A proof.
 * @param {string} options.expectedPrefix - The expected multibase prefix.
 * @param {string} options.encodingName - The expected encoding name.
 *
 * @returns {undefined} Throws if invalid.
 */
export function shouldHaveProofValue({proof, expectedPrefix, encodingName}) {
  should.exist(proof.proofValue, 'Expected proofValue to exist.');
  proof.proofValue.should.be.a('string', 'Expected proofValue to be a string.');
  proof.proofValue.slice(0, 1).should.equal(expectedPrefix,
    `Expected "proof.proofValue" to be a ${encodingName} value`);
  isValidMultibaseEncoded(proof.proofValue, expectedPrefix).should.equal(
    true,
    `Expected "proof.proofValue" to be a valid ${encodingName} value`);
}
