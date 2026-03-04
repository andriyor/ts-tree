import path from 'node:path';
import crypto, { UUID } from 'node:crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';
import findUp from 'find-up';

import { isValidNode } from './shared';

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
  { project, filePath, parentId, usedExports = [], flatTree = {}, additionalInfo = {}, depth = 0 }: {
    project: Project,
    filePath: string,
    parentId?: UUID,
    usedExports?: string[],
    flatTree?: Record<string, FileTree>,
    additionalInfo?: Record<string, unknown>,
    depth?: number
  },
) => {
  const sourceFile = project.addSourceFileAtPath(filePath);

  const currentFilePath = sourceFile.getFilePath();
  const relativeFilePath = path.relative(process.cwd(), currentFilePath);
  const baseName = sourceFile.getBaseName();

  const additionalFileInfo = additionalInfo[currentFilePath] ?? undefined;

  const parentFileTree: FileTree = {
    id: crypto.randomUUID(),
    path: relativeFilePath,
    name: baseName,
    parentId,
    meta: additionalFileInfo,
    usedExports: usedExports,
    children: [],
    depth: depth,
  };
  flatTree[parentFileTree.path] = { ...parentFileTree, children: [] };

  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const importClause = importDeclaration.getImportClause();
    const namedBindings = importClause?.getNamedBindings();

    // handle default import
    // https://github.com/dsherret/ts-morph/issues/1507
    if (importClause && namedBindings === undefined) {
      const importName = importClause.getText();
      const fileImport = importDeclaration.getModuleSpecifierSourceFile()?.getFilePath();
      if (fileImport) {
        const childFileTree = buildFileTree(
          {
            project: project,
            filePath: fileImport,
            parentId: parentFileTree.id,
            usedExports: [importName],
            flatTree: flatTree,
            additionalInfo: additionalInfo,
            depth: depth + 1
          },
        ).fileTree;
        parentFileTree.children.push(childFileTree);
      }
    }

    if (Node.isNamedImports(namedBindings)) {
      const fileImportImportedNames: Record<string, string[]> = {};
      namedBindings.getElements().forEach((named) => {
        const nameNode = named.getNameNode();
        const importedName = nameNode.getText();
        const definitionNodes = nameNode.getDefinitionNodes();
        definitionNodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (!path.includes('node_modules') && path !== filePath && isValidNode(node)) {
            if (fileImportImportedNames[path]) {
              fileImportImportedNames[path].push(importedName);
            } else {
              fileImportImportedNames[path] = [importedName];
            }
          }
        });
      });

      Object.entries(fileImportImportedNames).forEach(([fileImport, importedNames]) => {
        const childFileTree = buildFileTree(
          {
            project: project,
            filePath: fileImport,
            parentId: parentFileTree.id,
            usedExports: importedNames,
            flatTree: flatTree,
            additionalInfo: additionalInfo,
            depth: depth + 1
          },
        ).fileTree;
        // update exports in case of import from the same file in other line
        // TODO: optimize this?
        const sameChildIndex = parentFileTree.children.findIndex(child => child.path === childFileTree.path);
        if (sameChildIndex !== -1) {
          parentFileTree.children[sameChildIndex].usedExports.push(...childFileTree.usedExports)
        } else {
          parentFileTree.children.push(childFileTree);
        }
      });
    }
  });
  return { fileTree: parentFileTree, flatTree };
};

export const getTreeByFile = (filePath: string, additionalInfo: Record<string, unknown> = {}) => {
  const tsConfigFilePath = findUp.sync('tsconfig.json', { cwd: filePath });
  const project = new Project({
    skipAddingFilesFromTsConfig: false, // true can cause recursion
    skipFileDependencyResolution: true,
    tsConfigFilePath,
  });

  return buildFileTree({
    project: project,
    filePath: filePath,
    parentId: undefined,
    usedExports: [],
    flatTree: {},
    additionalInfo: additionalInfo
  });
};
