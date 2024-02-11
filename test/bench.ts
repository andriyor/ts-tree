import { bench, run } from 'mitata';

import { getTreeByFile } from '../src/main';

bench('noop', () => {
  getTreeByFile('test/test-project/index.ts');
});

(async () => {
  await run({
    silent: false, // enable/disable stdout output
    avg: true, // enable/disable avg column (default: true)
    json: true, // enable/disable json output (default: false)
    colors: true, // enable/disable colors (default: true)
    min_max: true, // enable/disable min/max column (default: true)
    percentiles: false, // enable/disable percentiles column (default: true)
  });
})();
