# ts-tree

## CLI

run from project root

```shell
tsx ../../../personal/ts-tree/src/fileTree.ts -r='src/containers/bank/form/form.container.tsx' -o='../../../personal/coverage-tree/src/my-tree.json' -m='coverage/coverage-summary.json'  
```

## TODO 

- [x] tree by folder dependencies
- [x] tree by file dependencies
- [x] ignore third-party dependencies
- [x] alias handling
- [x] ignore types/interface/enum dependencies from file tree
- [ ] ignore types/interface/enum dependencies from folder tree
- [x] handle `ExportDeclaration` with moduleSpecifier
- [x] exclude barrel files from file tree
- [ ] exclude barrel files from folder tree
- [x] guarantee id uniqueness of file tree 
- [ ] guarantee id uniqueness of folder tree 
- [x] pass meta info about files to file tree
- [ ] pass meta info about files to folder tree
- [x] arg parser for file tree
- [x] include used export by parent

## Tech Debt

- [ ] add test for id uniqueness
- [ ] reuse code between file and folder tree builder
- [ ] cache file tree builer

