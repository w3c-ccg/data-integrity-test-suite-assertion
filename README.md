# data-integrity-test-suite-assertion

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Test](#test)
- [Usage](#usage)

## Background
This library exports a function `checkDataIntegrityProofFormat()` that can be
called in other test suites (such as Ed25519, BBS+, etc.) to validate the
structure of the proofs on a document.

## Install

```js
npm i
```

## Test

```js
npm test
```

## Usage

```js
// Import `data-integrity-test-suite-assertion` in the test suite
import {endpoints} from 'vc-api-test-suite-implementations';
import {
  checkDataIntegrityProofFormat,
  checkDataIntegrityProofVerifyErrors
} from 'data-integrity-test-suite-assertion';

// examples =>
const tag = 'eddsa-2022';
const {
  match: matchingIssuers,
  nonMatch: nonMatchingIssuers
} = endpoints.filterByTag({
  tags: [tag],
  property: 'issuers'
});

const {
  match: matchingVerifiers,
  nonMatch: nonMatchingVerifiers
} = endpoints.filterByTag({
  tags: [tag],
  property: 'verifiers'
});

// an optional parameter for
// testing optional features
const optionalTests = {
  // turns on contextInjection tests
  contextInjection: true,
  // turns on tests related to dates
  dates: true,
  // turns on tests related to authentication
  authentication: true
};
// an optional parameter that
// specifies a credential to test against
const credential = {
  "@context": [
    "https://www.w3.org/ns/credentials/v2",
    {
      "@protected": true,
      "DriverLicenseCredential": "urn:example:DriverLicenseCredential",
      "DriverLicense": {
        "@id": "urn:example:DriverLicense",
        "@context": {
          "@protected": true,
          "id": "@id",
          "type": "@type",
          "documentIdentifier": "urn:example:documentIdentifier",
          "dateOfBirth": "urn:example:dateOfBirth",
          "expirationDate": "urn:example:expiration",
          "issuingAuthority": "urn:example:issuingAuthority"
        }
      },
      "driverLicense": {
        "@id": "urn:example:driverLicense",
        "@type": "@id"
      }
    }
  ],
  "id": "urn:uuid:36245ee9-9074-4b05-a777-febff2e69758",
  "type": ["VerifiableCredential", "DriverLicenseCredential"],
  "credentialSubject": {
    "id": "urn:uuid:1a0e4ef5-091f-4060-842e-18e519ab9440",
    "driverLicense": {
      "type": "DriverLicense",
      "documentIdentifier": "T21387yc328c7y32h23f23",
      "dateOfBirth": "01-01-1990",
      "expirationDate": "01-01-2030",
      "issuingAuthority": "VA"
    }
  }
};
// if the suite is data integrity complaint
// cryptosuiteName is mandatory
const cryptosuiteName = 'ecdsa-sd-2023';

// an optional list of proof types VC
// issued by an implementation will have
const expectedProofTypes = [
  'DataIntegrityProof',
  'MyProofType'
]

checkDataIntegrityProofFormat({
  implemented: matchingIssuers,
  optionalTests,
  credential,
  cryptosuiteName,
  expectedProofTypes
});

// a parameter for how the verifier
// tests will produce VCs for the verifier
const testDataOptions = {
  suiteName: cryptosuiteName,
  // a key the suite can issue with
  key,
  // the cryptosuite being tests
  cryptosuite = myCryptosuite,
  // optional parameter for selective disclosure tests
  // using JSON pointers
  mandatoryPointers,
  // optional parameter for selective disclosure tests
  // using JSON pointers
  selectivePointers,
  // an optional parameter specifying a documentLoader
  // used to issue VCs
  documentLoader,
  // the testVector to use to produce VCs
  // for the verifier
  testVector: credential
};
checkDataIntegrityProofVerifyErrors({
  implemented: matchingVerifiers,
  optionalTests,
  // an optional parameter to specify the expected proof type
  expectedProofType: 'DataIntegrityProof',
  testDataOptions
});
```
