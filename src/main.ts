import fs from 'node:fs';

import { Project, SyntaxKind, ts } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

type FileInfo = {
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
    const { path, name } = node;
    tree[path] = { id: path, path, name, children: [] };
  });

  // Create edges
  data.forEach((item) => {
    const node = tree[item.path];
    item.imports.forEach((importPath) => {
      const importNode = tree[importPath];
      if (node && importNode) {
        node.children.push(importNode);
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

export const getFilesInfo = (path: string) => {
  const tsConfig = getTsConfig();
  const filesInfo: FileInfo[] = [];
  if (tsConfig) {
    const sourceFiles = project.getSourceFiles(path);
    sourceFiles.forEach((sourceFile) => {
      const currentFilePath = sourceFile.getFilePath();
      const baseName = sourceFile.getBaseName();
      const fileInfo: FileInfo = {
        path: currentFilePath,
        name: baseName,
        imports: [],
      };
      sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
        const moduleSpecifier = importDeclaration.getModuleSpecifier();

        const moduleName = trimQuotes(moduleSpecifier.getText());
        const resolvedModuleName = ts.resolveModuleName(
          moduleName,
          currentFilePath,
          tsConfig.options,
          ts.sys,
        );
        const path = resolvedModuleName.resolvedModule?.resolvedFileName;
        if (path) {
          fileInfo.imports.push(path);
        }
      });
      filesInfo.push(fileInfo);
    });
  }
  return filesInfo;
};

const info = getFilesInfo('test/test-project/**/*.ts');
console.log(info);
const tree = buildTree(info);
console.log(tree);
console.dir(tree, { depth: null });

fs.writeFileSync('./test/mock/info.json', JSON.stringify(info, null, 2));
fs.writeFileSync('./test/mock/tree.json', JSON.stringify(tree, null, 2));
