import findUp from 'find-up';
import { Project, SourceFile, Node, SyntaxKind } from 'ts-morph';

import { getResolvedFileName, isValidNode, trimQuotes } from './shared';

type FileInfo = {
  path: string;
  name: string;
  imports: string[];
};

type Tree = {
  path: string;
  name: string;
  children: Tree[];
};

export const buildTree = (data: FileInfo[]) => {
  const tree: Record<string, Tree> = {};

  // Create nodes
  data.forEach((node) => {
    const { imports, path, ...rest } = node;
    tree[path] = { path, ...rest, children: [] };
  });

  // Create edges
  data.forEach((item) => {
    const node = tree[item.path];
    item.imports.forEach((importPath) => {
      const importNode = tree[importPath];
      if (node && importNode) {
        const name = `${node.path}/${importNode.path}`;
        node.children.push(importNode);
      }
    });
  });

  // Find root nodes
  const rootNodes = data.filter((node) => {
    return !data.some((edge) => edge.imports.some((n) => n === node.path));
  });

  const rootNode: Tree = { path: 'Root', name: 'Root', children: [] };
  rootNodes.forEach((node) => {
    const child = tree[node.path];
    if (child) {
      rootNode.children.push(child);
    }
  });
  return rootNode;
};

const getImports = (sourceFile: SourceFile, project: Project) => {
  const currentFilePath = sourceFile.getFilePath();
  const baseName = sourceFile.getBaseName();
  const fileInfo: FileInfo = {
    path: currentFilePath,
    name: baseName,
    imports: [],
  };
  const pathsToExclude = new Set<string>();

  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const importClause = importDeclaration.getImportClause();
    const namedBindings = importClause?.getNamedBindings();

    // handle default import
    // https://github.com/dsherret/ts-morph/issues/1507
    if (importClause && namedBindings === undefined) {
      const importName = importClause.getText();
      const importPath = importDeclaration.getModuleSpecifier().getText();
      const unquotedPath = trimQuotes(importPath);
      const fileImport = getResolvedFileName(unquotedPath, currentFilePath, project.compilerOptions.get());
      fileInfo.imports.push(fileImport);
    }

    if (Node.isNamedImports(namedBindings)) {
      const paths = new Set<string>();
      namedBindings.getElements().forEach((named) => {
        const nodes = named.getNameNode().getDefinitionNodes();
        nodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (isValidNode(node)) {
            if (!path.includes('node_modules')) {
              paths.add(path);
            }
          } else {
            pathsToExclude.add(path);
          }
        });
      });
      fileInfo.imports.push(...Array.from(paths));
    }
  });

  return { fileInfo, pathsToExclude: [...Array.from(pathsToExclude)] };
};

const isBarrelFile = (sourceFile: SourceFile) => {
  let isBarrel = true;
  sourceFile.forEachChild((childNode) => {
    if (
      !(Node.isExportDeclaration(childNode) && childNode.getModuleSpecifier()) &&
      !(childNode.getKindName() === 'EndOfFileToken')
    ) {
      isBarrel = false;
    }
  });
  return isBarrel;
};

export const getFilesInfo = (path: string) => {
  const tsConfigFilePath = findUp.sync('tsconfig.json', { cwd: path });
  const project = new Project({
    tsConfigFilePath,
  });
  const filesInfo: FileInfo[] = [];
  const toExclude: string[] = [];

  const sourceFiles = project.getSourceFiles(path);
  sourceFiles.forEach((sourceFile) => {
    const isBarrel = isBarrelFile(sourceFile);
    if (!isBarrel) {
      const { fileInfo, pathsToExclude } = getImports(sourceFile, project);
      filesInfo.push(fileInfo);
      toExclude.push(...pathsToExclude);
    }
  });

  return filesInfo.filter((fileInfo) => !toExclude.includes(fileInfo.path));
};

export const getTreeByFolder = (folderPath: string) => {
  const info = getFilesInfo(folderPath);
  return buildTree(info);
};
