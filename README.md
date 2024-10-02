# data-integrity-test-suite-assertion

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Test](#test)
- [Usage](#usage)
- [Implementations](#implementations)

## Background
The library exports normative suites for Data Integrity:
- `checkDataIntegrityProofFormat` checks the proofs of VCs issued with a Data Integrity Suite.
- `checkDataIntegrityProofVerifyErrors` checks conformant verifiers for support of a Data Integrity Suite.

These functions create mocha suites intended to work with the [mocha-w3c-interop-reporter](https://www.npmjs.com/package/@digitalbazaar/mocha-w3c-interop-reporter)
The suites test normative statements found in the [Verifiable Credential Data Integrity 1.0 specification.](https://w3c.github.io/vc-data-integrity/)

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
const cryptosuiteName = 'eddsa-2022';

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

## Implementations
Implementations passed to this suite must implement the [VC-API](https://w3c-ccg.github.io/vc-api/)
This suite requires that an implementer have implemented at least 2 routes for a Data Integrity Suite:
1. POST [/credentials/issue](https://w3c-ccg.github.io/vc-api/#issue-credential) in issuers 
2. POST [/credentials/verify](https://w3c-ccg.github.io/vc-api/#verify-credential) in verifiers
3. POST [/presentations/verify](https://w3c-ccg.github.io/vc-api/#verify-presentation) in vpVerifiers

Endpoints should conform to [VC-API Error Handling](https://w3c-ccg.github.io/vc-api/#error-handling).
Errors should conform to [Data Integrity Processing Errors](https://w3c.github.io/vc-data-integrity/#processing-errors)

See the [VC Test Suite Implementations README](https://github.com/w3c/vc-test-suite-implementations) for more details on endpoints.
