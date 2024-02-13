import fs from 'node:fs';

import { remove } from 'wild-wild-path';

import { buildTree, getFilesInfo } from '../src/folderTree';
import { getTreeByFile } from '../src/fileTree';

const folderInfo = getFilesInfo('test/test-project/**/*.ts');
const folderTree = buildTree(folderInfo);

fs.writeFileSync('./test/mock/folder-info.json', JSON.stringify(folderInfo, null, 2));
fs.writeFileSync('./test/mock/folder-tree.json', JSON.stringify(folderTree, null, 2));

const fileTree = getTreeByFile('test/test-project/index.ts');
const withoutIds = remove(fileTree, '**.id');
const withoutParentIds = remove(withoutIds, '**.parentId');
fs.writeFileSync('./test/mock/file-tree.json', JSON.stringify(withoutParentIds, null, 2));
