import { describe, it, expect } from 'vitest';
import { remove } from 'wild-wild-path';

import { buildTree, getFilesInfo, getProjectTreeByFolder, getTreeByFolder } from '../src/folderTree';
import { getTreeByFile } from '../src/fileTree';

import folderTreeMock from './mock/folder-tree.json';
import folderInfoMock from './mock/folder-info.json';
import folderDeepTreeMock from './mock/folder-deep-tree.json';
import nestedFolderDeepTreeMock from './mock/nested-folder-deep-tree.json';

import fileTreeMock from './mock/file-tree.json';
import fileMetaTreeMock from './mock/file-additional-tree.json';

describe('ts-tree', () => {
  it('getFilesInfo', () => {
    const filesInfo = getFilesInfo('test/test-project/**/*.ts');
    expect(filesInfo).toEqual(folderInfoMock);
  });

  it('buildTree', () => {
    const tree = buildTree(folderInfoMock);
    expect(tree).toEqual(folderTreeMock);
  });

  it('getProjectTreeByFolder', () => {
    const tree = getProjectTreeByFolder('test/test-project/**/*.ts');
    expect(tree).toEqual(folderTreeMock);
  });

  it('getTreeByFolder', () => {
    const tree = getTreeByFolder('test/test-project/**/*.ts');
    const withoutIds = remove(tree, '**.id');
    const withoutParentIds = remove(withoutIds, '**.parentId');
    expect(withoutParentIds).toEqual(folderDeepTreeMock);
  });

  it('getTreeByFolder nested', () => {
    const tree = getTreeByFolder('test/test-project/nested/**/*.ts');
    const withoutIds = remove(tree, '**.id');
    const withoutParentIds = remove(withoutIds, '**.parentId');
    expect(withoutParentIds).toEqual(nestedFolderDeepTreeMock);
  });

  describe('getTreeByFile', () => {
    it('getTreeByFile without meta', () => {
      const tree = getTreeByFile('test/test-project/index.ts');
      const withoutIds = remove(tree, '**.id');
      const withoutParentIds = remove(withoutIds, '**.parentId');
      expect(withoutParentIds).toEqual(fileTreeMock);
    });

    it('getTreeByFile with meta', () => {
      const meta = {
        '/Users/aoriekhov/git/personal/ts-tree/test/test-project/nested.ts': {
          total: 20,
        },
      };

      const tree = getTreeByFile('test/test-project/index.ts', meta);
      const withoutIds = remove(tree, '**.id');
      const withoutParentIds = remove(withoutIds, '**.parentId');
      expect(withoutParentIds).toEqual(fileMetaTreeMock);
    });
  });
});
