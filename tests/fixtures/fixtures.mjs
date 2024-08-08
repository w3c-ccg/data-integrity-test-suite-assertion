// fixtures.mjs
import {cryptosuites} from './constants.js';
import {getMultiKey} from './keys/index.js';

// can be async or not
export async function mochaGlobalSetup() {
  const suites = await Promise.all(cryptosuites.map(
    async ([suiteName, testDataOptions]) => {
      const key = await getMultiKey({
        ...testDataOptions
      });
      return [suiteName, {key, ...testDataOptions}];
    }));
  this.cryptosuites = new Map(suites);
}
