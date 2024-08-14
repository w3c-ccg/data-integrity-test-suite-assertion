/*!
 * Copyright (c) 2023-2024 Digital Bazaar, Inc.
 */
import * as didKey from '@digitalbazaar/did-method-key';
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

export const documentLoader = createDocLoader({contexts: contextMap});

/**
 * Creates a documentLoader with cached contexts and support for
 * multiple did key types.
 *
 * @param {object} options - Options to use.
 * @param {Map<string, object>} [options.contexts = contextMap] - A list of
 *   contexts.
 * @param {[{header: string, fromMultibase: Function}]} options.keyTypes - An
 *  array of did key types to support.
 *
 * @returns {Function} A documentLoader function.
 */
export function createDocLoader({contexts = contextMap, keyTypes = []} = {}) {
  const driver = didKey.driver();
  for(const {header, fromMultibase} of keyTypes) {
    driver.use({
      multibaseMultikeyHeader: header,
      fromMultibase
    });
  }
  return async url => {
    if(url.startsWith('did:')) {
      const document = await driver.get({did: url});
      return {
        contextUrl: null,
        documentUrl: url,
        document
      };
    }
    const document = contexts.get(url);
    if(document) {
      return {
        contextUrl: null,
        documentUrl: url,
        document
      };
    }
  };
}
