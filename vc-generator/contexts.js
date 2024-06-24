/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as credentialsV2Context from '@digitalbazaar/credentials-v2-context';
import credentialsCtx from 'credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map();

const _dataIntegrityCtx = structuredClone(dataIntegrityCtx.CONTEXT);
const diCtx = _dataIntegrityCtx['@context'];
// add UnknownProofType to local context for test data
diCtx.UnknownProofType =
  structuredClone(_dataIntegrityCtx['@context'].DataIntegrityProof);
// add invalidPurpose to context for test data
diCtx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose = {
  '@id': 'https://w3id.org/security#invalidPurpose',
  '@type': '@id',
  '@container': '@set'
};

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  _dataIntegrityCtx
);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);
contextMap.set(
  credentialsCtx.constants.CONTEXT_URL,
  credentialsCtx.contexts.get(
    credentialsCtx.constants.CONTEXT_URL)
);
contextMap.set(
  credentialsV2Context.constants.CONTEXT_URL,
  credentialsV2Context.contexts.get(
    credentialsV2Context.constants.CONTEXT_URL
  )
);

export {contextMap};
