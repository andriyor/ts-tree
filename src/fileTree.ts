import path from 'node:path';
import crypto, { UUID } from 'node:crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';
import findUp from 'find-up';

import { getResolvedFileName, isValidNode, trimQuotes } from './shared';

export type FileTree = {
  id: UUID;
  parentId?: UUID;
  path: string;
  name: string;
  meta?: unknown;
  usedExports: string[];
  children: FileTree[];
  depth: number;
};

const buildFileTree = (
  project: Project,
  filePath: string,
  parentId?: UUID,
  usedExports: string[] = [],
  flatTree: Record<string, FileTree> = {},
  additionalInfo: Record<string, unknown> = {},
  depth = 0,
) => {
  const sourceFile = project.addSourceFileAtPath(filePath);

  const currentFilePath = sourceFile.getFilePath();
  const relativeFilePath = path.relative(process.cwd(), currentFilePath);
  const baseName = sourceFile.getBaseName();

  const additionalFileInfo = additionalInfo[currentFilePath] ?? undefined;

  const fileTree: FileTree = {
    id: crypto.randomUUID(),
    path: relativeFilePath,
    name: baseName,
    parentId,
    meta: additionalFileInfo,
    usedExports: usedExports,
    children: [],
    depth: depth,
  };
  flatTree[fileTree.path] = { ...fileTree, children: [] };

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
      if (fileImport) {
        const childFileTree = buildFileTree(
          project,
          fileImport,
          fileTree.id,
          [importName],
          flatTree,
          additionalInfo,
          depth + 1,
        ).fileTree;
        fileTree.children.push(childFileTree);
      }
    }

    if (Node.isNamedImports(namedBindings)) {
      const paths: Record<string, string[]> = {};
      namedBindings.getElements().forEach((named) => {
        const nameNode = named.getNameNode();
        const importedName = nameNode.getText();
        const definitionNodes = nameNode.getDefinitionNodes();
        definitionNodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (!path.includes('node_modules') && path !== filePath && isValidNode(node)) {
            if (paths[path]) {
              paths[path].push(importedName);
            } else {
              paths[path] = [importedName];
            }
          }
        });
      });

      Object.entries(paths).forEach(([fileImport, importedNames]) => {
        const childFileTree = buildFileTree(
          project,
          fileImport,
          fileTree.id,
          importedNames,
          flatTree,
          additionalInfo,
          depth + 1,
        ).fileTree;
        // TODO: optimize this?
        const sameIndex = fileTree.children.findIndex(child => child.path === childFileTree.path);
        if (sameIndex !== -1) {
          fileTree.children[sameIndex].usedExports.push(...childFileTree.usedExports)
        } else {
          fileTree.children.push(childFileTree);
        }
      });
    }
  });
  return { fileTree, flatTree };
};

export const getTreeByFile = (filePath: string, additionalInfo: Record<string, unknown> = {}) => {
  const tsConfigFilePath = findUp.sync('tsconfig.json', { cwd: filePath });
  const project = new Project({
    skipAddingFilesFromTsConfig: false, // true can cause recursion
    skipFileDependencyResolution: true,
    tsConfigFilePath,
  });

  return buildFileTree(project, filePath, undefined, [], {}, additionalInfo);
};
