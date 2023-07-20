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

checkDataIntegrityProofFormat({
  implemented: matchingIssuers
});

checkDataIntegrityProofVerifyErrors({
  implemented: matchingVerifiers
});
```
