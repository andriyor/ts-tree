import fs from 'node:fs';
import path from 'node:path';

import { remove } from 'wild-wild-path';

import { buildTree, getFilesInfo, getTreeByFolder } from '../src/folderTree';
import { getTreeByFile } from '../src/fileTree';

const folderInfo = getFilesInfo('test/test-project/**/*.ts');
const folderTree = buildTree(folderInfo);

fs.writeFileSync('./test/mock/folder-info.json', JSON.stringify(folderInfo, null, 2));
fs.writeFileSync('./test/mock/folder-tree.json', JSON.stringify(folderTree, null, 2));

const fileTree = getTreeByFile('test/test-project/index.ts');
const withoutIds = remove(fileTree, '**.id');
const withoutParentIds = remove(withoutIds, '**.parentId');
fs.writeFileSync('./test/mock/file-tree.json', JSON.stringify(withoutParentIds, null, 2));

const meta = {
  [path.join(process.cwd(), 'test/test-project/nested.ts')]: {
    total: 20,
  },
};
const fileAdditionalTree = getTreeByFile('test/test-project/index.ts', meta);
const additionalWithoutIds = remove(fileAdditionalTree, '**.id');
const AdditionalwithoutParentIds = remove(additionalWithoutIds, '**.parentId');
fs.writeFileSync('./test/mock/file-additional-tree.json', JSON.stringify(AdditionalwithoutParentIds, null, 2));


const folderDeepTree = getTreeByFolder('test/test-project/**/*.ts');
const withoutIdsTree = remove(folderDeepTree, '**.id');
const withoutParentIdsTree = remove(withoutIdsTree, '**.parentId');
fs.writeFileSync('./test/mock/folder-deep-tree.json', JSON.stringify(withoutParentIdsTree, null, 2));

const nestedFolderDeepTreeNested = getTreeByFolder('test/test-project/nested/**/*.ts');
const withoutIdsTreeNested = remove(nestedFolderDeepTreeNested, '**.id');
const withoutParentIdsTreeNested = remove(withoutIdsTreeNested, '**.parentId');
fs.writeFileSync('./test/mock/nested-folder-deep-tree.json', JSON.stringify(withoutParentIdsTreeNested, null, 2));
