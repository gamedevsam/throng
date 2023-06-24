import { spawnPromise } from './utilities/spawn_promise.mjs';

spawnPromise('npx mocha "./src/test/*.ts" --bail', {
  outputPrefix: '[test_bail]: '
});
