/*!
 * Copyright (c) 2022-2023 Digital Bazaar, Inc. All rights reserved.
 */
import {
  checkKeyType, createInitialVc, dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, isValidMultibaseEncoded, shouldBeBase64NoPadUrl,
  shouldBeBs58, verificationFail
} from './helpers.js';
import {createRequire} from 'node:module';
import {runDataIntegrityProofFormatTests} from './suites/create.js';
import {runDataIntegrityProofVerifyTests} from './suites/verify.js';

const require = createRequire(import.meta.url);
export const validVc = require('./validVc.json');

/**
 * Validates the structure of the "proof" property on a digital document.
 *
 * @param {object} options - Options to use.
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
  isEcdsaTests = false, testDescription = 'Data Integrity (issuer)'
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
              endpoints, expectedProofTypes,
              testDescription: `${vendorName}: ${keyType}`, vendorName
            });
          }
        } else {
          this.implemented.push(vendorName);
          runDataIntegrityProofFormatTests({
            endpoints, expectedProofTypes,
            testDescription: vendorName, vendorName
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
          testDataOptions,
          optionalTests
        });
      }
    } // end for loop
  }); // end describe
}

export {generators, issueCloned} from './vc-generator/generators.js';
export {
  createInitialVc, dateRegex, expectedMultibasePrefix,
  isObjectOrArrayOfObjects,
  isStringOrArrayOfStrings, isValidMultibaseEncoded, shouldBeBs58,
  shouldBeBase64NoPadUrl, verificationFail
};
