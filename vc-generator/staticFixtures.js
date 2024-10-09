/*!
 * Copyright 2024 Digital Bazaar, Inc.
 */
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

export const staticFixtures = {
  previousProofString({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofStringOk',
      version
    });
  },
  previousProofFail({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofNotStringFail',
      version
    });
  },
  previousProofArray({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofArrayOk',
      version
    });
  },
  missingPreviousProofString({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofStringMissingFail',
      version
    });
  },
  missingPreviousProofArray({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: 'previousProofArrayMissingFail',
      version
    });
  }
};

export function getStaticFile({
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
