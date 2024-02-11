import { describe, it, expect } from 'vitest';
import { getFilesInfo, buildTree } from '../src/main';
import treeMock from './mock/tree.json';
import infoMock from './mock/info.json';

describe('ts-tree', () => {
  it('getFilesInfo', () => {
    const filesInfo = getFilesInfo('test/test-project/**/*.ts');
    expect(filesInfo).toEqual(infoMock);
  });

  it('buildTree', () => {
    const tree = buildTree(infoMock);
    expect(tree).toEqual(treeMock);
  });
});
