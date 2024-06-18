# data-integrity-test-suite-assertion Changelog

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
