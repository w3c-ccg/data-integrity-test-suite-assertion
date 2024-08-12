/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {getSuites} from './cryptosuite.js';
import {invalidCreateProof} from './helpers.js';
import jsigs from 'jsonld-signatures';

const {AuthenticationProofPurpose} = jsigs.purposes;
const {CredentialIssuancePurpose} = vc;

// generator categories
export const generators = {
  // creates test vectors for `proof.created`
  created: {
    noCreated,
    noOffsetCreated,
    noOffsetExpires,
    invalidCreated,
    createdOneYearAgo
  },
  // creates test vectors for Authentication Purpose tests
  authentication: {
    invalidDomain,
    invalidChallenge
  },
  // these generators are needed for DI specific tests
  // and maybe be needed in suite specific tests
  mandatory: {
    noVerificationMethod,
    noProofPurpose,
    issuedVc,
    invalidCryptosuite,
    invalidProofPurpose,
    invalidProofType,
    invalidBaseUrl,
    invalidVm,
    undefinedTerm
  },
  // creates a set of shared test vector generators
  // not necessarily used in DI Assertion itself, but used
  // in multiple suites
  shared: {}
};

// some generators require bespoke setup
export const setups = {
  undefinedTerm({selectivePointers, ...args}) {
    if(selectivePointers) {
      return getSuites({
        ...args,
        selectivePointers: [
          ...selectivePointers,
          '/credentialSubject/undefinedTerm'
        ]
      });
    }
    return getSuites({...args});
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

// NOTE: ...args is for passing args intended for other generators
// we return ...args first in order to overwrite any potential conflicts
// such as Proof Purpose or date
function invalidProofPurpose({
  suite,
  selectiveSuite,
  credential,
  mockPurpose = 'invalidPurpose',
  ...args
}) {
  //sets the proofPurpose for the proof
  suite.createProof = invalidCreateProof({mockPurpose});
  const purpose = new CredentialIssuancePurpose();
  // ensures the proofPurpose matches the term when deriving
  purpose.term = mockPurpose;
  return {...args, suite, selectiveSuite, credential, purpose};
}

function undefinedTerm({credential, selectiveSuite, ...args}) {
  const _credential = structuredClone(credential);
  _credential.credentialSubject.undefinedTerm = 'undefinedTerm';
  if(selectiveSuite) {
    selectiveSuite?._cryptosuite?.options?.selectivePointers.push(
      '/credentialSubject/undefinedTerm');
  }
  return {...args, credential: _credential, selectiveSuite};
}

// adds an invalid domain
function invalidDomain({
  suite,
  selectiveSuite,
  credential,
  domain = 'invalid-vc-domain.example.com',
  challenge = '1235abcd6789',
  ...args}) {
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return {...args, suite, selectiveSuite, credential, purpose};
}

function invalidChallenge({
  suite,
  selectiveSuite,
  credential,
  domain = 'domain.example',
  challenge = 'invalid-challenge',
  ...args
}) {
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return {...args, suite, selectiveSuite, credential, purpose};
}

function noProofPurpose({suite, selectiveSuite, credential, ...args}) {
  // do not add a proofPurpose to the proof
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  const purpose = new CredentialIssuancePurpose();
  // ensure the derived proof can find the baseProof
  purpose.term = undefined;
  return {...args, suite, selectiveSuite, purpose, credential};
}

// both base and derived VCs will have an invalid verificationMethod
function invalidVm({
  suite,
  selectiveSuite,
  credential,
  mockVM = 'did:key:invalidVm',
  ...args
}) {
  suite.verificationMethod = mockVM;
  if(selectiveSuite) {
    selectiveSuite.verificationMethod = mockVM;
  }
  return {...args, suite, selectiveSuite, credential};
}

//both base and derived VCs will lack a verificationMethod
function noVerificationMethod({suite, selectiveSuite, credential, ...args}) {
  suite.createProof = invalidCreateProof({addVm: false});
  return {...args, suite, selectiveSuite, credential};
}

function invalidCreated({suite, selectiveSuite, credential, ...args}) {
  // suite.date will be used as created when signing
  suite.date = 'invalidDate';
  if(selectiveSuite) {
    selectiveSuite.date = 'invalidDate';
  }
  return {...args, suite, selectiveSuite, credential};
}

function createdOneYearAgo({
  suite,
  selectiveSuite,
  createdSkew = -365,
  ...args}) {
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() + createdSkew);
  // lop off ms precision from ISO timestamp
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  if(selectiveSuite) {
    selectiveSuite.date = suite.date;
  }
  return {...args, suite, selectiveSuite};
}

function noCreated({suite, selectiveSuite, credential, ...args}) {
  suite.createProof = invalidCreateProof({addCreated: false});
  return {...args, suite, selectiveSuite, credential};
}

// both base and derived will have an invalid proof.type
function invalidProofType({
  suite,
  selectiveSuite,
  credential,
  proofType = 'UnknownProofType',
  ...args
}) {
  suite.type = proofType;
  if(selectiveSuite) {
    const proofId = 'urn:uuid:no-proof-type-test';
    suite.proof = {id: proofId};
    selectiveSuite._cryptosuite.options.proofId = proofId;
    selectiveSuite.type = proofType;
  }
  return {...args, suite, selectiveSuite, credential};
}

// changes the cryptosuite name to another value for
// invalid cryptosuite tests
function invalidCryptosuite({
  suite,
  selectiveSuite,
  cryptosuiteName = 'UnknownCryptosuite',
  ...args
}) {
  suite.cryptosuite = cryptosuiteName;
  if(selectiveSuite) {
    selectiveSuite.cryptosuite = cryptosuiteName;
  }
  return {...args, suite, selectiveSuite};
}

// issues a normal or derived vc
function issuedVc({suite, selectiveSuite, credential, ...args}) {
  return {...args, suite, selectiveSuite, credential};
}

function noOffsetCreated({suite, selectiveSuite, ...args}) {
  const created = new Date();
  // lop off ms precision from ISO timestamp
  suite.date = created.toISOString().replace(/\.\d+Z$/, '');
  if(selectiveSuite) {
    selectiveSuite.date = suite.date;
  }
  return {...args, suite, selectiveSuite};
}

function noOffsetExpires({suite, selectiveSuite, ...args}) {
  const expires = new Date().toISOString().replace(/\.\d+Z$/, '');
  // lop off ms precision from ISO timestamp
  suite.proof = {expires};
  if(selectiveSuite) {
    selectiveSuite.proof = {...suite.proof, ...selectiveSuite.proof};
  }
  return {...args, suite, selectiveSuite};
}

function invalidBaseUrl({credential, ...args}) {
  const _credential = structuredClone(credential);
  _credential['@context'].push({
    '@base': 'https://invalid.example.com/',
    '@vocab': '/vocab/'
  });
  _credential.type.push('UndefinedCredential');
  return {...args, credential: _credential};
}
