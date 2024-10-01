# ts-tree

Creates a module tree based on a given entrypoint.

Builds on top of [ts-morph](https://github.com/dsherret/ts-morph)

## Install

```shell
npm i @andriyorehov/ts-graph
```

## Usage

Per file

```ts
import { getTreeByFile } from '@andriyorehov/ts-graph';

const tree = getTreeByFile('filePath.ts');
console.dir(tree, { depth: null });
```

Per folder
```ts
import { getTreeByFolder } from '@andriyorehov/ts-graph';

const tree = getTreeByFolder('filePath.ts');
console.dir(tree, { depth: null });
```


## Comparison table

| Feature/Name                   | ts-tree                                         | [module-graph](https://github.com/thepassle/module-graph)       | [node-dependency-tree](https://github.com/dependents/node-dependency-tree) |
| ------------------------------ | ----------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ts support                     | ✅ TypeScript (via typescript)                  | ✅ es-module-lexer                                              | ✅                                                                         |
| ts alias support               | ✅                                              | ✅                                                              | ❌ [issue](https://github.com/dependents/node-dependency-tree/issues/135)  |
| jsx support                    | ✅                                              | ❌ [issue](https://github.com/thepassle/module-graph/issues/11) | ✅                                                                         |
| not ts project support         | ❌                                              | ✅                                                              | ✅                                                                         |
| circular dependencies handling | ❌ use [dpdm](https://github.com/acrazing/dpdm) | ✅                                                              |                                                                            |

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
- [ ] create separate method with flat structure and use getReferencingSourceFiles, include types, barrel files, styles
- [ ] check barrel files handling for default import
- [ ] circular dependencies handling?
- [ ] how to get file deps with skipAddingFilesFromTsConfig: false, skipFileDependencyResolution: false,
- [x] depth number
- [x] flat tree for folder
- [ ] parent in flat tree

## Tech Debt

- [x] try https://github.com/thepassle/module-graph
- [x] reuse code between file and folder tree builder
- [x] cache file tree builder? (don't need since id need to be unique for each node)
- [x] improve performance
- [x] use getReferencingSourceFiles instead own resolution implementation? in such case I will not able to ignore types/interface/enum/`as const` and barrel files
- [ ] fix eslint
- [ ] add test for folder tree id uniqueness
- [ ] upgrade `find-up` to latest version with ESM
- [ ] try [find-up-simple](https://github.com/sindresorhus/find-up-simple) (ESM)

## Development

### Run tests

```shell
npm run test
```

### Prepare mocks

```shell
tsx test/prepare-mocks.ts
```

### Benchmark

```shell
npmr run bench
```
