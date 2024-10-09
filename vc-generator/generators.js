/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 */
import * as vc from '@digitalbazaar/vc';
import {getSuites} from './cryptosuite.js';
import {invalidCreateProof} from './helpers.js';
import jsigs from 'jsonld-signatures';

const {AuthenticationProofPurpose} = jsigs.purposes;
const {CredentialIssuancePurpose} = vc;

// default gen just passes params to issueCloned
const defaultGen = params => params;

// generator categories
export const generators = {
  // creates test vectors for Authentication Purpose tests
  authentication: {
    invalidDomain,
    invalidChallenge
  },
  // creates test vectors for `proof.created` & `proof.expires`
  dates: {
    noCreated,
    noOffsetCreated,
    noOffsetExpires,
    invalidCreated,
    invalidExpires,
    createdOneYearAgo
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
    undefinedTerm,
  },
  proofChain: {
    previousProofString: defaultGen,
    previousProofFail: defaultGen,
    previousProofArray: defaultGen,
    missingPreviousProofString: defaultGen,
    missingPreviousProofArray: defaultGen,
    proofSet: defaultGen
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
  },
  previousProofString({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
    proofId = 'urn:uuid:test:first:proof'
  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    firstSuite.proof = {id: proofId};
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    secondSuite.proof = {previousProof: proofId};
    return {
      suites: [firstSuite, secondSuite]
    };
  },
  previousProofFail({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
    proofId = 'urn:uuid:test:first:proof'

  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    firstSuite.proof = {id: proofId};
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    secondSuite.proof = {previousProof: proofId};
    return {
      suites: [firstSuite, secondSuite]
    };
  },
  previousProofArray({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
    proofId = 'urn:uuid:test:first:proof'
  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    firstSuite.proof = {id: proofId};
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    secondSuite.proof = {previousProof: [proofId]};
    return {
      suites: [firstSuite, secondSuite]
    };

  },
  missingPreviousProofString({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
    proofId = 'urn:uuid:test:first:proof'
  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    firstSuite.proof = {id: proofId};
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    secondSuite.proof = {previousProof: 'urn:uuid:test:missing:proof'};
    return {
      suites: [firstSuite, secondSuite]
    };
  },
  missingPreviousProofArray({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
    proofId = 'urn:uuid:test:first:proof'
  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    firstSuite.proof = {id: proofId};
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    secondSuite.proof = {previousProof: ['urn:uuid:test:missing:proof']};
    return {
      suites: [firstSuite, secondSuite]
    };
  },
  proofSet({
    cryptosuite,
    signer,
    mandatoryPointers,
    selectivePointers,
  }) {
    const {suite: firstSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    const {suite: secondSuite} = getSuites({
      cryptosuite, signer,
      mandatoryPointers, selectivePointers
    });
    return {
      suites: [firstSuite, secondSuite]
    };
  }
};

export const cleanups = {
  invalidBaseUrl({issuedCredential}) {
    issuedCredential['@context'] = issuedCredential['@context'].filter(c => {
      if(typeof c === 'string') {
        return true;
      }
      // if it has a base drop it from contexts
      return !('@base' in c);
    });
    return issuedCredential;
  },
  previousProofFail({issuedCredential}) {
    // make the first proof fail verification
    issuedCredential.proof[0].proofValue = 'invalidProofValue';
    return issuedCredential;
  }
};
/**
 * Takes in optionalTests and creates generators for those tests.
 *
 * @param {object} optionalTests - An optionalTests object.
 * @param {boolean} optionalTests.created - Add the date generators.
 * @param {boolean} optionalTests.expires - Add the date generators.
 * @param {boolean} optionalTests.dates - Add the date generators.
 * @param {boolean} optionalTests.authentication - Add the auth generators?
 * @param {boolean} optionalTests.proofChain - Add the proofChain generators.
 *
 * @returns {Map<string, Function>} A map of generators.
 */
export const getGenerators = optionalTests => {
  let entries = Object.entries(generators.mandatory);
  // for backwards compatibility check for these
  const {created, expires} = optionalTests;
  if(created || expires) {
    entries = entries.concat(Object.entries(generators.dates));
  }
  for(const key in optionalTests) {
    // if the key is true and there are generator for it
    if(optionalTests[key] && (key in generators)) {
      entries = entries.concat(Object.entries(generators[key]));
    }
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

function invalidCreated({suite, selectiveSuite, ...args}) {
  // suite.date will be used as created when signing
  suite.date = 'invalidDate';
  if(selectiveSuite) {
    selectiveSuite.date = 'invalidDate';
  }
  return {...args, suite, selectiveSuite};
}

function invalidExpires({suite, selectiveSuite, ...args}) {
  suite.proof = suite.proof || {};
  suite.proof.expires = 'invalidDate';
  if(selectiveSuite) {
    selectiveSuite.proof = selectiveSuite.proof || {};
    selectiveSuite.proof.expires = 'invalidDate';
  }
  return {...args, suite, selectiveSuite};
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
    suite.proof = suite.proof || {};
    suite.proof.id = proofId;
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
  // lop off ms precision from ISO timestamp
  const expires = new Date().toISOString().replace(/\.\d+Z$/, '');
  suite.proof = suite.proof || {};
  suite.proof.expires = expires;
  if(selectiveSuite) {
    selectiveSuite.proof = selectiveSuite.proof || {};
    selectiveSuite.proof.expires = expires;
  }
  return {...args, suite, selectiveSuite};
}

function invalidBaseUrl({credential, ...args}) {
  const _credential = structuredClone(credential);
  const invalidBaseContext = {
    '@base': 'https://invalid.example.com/',
  };
  if(Array.isArray(_credential['@context'])) {
    _credential['@context'].push(invalidBaseContext);
  } else {
    _credential['@context'] = [_credential['@context'], invalidBaseContext];
  }
  const relativeType = 'UndefinedCredential';
  if(Array.isArray(_credential.type)) {
    _credential.type.push(relativeType);
  } else {
    _credential.type = [_credential.type, relativeType];
  }
  return {...args, credential: _credential};
}
