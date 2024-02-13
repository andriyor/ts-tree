import crypto from 'node:crypto';

import { Project, SourceFile, SyntaxKind, ts, Node, StringLiteral } from 'ts-morph';

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

export const trimQuotes = (str: string) => {
  return str.slice(1, -1);
};

export const buildTree = (data: FileInfo[]) => {
  const tree: Record<string, Tree> = {};

  // Create nodes
  data.forEach((node) => {
    const { imports, path, ...rest } = node;
    tree[path] = { path, id: path, ...rest, children: [] };
  });

  // Create edges
  data.forEach((item) => {
    const node = tree[item.path];
    item.imports.forEach((importPath) => {
      const importNode = tree[importPath];
      if (node && importNode) {
        const name = `${node.path}/${importNode.path}`;
        const hash = crypto.createHash('md5').update(name).digest('hex');
        node.children.push({
          ...importNode,
          id: hash,
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

const getImports = (sourceFile: SourceFile) => {
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
      const paths = new Set<string>();
      namedBindings.getElements().forEach((named) => {
        const nodes = named.getNameNode().getDefinitionNodes();
        nodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (!path.includes('node_modules') && !Node.isTypeAliasDeclaration(node)) {
            paths.add(path);
          }
        });
      });
      fileInfo.imports.push(...Array.from(paths));
    }
  });
  return fileInfo;
};

export const getFilesInfo = (path: string) => {
  const filesInfo: FileInfo[] = [];
  const sourceFiles = project.getSourceFiles(path);
  sourceFiles.forEach((sourceFile) => {
    const fileInfo = getImports(sourceFile);
    filesInfo.push(fileInfo);
  });
  return filesInfo;
};

const processFile = (filePath: string, filesInfo: Record<string, FileInfo>) => {
  const sourceFile = project.addSourceFileAtPath(filePath);
  const currentFilePath = sourceFile.getFilePath();
  const fileInfo = getImports(sourceFile);
  filesInfo[currentFilePath] = fileInfo;
  fileInfo.imports.forEach((filePath) => {
    if (!filesInfo[filePath]) {
      processFile(filePath, filesInfo);
    }
  });
  return filesInfo;
};

export const getTreeByFile = (filePath: string) => {
  const tree: Record<string, FileInfo> = {};
  processFile(filePath, tree);
  return tree;
};
