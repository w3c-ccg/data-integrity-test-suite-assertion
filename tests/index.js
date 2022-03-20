const {checkDataIntergrity} = require('..');
const validVC = require('./mock-credential/validVC.json');

describe('Test checkDataIntergrity()', function() {
  it('should pass if all the required properties exist and are of valid type.',
    async () => {
      checkDataIntergrity(validVC);
    });
});
