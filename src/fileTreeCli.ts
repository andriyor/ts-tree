import fs from 'node:fs';

import { typeFlag } from 'type-flag';

import { getTreeByFile } from './fileTree';

const parsed = typeFlag({
  rootFile: {
    type: String,
    alias: 'r',
  },
  outputFile: {
    type: String,
    alias: 'o',
  },
  metaFile: {
    type: String,
    alias: 'm',
  },
});

if (parsed.flags.rootFile && parsed.flags.outputFile && parsed.flags.metaFile) {
  const meta = JSON.parse(fs.readFileSync(parsed.flags.metaFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.rootFile, meta);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.rootFile && parsed.flags.outputFile) {
  const tree = getTreeByFile(parsed.flags.rootFile);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.rootFile) {
  console.log(getTreeByFile(parsed.flags.rootFile));
} else {
  console.log('provide required --root-file option');
}
