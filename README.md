# data-integrity-test-suite-assertion

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Test](#test)
- [Usage](#usage)
- [Implementation](#implementation)

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
// Require `data-integrity-test-suite-assertion` in the test suite
const {checkDataIntegrityProofFormat} = require('data-integrity-test-suite-assertion');

describe('Check data proof format', function() {
  // Validate the proof on the data
  checkDataIntegrityProofFormat({data, vendorName: 'Digital Bazaar'});
})
```
