import fs from 'node:fs';
import path from 'node:path';

import crypto from 'node:crypto';
import { CompilerOptions, Project, SourceFile, SyntaxKind, ts, Node, StringLiteral } from 'ts-morph';

// import { parse } from '@typescript-eslint/typescript-estree';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

export type FileInfo = {
  path: string;
  name: string;
  imports: string[];
};

type Tree = {
  id: string;
  path: string;
  name: string;
  children: Tree[];
};

export const getTsConfig = () => {
  const tsConfigFilePath = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
  if (tsConfigFilePath) {
    const configFile = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);
    return ts.parseJsonConfigFileContent(configFile.config, ts.sys, '');
  }
};

export const trimQuotes = (str: string) => {
  return str.slice(1, -1);
};

export const buildTree = (data: FileInfo[]) => {
  const tree: Record<string, Tree> = {};

  // Create nodes
  data.forEach((node) => {
    const { imports, path, ...rest } = node;
    // TODO: use hash instead of UUID
    const id = crypto.randomUUID();
    tree[path] = { path, id, ...rest, children: [] };
  });

  // Create edges
  data.forEach((item) => {
    const node = tree[item.path];
    item.imports.forEach((importPath) => {
      const importNode = tree[importPath];
      if (node && importNode) {
        node.children.push({
          ...importNode,
          // TODO: use hash instead of UUID
          id: crypto.randomUUID(),
        });
      }
    });
  });

  // Find root nodes
  const rootNodes = data.filter((node) => {
    return !data.some((edge) => edge.imports.some((n) => n === node.path));
  });

  const rootNode: Tree = { id: 'root', path: 'Root', name: 'Roor', children: [] };
  rootNodes.forEach((node) => {
    const child = tree[node.path];
    if (child) {
      rootNode.children.push(child);
    }
  });
  return rootNode;
};

export const getResolvedFileName = (moduleName: string, containingFile: string, tsOptions: CompilerOptions) => {
  const resolvedModuleName = ts.resolveModuleName(moduleName, containingFile, tsOptions, ts.sys);
  if (resolvedModuleName.resolvedModule?.resolvedFileName) {
    if (resolvedModuleName.resolvedModule.resolvedFileName.includes(process.cwd())) {
      return resolvedModuleName.resolvedModule?.resolvedFileName;
    } else {
      // handle alias
      return path.join(process.cwd(), resolvedModuleName.resolvedModule.resolvedFileName);
    }
  }
};

const getPathFromModuleSpecifier = (
  moduleSpecifier: StringLiteral,
  currentFilePath: string,
  tsOptions: CompilerOptions,
) => {
  const moduleName = trimQuotes(moduleSpecifier.getText());
  const path = getResolvedFileName(moduleName, currentFilePath, tsOptions);
  if (path && !path.includes('node_modules')) {
    return path;
  }
};

const getImports = (sourceFile: SourceFile, tsOptions: CompilerOptions) => {
  const currentFilePath = sourceFile.getFilePath();
  const baseName = sourceFile.getBaseName();
  const fileInfo: FileInfo = {
    path: currentFilePath,
    name: baseName,
    imports: [],
  };
  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const namedBindings = importDeclaration.getImportClause()?.getNamedBindings();
    if (Node.isNamedImports(namedBindings)) {
      const isTypeImports = namedBindings.getElements().every((named) => {
        const nodes = named.getNameNode().getDefinitionNodes();
        return nodes.every((node) => {
          return Node.isTypeAliasDeclaration(node);
        });
      });
      if (isTypeImports) {
        return;
      }
    }

    const moduleSpecifier = importDeclaration.getModuleSpecifier();
    const path = getPathFromModuleSpecifier(moduleSpecifier, currentFilePath, tsOptions);
    if (path) {
      fileInfo.imports.push(path);
    }
  });
  sourceFile.getChildrenOfKind(SyntaxKind.ExportDeclaration).forEach((exportDeclaration) => {
    const moduleSpecifier = exportDeclaration.getModuleSpecifier();

    if (moduleSpecifier) {
      const path = getPathFromModuleSpecifier(moduleSpecifier, currentFilePath, tsOptions);
      if (path) {
        fileInfo.imports.push(path);
      }
    }
  });
  return fileInfo;
};

export const getFilesInfo = (path: string) => {
  const tsConfig = getTsConfig();
  const filesInfo: FileInfo[] = [];
  if (tsConfig) {
    const sourceFiles = project.getSourceFiles(path);
    sourceFiles.forEach((sourceFile) => {
      // TODO: check is all is type def
      const fileInfo = getImports(sourceFile, tsConfig.options);
      filesInfo.push(fileInfo);
    });
  }
  return filesInfo;
};

const processFile = (
  filePath: string,
  tsOptions: CompilerOptions,
  filesInfo: Record<string, FileInfo>,
) => {
  const sourceFile = project.addSourceFileAtPath(filePath);
  const currentFilePath = sourceFile.getFilePath();
  const fileInfo = getImports(sourceFile, tsOptions);
  filesInfo[currentFilePath] = fileInfo;
  fileInfo.imports.forEach((filePath) => {
    if (!filesInfo[filePath]) {
      processFile(filePath, tsOptions, filesInfo);
    }
  });
  return filesInfo;
};

export const getTreeByFile = (filePath: string) => {
  const tsConfig = getTsConfig();
  const tree: Record<string, FileInfo> = {};
  if (tsConfig) {
    processFile(filePath, tsConfig.options, tree);
  }
  return tree;
};

// import { remove } from 'wild-wild-path';

// const info = getFilesInfo('test/test-project/**/*.ts');
// console.log(info);
// const tree1 = buildTree(info);
// const withoutids = remove(tree1, '**.id');
// console.dir(tree1, { depth: null });
// fs.writeFileSync('./test/mock/info.json', JSON.stringify(info, null, 2));
// fs.writeFileSync('./test/mock/tree.json', JSON.stringify(withoutids, null, 2));

// const filesInfo = getTreeByFile('test/test-project/index.ts');
// console.log(filesInfo);
// fs.writeFileSync('./test/mock/file-info.json', JSON.stringify(filesInfo, null, 2));
// const tree = buildTree(Object.values(filesInfo));
// const withoutids = remove(tree, '**.id');
// fs.writeFileSync('./test/mock/file-tree.json', JSON.stringify(withoutids, null, 2));

// const filesInfo = getTreeByFile('src/containers/bank/form/form.container.tsx');
// console.log(filesInfo);
// const tree = buildTree(Object.values(filesInfo));
// console.dir(tree, { depth: null });
// fs.writeFileSync('./file-tree.json', JSON.stringify(tree));

