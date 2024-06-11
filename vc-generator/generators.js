/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {documentLoader} from './documentLoader.js';
import {invalidCreateProof} from './helpers.js';
import jsigs from 'jsonld-signatures';
import {klona} from 'klona';

const {AuthenticationProofPurpose} = jsigs.purposes;
const {CredentialIssuancePurpose} = vc;

// generator categories
export const generators = {
  created: {
    noCreated,
    invalidCreated,
    vcCreatedOneYearAgo
  },
  authentication: {
    invalidDomain,
    invalidChallenge
  },
  mandatory: {
    issuedVc,
    invalidProofType,
    noVerificationMethod,
    invalidVm,
    noProofPurpose,
    invalidProofPurpose
  }
};

/**
 * Takes in optionalTests and creates generators for those tests.
 *
 * @param {object} optionalTests - An optionalTests object.
 * @param {boolean} optionalTests.created - Add the created generators?
 * @param {boolean} optionalTests.authentication - Add the auth generators?
 *
 * @returns {Map<string, Function>} A map of generators.
 */
export const getGenerators = ({created, authentication}) => {
  let entries = Object.entries(generators.mandatory);
  if(created) {
    entries = entries.concat(Object.entries(generators.created));
  }
  if(authentication) {
    entries = entries.concat(Object.entries(generators.authentication));
  }
  return new Map(entries);
};

function invalidProofPurpose({suite, selectiveSuite, credential}) {
  const mockPurpose = 'invalidPurpose';
  //sets the proofPurpose for the proof
  suite.createProof = invalidCreateProof({mockPurpose});
  const purpose = new CredentialIssuancePurpose();
  // ensures the proofPurpose matches the term when deriving
  purpose.term = mockPurpose;
  return {suite, selectiveSuite, credential, purpose};
}

function invalidDomain({suite, selectiveSuite, credential}) {
  const domain = 'invalid-vc-domain.example.com';
  const challenge = '1235abcd6789';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return {suite, selectiveSuite, credential, purpose};
}

function invalidChallenge({suite, selectiveSuite, credential}) {
  const domain = 'domain.example';
  const challenge = 'invalid-challenge';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return {suite, selectiveSuite, credential, purpose};
}

function noProofPurpose({suite, selectiveSuite, credential}) {
  // do not add a proofPurpose to the proof
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  const purpose = new CredentialIssuancePurpose();
  // ensure the derived proof can find the baseProof
  purpose.term = undefined;
  return {suite, selectiveSuite, purpose, credential};
}

// both base and derived VCs will have an invalid verificationMethod
function invalidVm({suite, selectiveSuite, credential}) {
  suite.verificationMethod = 'did:key:invalidVm';
  return {suite, selectiveSuite, credential};
}

//both base and derived VCs will lack a verificationMethod
function noVerificationMethod({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addVm: false});
  return {suite, selectiveSuite, credential};
}

function invalidCreated({suite, selectiveSuite, credential}) {
  // suite.date will be used as created when signing
  suite.date = 'invalidDate';
  return {suite, selectiveSuite, credential};
}

function vcCreatedOneYearAgo({suite, selectiveSuite, credential}) {
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() - 365);
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  return {suite, selectiveSuite, credential};
}

function noCreated({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addCreated: false});
  return {suite, selectiveSuite, credential};
}

// both base and derived will have an invalid proof.type
function invalidProofType({suite, selectiveSuite, credential}) {
  suite.type = 'UnknownProofType';
  if(selectiveSuite) {
    const proofId = 'urn:uuid:no-proof-type-test';
    suite.proof = {id: proofId};
    selectiveSuite._cryptosuite.options.proofId = proofId;
  }
  return {suite, selectiveSuite, credential};
}

// issues both a base and derived vc
function issuedVc({suite, selectiveSuite, credential}) {
  return {suite, selectiveSuite, credential};
}

export async function issueCloned({
  suite, selectiveSuite, credential, loader = documentLoader,
  purpose = new CredentialIssuancePurpose(),
}) {
  const verifiableCredential = await vc.issue({
    credential: klona(credential),
    suite,
    documentLoader: loader,
    purpose
  });
  if(!selectiveSuite) {
    return verifiableCredential;
  }
  return jsigs.derive(verifiableCredential, {
    documentLoader: loader,
    purpose,
    suite: selectiveSuite
  });
}
