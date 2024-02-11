import { describe, it, expect } from 'vitest';
import { getTree } from '../src/main';

describe('ts-tree', () => {
  it('getTree', () => {
    const tree = getTree('test/test-project/**/*.ts');
    expect(tree).toEqual({
      nodes: [
        {
          path: '/Users/aoriekhov/git/personal/ts-tree/test/test-project/dep.ts',
          label: './dep',
        },
      ],
      edges: [
        {
          source: '/Users/aoriekhov/git/personal/ts-tree/test/test-project/index.ts',
          target: '/Users/aoriekhov/git/personal/ts-tree/test/test-project/dep.ts',
        },
      ],
    });
  });
});
