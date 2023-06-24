import { spawnPromise } from './utilities/spawn_promise.mjs';

spawnPromise('npx tsc --module commonjs --outDir dist/cjs', {
  outputPrefix: '[build]: '
});
spawnPromise('npx tsc --module es2022 --outDir dist/esm', {
  outputPrefix: '[build]: '
});
