/*!
 * Copyright (c) 2023 Digital Bazaar, Inc. All rights reserved.
 */
import {contextMap} from './contexts.js';
// disable JsonLdDocumentLoader support for now
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
  return {
    contextUrl: null,
    documentUrl: url,
    document
  };
};
