/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc.
 */
import {
  contexts as credentialsContexts
} from '@digitalbazaar/credentials-context';
import dataIntegrityCtx from '@digitalbazaar/data-integrity-context';
import didCtx from '@digitalcredentials/did-context';
import multikeyCtx from '@digitalbazaar/multikey-context';

const contextMap = new Map(credentialsContexts);

// add contexts for the documentLoader
contextMap.set(multikeyCtx.constants.CONTEXT_URL, multikeyCtx.CONTEXT);
contextMap.set(
  dataIntegrityCtx.constants.CONTEXT_URL,
  dataIntegrityCtx.contexts.get(dataIntegrityCtx.constants.CONTEXT_URL)
);
contextMap.set(
  didCtx.constants.DID_CONTEXT_URL,
  didCtx.contexts.get(
    didCtx.constants.DID_CONTEXT_URL)
);

export {contextMap};
