/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc.
 */
import {
  contexts as credentialsContexts,
  named as namedCredentialsContexts
} from '@digitalbazaar/credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map(credentialsContexts);

const {context: v2Context} = namedCredentialsContexts.get('v2');
copyTerm({
  context: v2Context,
  oldTerm: 'DataIntegrityProof',
  newTerm: 'UnknownProofType'
});
const _dataIntegrityCtx = structuredClone(dataIntegrityCtx.CONTEXT);
copyTerm({
  context: _dataIntegrityCtx,
  oldTerm: 'DataIntegrityProof',
  newTerm: 'UnknownProofType'
});
const diCtx = _dataIntegrityCtx['@context'];
// add UnknownProofType to local context for test data
diCtx.UnknownProofType = structuredClone(diCtx.DataIntegrityProof);
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

function copyTerm({context, oldTerm, newTerm}) {
  const ctx = context['@context'];
  ctx[newTerm] = structuredClone(ctx[oldTerm]);
}

export {contextMap};
