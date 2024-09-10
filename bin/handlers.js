/*!
 * Copyright (c) 2024 Digital Bazaar, Inc.
 */
import {writeFile} from 'node:fs/promises';

export async function checkSpecText({specUrl, suiteLog}) {
  const specUrls = Array.isArray(specUrl) ? specUrl : [specUrl];
}
