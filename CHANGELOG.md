# data-integrity-test-suite-assertion Changelog

## 1.5.1 -

### Added
- Test fixtures can now be provided from static json files in `/inputs`.

### Fixed
- Tests for `eddsa-rdfc-2022` previousProof/ProofChain now use correct fixtures.

## 1.4.0 - 2024-10-06

### Added
- A new parameter `optionalTests` to `checkDataIntegrityProofFormat`.
- A new parameter `credential` to `checkDataIntegrityProofFormat`.
- Add a new assertion `verificationSuccess` to `assertions`.

## 1.3.1 - 2024-08-07

### Added
- export new API `createDocLoader` that can create documentLoaders with
  contexts & did key support.

### Fixed
- Adds a documentLoader to all issuer suite tests.
- Fixes minor issues with verify suite.

## 1.3.0 - 2024-08-02

### Added
- A new export `assertions` with all the assertions in it.
- A new common assertion `shouldBeErrorResponse`.

### Changed
- Switched from `credentials-context` to `@digitalbazaar/credentials-context`.

## 1.2.0 - 2024-06-18

### Added
- A new section shared in generators with shared generators.
- Generators pass unused parameters to next generator.
- Export both `issueCloned` and `deriveCloned`.
- A new parameter `cryptosuiteName` for the issuer tests.

## 1.1.0 - 2024-06-13

### Added
- The ability to specify `testDataOptions` for verification tests for cryptosuites.
- Ability to create test vectors locally by passing in a Data Integrity compatible cryptosuite.
- Ability to create test vectors using the VC 2.0 context.
- Generators for test data are exported and re-usable in other suites.

## 1.0.0 - 2023-07-03

### Added
- Initial release, see individual commits for history.
- Exports for helper functions that can be used in other test suites.
