export const sdDoc = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    {
      '@protected': true,
      DriverLicenseCredential: 'urn:example:DriverLicenseCredential',
      DriverLicense: {
        '@id': 'urn:example:DriverLicense',
        '@context': {
          '@protected': true,
          id: '@id',
          type: '@type',
          documentIdentifier: 'urn:example:documentIdentifier',
          dateOfBirth: 'urn:example:dateOfBirth',
          expirationDate: 'urn:example:expiration',
          issuingAuthority: 'urn:example:issuingAuthority'
        }
      },
      driverLicense: {
        '@id': 'urn:example:driverLicense',
        '@type': '@id'
      }
    }
  ],
  id: 'urn:uuid:36245ee9-9074-4b05-a777-febff2e69757',
  type: ['VerifiableCredential', 'DriverLicenseCredential'],
  credentialSubject: {
    id: 'urn:uuid:1a0e4ef5-091f-4060-842e-18e519ab9440',
    driverLicense: {
      type: 'DriverLicense',
      documentIdentifier: 'T21387yc328c7y32h23f23',
      dateOfBirth: '01-01-1990',
      expirationDate: '01-01-2030',
      issuingAuthority: 'VA'
    }
  }

};
