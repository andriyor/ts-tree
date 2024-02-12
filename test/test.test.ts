import { describe, it, expect } from 'vitest';
import { getFilesInfo, buildTree, getTreeByFile, FileInfo } from '../src/main';

import treeMock from './mock/tree.json';
import infoMock from './mock/info.json';
import fileInfoMock from './mock/file-info.json';

const withoutId = (filesInfo: FileInfo[]) => {
  return filesInfo.map((i) => {
    const { id, ...rest } = i;
    return rest;
  });
};

const objWitoutId = (obj: Record<string, FileInfo>) => {
  return Object.values(obj).reduce(
    (prev, cur) => {
      const { id, ...rest } = obj[cur.path] as FileInfo;
      // @ts-expect-error
      prev[cur.path] = rest;
      return prev;
    },
    {} as Record<string, FileInfo>,
  );
};

describe('ts-tree', () => {
  it('getFilesInfo', () => {
    const filesInfo = getFilesInfo('test/test-project/**/*.ts');
    expect(withoutId(filesInfo)).toEqual(infoMock);
  });

  it('buildTree', () => {
    // @ts-expect-error
    const tree = buildTree(infoMock);
    expect(tree).toEqual(treeMock);
  });

  it('getTreeByFile', () => {
    const tree = getTreeByFile('test/test-project/index.ts');
    const withoutId = objWitoutId(tree);
    expect(withoutId).toEqual(fileInfoMock);
  });
});
