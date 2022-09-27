export const issuedVc = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/security/data-integrity/v1'
  ],
  id: 'urn:uuid:cb6a2b0b-a749-40dc-9ce2-dd3d938508fc',
  type: [
    'VerifiableCredential'
  ],
  issuer: 'did:key:z6MkiimK73pVRzGLpj869NybZQqPTGGogmdPMmBaAHJF4uZD',
  issuanceDate: '2020-03-16T22:37:26.544Z',
  credentialSubject: {
    id: 'did:key:z6MktKwz7Ge1Yxzr4JHavN33wiwa8y81QdcMRLXQsrH9T53b'
  },
  proof: {
    type: 'DataIntegrityProof',
    created: '2022-09-27T13:29:25Z',
    verificationMethod: 'did:key:z6MkiimK73pVRzGLpj869NybZQqPTGGogmdPMmBaA' +
      'HJF4uZD#z6MkiimK73pVRzGLpj869NybZQqPTGGogmdPMmBaAHJF4uZD',
    cryptosuite: 'eddsa-2022',
    proofPurpose: 'assertionMethod',
    proofValue: 'z28qVMJ9ph8DPpbK4fGoK51DYVoU1rR41T6EqZoW9AZtpUPWjWYuq94eaa' +
      'cGt7eSxTxna1qy1agXzT7EXUwTEsEUx'
  }
};
