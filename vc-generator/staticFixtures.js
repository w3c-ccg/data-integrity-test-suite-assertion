/*!
 * Copyright 2024 Digital Bazaar, Inc.
 */
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

export const staticFixtures = {
  async previousProofString({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofStringOk',
      version
    });
  },
  async previousProofFail({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofNotStringFail',
      version
    });
  },
  async previousProofArray({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofArrayOk',
      version
    });
  },
  async missingPreviousProofString({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofStringMissingFail',
      version
    });
  },
  async missingPreviousProofArray({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofArrayMissingFail',
      version
    });
  },
  async proofSet({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: '',
      version
    });
  }
};

export async function getStaticFile({
  suiteName,
  fileName,
  version
}) {
  const filePath = `../inputs/${suiteName}/${version}-${fileName}` +
    `-SimpleSigned2.json`;
  try {
    return require(filePath);
  } catch(e) {
    // if the module is not found return null
    if(e?.code === 'MODULE_NOT_FOUND') {
      return null;
    }
    throw e;
  }
}
