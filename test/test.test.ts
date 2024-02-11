import { describe, it, expect } from 'vitest';
import { getFilesInfo, buildTree, getTreeByFile } from '../src/main';

import treeMock from './mock/tree.json';
import infoMock from './mock/info.json';
import fileInfoMock from './mock/file-info.json';

describe('ts-tree', () => {
  it('getFilesInfo', () => {
    const filesInfo = getFilesInfo('test/test-project/**/*.ts');
    expect(filesInfo).toEqual(infoMock);
  });

  it('buildTree', () => {
    const tree = buildTree(infoMock);
    expect(tree).toEqual(treeMock);
  });

  it('getTreeByFile', () => {
    const tree = getTreeByFile('test/test-project/index.ts');
    expect(tree).toEqual(fileInfoMock);
  });
});
