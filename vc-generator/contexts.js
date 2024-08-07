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
//FIXME this really should be done in separate documentLoaders
//so that other tests do not get the modified context
//FIXME this also should be a structuredClone of the v2 context
//which replaces the original jsonld context in the contextMap
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
// add invalidPurpose to context for test data
// //FIXME this should be in a separate documentLoader
diCtx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose = {
  '@id': 'https://w3id.org/security#invalidPurpose',
  '@type': '@id',
  '@container': '@set'
};
//FIXME this should be in a separate documentLoader
v2Context['@context'].undefinedTerm = diCtx.undefinedTerm = {
  '@id': 'https://w3id.org/security#undefinedTerm',
  '@type': 'https://w3id.org/security#termString'
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
