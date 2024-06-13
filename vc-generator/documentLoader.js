/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {contextMap} from './contexts.js';
// FIXME disable JsonLdDocumentLoader until jsonld
// major release 9 and vc-gen refactor
/*
import {JsonLdDocumentLoader} from 'jsonld-document-loader';
const jdl = new JsonLdDocumentLoader();

// add contexts to documentLoader
for(const [key, value] of contextMap) {
  jdl.addStatic(key, value);
}
*/

export const documentLoader = async url => {
  const document = contextMap.get(url);
  if(document) {
    return {
      contextUrl: null,
      documentUrl: url,
      document
    };
  }
};
