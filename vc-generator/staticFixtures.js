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
      fileName: 'previousProofMissingFail',
      version
    });
  },
  missingPreviousProofArray({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: '',
      version
    });
  },
  proofSet({suiteName, version}) {
    return getStaticFile({
      suiteName,
      fileName: '',
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
  return require(filePath);
}
