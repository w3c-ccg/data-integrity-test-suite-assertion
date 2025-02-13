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

// setup the context map;
export const contextMap = new Map();
// add all the contexts here
addContexts({contexts: dataIntegrityCtx.contexts});
addContexts({contexts: didCtx.contexts});
addContexts({contexts: credentialsContexts});

//FIXME this really should be done in separate documentLoaders
//so that other tests do not get the modified context
//FIXME this also should be a structuredClone of the v2 context
//which replaces the original jsonld context in the contextMap
const {
  id: v1ContextUrl,
} = namedCredentialsContexts.get('v1');
const {
  id: v2ContextUrl,
} = namedCredentialsContexts.get('v2');
const v2Context = structuredClone(namedCredentialsContexts.get('v2').context);
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
const v2Ctx = v2Context['@context'];
// add invalidPurpose to context for test data
// //FIXME this should be in a separate documentLoader
v2Ctx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose =
diCtx.DataIntegrityProof['@context'].proofPurpose['@context'].invalidPurpose = {
  '@id': 'https://w3id.org/security#invalidPurpose',
  '@type': '@id',
  '@container': '@set'
};
//FIXME this should be in a separate documentLoader
v2Ctx.undefinedTerm = diCtx.undefinedTerm = 'urn:example:undefinedTerm';

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  _dataIntegrityCtx
);
contextMap.set(
  v2ContextUrl,
  v2Context
);

function copyTerm({context, oldTerm, newTerm}) {
  const ctx = context['@context'];
  ctx[newTerm] = structuredClone(ctx[oldTerm]);
}

function addContexts({contexts, map = contextMap, mutate = id => id}) {
  for(const [key, value] of contexts) {
    map.set(key, mutate(structuredClone(value)));
  }
}

export function getVcVersion(credential) {
  const [firstContext] = credential?.['@context'];
  if(firstContext === v2ContextUrl) {
    return '2.0';
  }
  if(firstContext === v1ContextUrl) {
    return '1.1';
  }
  throw new Error(`Could not determine vcVersion from context ${firstContext}`);
}
