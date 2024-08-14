/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc.
 */
import {checkKeyType} from './assertions.js';
import {createRequire} from 'node:module';
import {generateTestData} from './vc-generator/index.js';
import {runDataIntegrityProofFormatTests} from './suites/create.js';
import {runDataIntegrityProofVerifyTests} from './suites/verify.js';

const require = createRequire(import.meta.url);
export const validVc = require('./validVc.json');

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} options - Options to use.
 * @param {object} [options.credential = validVc] - A credential for
 *   the issuance tests.
 * @param {string} options.cryptosuiteName - A cryptosuite name.
 * @param {Map<string,object>} options.implemented - The vendors being tested.
 * @param {Array<string>} [options.expectedProofTypes] - An option to specify
 *   the expected proof types. The default value is set to
 *   ['DataIntegrityProof'].
  * @param {boolean} [options.isEcdsaTests] - A boolean option to specify
 *   if it is used in ecdsa test suite or not. The default value
 *   is set to false.
 * @param {string} [options.testDescription] - An option to define
 *   the test description. The default value is set to
 *   `Data Integrity (issuer)`.
 *
 * @returns {object} Returns the test suite being run.
 */
export function checkDataIntegrityProofFormat({
  implemented, expectedProofTypes = ['DataIntegrityProof'],
  cryptosuiteName, isEcdsaTests = false, credential = validVc,
  testDescription = 'Data Integrity (issuer)'
} = {}) {
  return describe(testDescription, function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Issuer';
    this.implemented = [];
    for(const [vendorName, {endpoints}] of implemented) {
      if(!endpoints) {
        throw new Error(`Expected ${vendorName} to have endpoints.`);
      }
      for(const endpoint of endpoints) {
        if(isEcdsaTests) {
          const {supportedEcdsaKeyTypes} = endpoint.settings;
          for(const supportedEcdsaKeyType of supportedEcdsaKeyTypes) {
            const keyType = checkKeyType(supportedEcdsaKeyType);
            this.implemented.push(`${vendorName}: ${keyType}`);
            runDataIntegrityProofFormatTests({
              cryptosuiteName, endpoints, expectedProofTypes, credential,
              testDescription: `${vendorName}: ${keyType}`, vendorName
            });
          }
        } else {
          this.implemented.push(vendorName);
          runDataIntegrityProofFormatTests({
            cryptosuiteName, credential, endpoints,
            expectedProofTypes, testDescription: vendorName, vendorName
          });
        }
      }
    } // end for loop
  }); // end describe
}

/**
 * Verifies a proof on Verifiable Credential.
 *
 * @param {object} options - Options to use.
 * @param {Map<string,object>} options.implemented - The vendors being tested.
 * @param {string} [options.expectedProofType] - An option to specify
 *   the expected proof type that is used to generate test titles.
 *   The default value is set to 'DataIntegrityProof'.
 * @param {boolean} [options.isEcdsaTests] - A boolean option to specify
 *   if it is used in ecdsa test suite or not. The default value
 *   is set to false.
 * @param {string} [options.testDescription] - An option to define
 *   the test description. The default value is set to
 *   `Data Integrity (verifier)`.
 * @param {object} options.testDataOptions - Options for test data creation
 *   such as suite.
 * @param {object} [options.optionalTests] - Options for running
 *   optional tests from DataIntegrity such as created and authentication.
 *
 * @returns {object} Returns the test suite being run.
 */
export function checkDataIntegrityProofVerifyErrors({
  implemented, expectedProofType = 'DataIntegrityProof',
  isEcdsaTests = false, testDescription = 'Data Integrity (verifier)',
  testDataOptions,
  optionalTests = {
    created: true,
    authentication: true
  }
} = {}) {
  return describe(testDescription, async function() {
    // this will tell the report
    // to make an interop matrix with this suite
    this.matrix = true;
    this.report = true;
    this.rowLabel = 'Test Name';
    this.columnLabel = 'Verifier';
    this.implemented = [];
    const credentials = {};
    before(async function() {
      const data = await generateTestData({...testDataOptions, optionalTests});
      // this might seem weird, but mocha won't wait for credentials to be set
      // before passing the credentials var to the tests
      // so we just update the credentials passed to the actual test suite
      Object.assign(credentials, data);
    });
    for(const [vendorName, {endpoints}] of implemented) {
      if(!endpoints) {
        throw new Error(`Expected ${vendorName} to have endpoints.`);
      }
      for(const endpoint of endpoints) {
        let name;
        // FIXME remove this in MAJOR release and use testDataOptions.keyType
        // if defined
        if(isEcdsaTests) {
          const {supportedEcdsaKeyTypes} = endpoint.settings;
          const keyTypes = supportedEcdsaKeyTypes.join(', ');
          name = `${vendorName}: ${keyTypes}`;
        } else if(testDataOptions?.keyType && !isEcdsaTests) {
          name = `${vendorName}: ${testDataOptions.keyType}`;
        } else {
          name = vendorName;
        }
        this.implemented.push(name);
        runDataIntegrityProofVerifyTests({
          endpoints,
          expectedProofType,
          testDescription: name,
          vendorName,
          credentials,
          testDataOptions,
          optionalTests
        });
      }
    } // end for loop
  }); // end describe
}
// export all assertions
export * as assertions from './assertions.js';
export {generators} from './vc-generator/generators.js';
export {deriveCloned, issueCloned} from './vc-generator/issuer.js';
export {
  dateRegex, expectedMultibasePrefix, isObjectOrArrayOfObjects,
  shouldBeErrorResponse, shouldBeUrl, isStringOrArrayOfStrings,
  isValidMultibaseEncoded, shouldBeBs58, shouldBeBase64NoPadUrl,
  verificationFail
} from './assertions.js';
export {createInitialVc} from './helpers.js';
