import { spawnPromise } from './utilities/spawn_promise.mjs';

spawnPromise('rm -rf dist', {
  outputPrefix: '[clean]: '
});
