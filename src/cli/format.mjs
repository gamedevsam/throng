import { spawnPromise } from './utilities/spawn_promise.mjs';

spawnPromise(
  'npx prettier --config ./infrastructure/prettier/prettier.config.json --ignore-path ./infrastructure/prettier/.prettierignore --write *.json src infrastructure',
  {
    outputPrefix: '[format]: '
  }
);
