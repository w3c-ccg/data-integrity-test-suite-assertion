/*!
 * Copyright 2023-2024 Digital Bazaar, Inc.
 */
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const defaultKey = require('./defaultKey.json');
// This is only for use inside this test suite for generating vcs for the verify
// proof tests.
export const getDefaultKey = async () => Ed25519Multikey.from(defaultKey);
