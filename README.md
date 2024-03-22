# ts-tree

## Install 

```shell
npm i @andriyorehov/ts-graph
```

## Usage

```ts
import { getTreeByFile } from '@andriyorehov/ts-graph';

const tree = getTreeByFile('filePath.ts');
console.dir(tree, { depth: null });
```

## How it works


## TODO

- [x] tree by folder dependencies
- [x] tree by file dependencies
- [x] ignore third-party dependencies
- [x] alias handling
- [x] ignore types/interface/enum/`as const` dependencies from file tree
- [x] ignore types/interface/enum/`as const` dependencies from folder tree
- [x] ignore object which used only in types for folder tree
- [x] handle `ExportDeclaration` with moduleSpecifier
- [x] exclude barrel files from file tree
- [x] exclude barrel files from folder tree
- [x] guarantee id uniqueness of file tree
- [x] guarantee id uniqueness of folder tree
- [x] pass meta info about files to file tree
- [ ] pass meta info about files to folder tree
- [x] arg parser for file tree
- [x] include used export by parent
- [x] check named imports from same file on different lines for file tree
- [ ] check named imports from same file on different lines for folder tree
- [x] handle default import for file tree
- [x] handle default import for folder tree
- [x] build package
- [x] use tsconfig related to passed file path to allow running not from project root directory
- [x] publish to npm
- [x] handle files outside of folder tree
- [x] return flat list to simplify processing
- [ ] more performant getTreeByFolder
- [ ] check barrel files handling for default import

## Tech Debt

- [ ] try https://github.com/thepassle/module-graph
- [ ] add test for id uniqueness
- [ ] reuse code between file and folder tree builder
- [ ] cache file tree builer
- [ ] upgrade `find-up` to latest version with ESM
- [ ] try https://github.com/sindresorhus/find-up-simple
- [ ] try [find-up-simple](https://github.com/sindresorhus/find-up-simple)

## Alternative

[node-dependency-tree](https://github.com/dependents/node-dependency-tree) - used by [madge](https://github.com/pahen/madge) doesn't support ts alias [path mapping](https://github.com/dependents/node-dependency-tree/issues/135)

[dependency-tree](https://github.com/canva-public/dependency-tree) - archived

[module-graph](https://github.com/thepassle/module-graph) - just recently released and it looks like best solution
