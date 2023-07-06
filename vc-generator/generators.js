/*!
 * Copyright 2023 Digital Bazaar, Inc. All Rights Reserved
 */
import * as vc from '@digitalbazaar/vc';
import {DataIntegrityProof} from '@digitalbazaar/data-integrity';
import {documentLoader} from './documentLoader.js';
import {
  cryptosuite as eddsa2022CryptoSuite
} from '@digitalbazaar/eddsa-2022-cryptosuite';
import {invalidCreateProof} from './helpers.js';
import {klona} from 'klona';

export const vcGenerators = new Map([
  ['issuedVc', _issuedVc],
  ['invalidCryptosuite', _incorrectCryptosuite],
  ['invalidProofType', _incorrectProofType],
  ['noCreated', _noCreated],
  ['invalidCreated', _invalidCreated],
  ['noVm', _noVm],
  ['invalidVm', _invalidVm],
  ['noProofPurpose', _noProofPurpose],
  ['invalidProofPurpose', _invalidProofPurpose]
]);

async function _invalidProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({mockPurpose: 'invalidPurpose'});
  return _issueCloned({suite, credential});
}

async function _noProofPurpose({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addProofPurpose: false});
  return _issueCloned({suite, credential});
}

async function _invalidVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.verificationMethod = 'did:key:invalidVm';
  return _issueCloned({suite, credential});
}

async function _noVm({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addVm: false});
  return _issueCloned({suite, credential});
}

async function _invalidCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.date = 'invalidDate';
  return _issueCloned({suite, credential});
}

async function _noCreated({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.createProof = invalidCreateProof({addCreated: false});
  return _issueCloned({suite, credential});
}

async function _incorrectCryptosuite({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.cryptosuite = 'unknown-cryptosuite-2017';
  return _issueCloned({suite, credential});
}

async function _incorrectProofType({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  suite.type = 'UnknownProofType';
  return _issueCloned({suite, credential});
}

async function _issuedVc({signer, credential}) {
  const suite = _createEddsa2022Suite({signer});
  return _issueCloned({suite, credential});
}

function _createEddsa2022Suite({signer}) {
  // remove milliseconds precision
  const date = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const cryptosuite = eddsa2022CryptoSuite;
  return new DataIntegrityProof({signer, date, cryptosuite});
}

async function _issueCloned({suite, credential, loader = documentLoader}) {
  return vc.issue({
    credential: klona(credential),
    suite,
    documentLoader: loader
  });
}
