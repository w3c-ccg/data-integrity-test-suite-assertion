/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {contextMap} from './contexts.js';
import {JsonLdDocumentLoader} from 'jsonld-document-loader';
const jdl = new JsonLdDocumentLoader();

// add contexts to documentLoader
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}

export const documentLoader = jdl.build();
