/*!
 * Copyright 2023-24 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {documentLoader} from './documentLoader.js';
import {invalidCreateProof} from './helpers.js';
import jsigs from 'jsonld-signatures';
import {klona} from 'klona';

const {AuthenticationProofPurpose} = jsigs.purposes;
const {CredentialIssuancePurpose} = vc;

// generator categories
const generators = {
  created: [
    ['noCreated', _noCreated],
    ['invalidCreated', _invalidCreated],
    ['vcCreatedOneYearAgo', _vcCreatedOneYearAgo]
  ],
  authentication: [
    ['invalidDomain', _invalidDomain],
    ['invalidChallenge', _invalidChallenge]
  ],
  mandatory: [
    ['issuedVc', _issuedVc],
    ['invalidProofType', _invalidProofType],
    ['noVm', _noVm],
    ['invalidVm', _invalidVm],
    ['noProofPurpose', _noProofPurpose],
    ['invalidProofPurpose', _invalidProofPurpose]
  ]
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
  let entries = [...generators.mandatory];
  if(created) {
    entries = entries.concat([...generators.created]);
  }
  if(authentication) {
    entries = entries.concat([...generators.authentication]);
  }
  return new Map(entries);
};

async function _invalidProofPurpose({suite, selectiveSuite, credential}) {
  const mockPurpose = 'invalidPurpose';
  //sets the proofPurpose for the proof
  suite.createProof = invalidCreateProof({mockPurpose});
  const purpose = new CredentialIssuancePurpose();
  // ensures the proofPurpose matches the term when deriving
  purpose.term = mockPurpose;
  return _issueCloned({suite, selectiveSuite, credential, purpose});
}

async function _invalidDomain({suite, selectiveSuite, credential}) {
  const domain = 'invalid-vc-domain.example.com';
  const challenge = '1235abcd6789';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, selectiveSuite, credential, purpose});
}

async function _invalidChallenge({suite, selectiveSuite, credential}) {
  const domain = 'domain.example';
  const challenge = 'invalid-challenge';
  const purpose = new AuthenticationProofPurpose({challenge, domain});
  return _issueCloned({suite, selectiveSuite, credential, purpose});
}

async function _noProofPurpose({suite, selectiveSuite, credential}) {
  // do not add a proofPurpose to the proof
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  const purpose = new CredentialIssuancePurpose();
  // ensure the derived proof can find the baseProof
  purpose.term = undefined;
  return _issueCloned({suite, selectiveSuite, purpose, credential});
}

// both base and derived VCs will have an invalid verificationMethod
async function _invalidVm({suite, selectiveSuite, credential}) {
  suite.verificationMethod = 'did:key:invalidVm';
  return _issueCloned({suite, selectiveSuite, credential});
}

//both base and derived VCs will lack a verificationMethod
async function _noVm({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _invalidCreated({suite, selectiveSuite, credential}) {
  // suite.date will be used as created when signing
  suite.date = 'invalidDate';
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _vcCreatedOneYearAgo({suite, selectiveSuite, credential}) {
  // intentionally set the created date to be a year ago
  const created = new Date();
  created.setDate(created.getDate() - 365);
  suite.date = created.toISOString().replace(/\.\d+Z$/, 'Z');
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _noCreated({suite, selectiveSuite, credential}) {
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, selectiveSuite, credential});
}

// both base and derived will have an invalid proof.type
async function _invalidProofType({suite, selectiveSuite, credential}) {
  suite.type = 'UnknownProofType';
  if(selectiveSuite) {
    const proofId = 'urn:uuid:no-proof-type-test';
    suite.proof = {id: proofId};
    selectiveSuite._cryptosuite.options.proofId = proofId;
  }
  return _issueCloned({suite, selectiveSuite, credential});
}

// issues both a base and derived vc
async function _issuedVc({suite, selectiveSuite, credential}) {
  return _issueCloned({suite, selectiveSuite, credential});
}

async function _issueCloned({
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
    documentLoader,
    purpose,
    suite: selectiveSuite
  });
}
