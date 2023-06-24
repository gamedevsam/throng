import { spawnPromise } from './utilities/spawn_promise.mjs';

spawnPromise('npx mocha "./src/test/*.ts"', {
  outputPrefix: '[test]: '
});
