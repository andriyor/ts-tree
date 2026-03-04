import path from 'node:path';
import crypto, { UUID } from 'node:crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';
import findUp from 'find-up';

import { isValidNode } from './shared';

type UsedExport = { name: string; fromBarrel?: boolean };

export type FileTree = {
  id: UUID;
  parentId?: UUID;
  path: string;
  name: string;
  meta?: unknown;
  range?: [number, number];
  isBarrel?: boolean;
  usedExports: UsedExport[];
  children: FileTree[];
  depth: number;
};

export type OutputTree = {
  fileTree: FileTree;
  flatTree: Record<string, FileTree>;
};

const buildFileTree = ({
  project,
  filePath,
  parentId,
  range,
  usedExports = [],
  flatTree = {},
  additionalInfo = {},
  depth = 0,
}: {
  project: Project;
  filePath: string;
  parentId?: UUID;
  range?: [number, number];
  usedExports?: UsedExport[];
  flatTree?: Record<string, FileTree>;
  additionalInfo?: Record<string, unknown>;
  depth?: number;
}): OutputTree => {
  const sourceFile = project.getSourceFileOrThrow(filePath);

  const currentFilePath = sourceFile.getFilePath();
  const relativeFilePath = path.relative(process.cwd(), currentFilePath);
  const baseName = sourceFile.getBaseName();

  const additionalFileInfo = additionalInfo[currentFilePath] ?? undefined;

  const parentFileTree: FileTree = {
    id: crypto.randomUUID(),
    path: relativeFilePath,
    name: baseName,
    parentId,
    range,
    meta: additionalFileInfo,
    usedExports: usedExports,
    children: [],
    depth: depth,
  };
  flatTree[parentFileTree.path] = { ...parentFileTree, children: [] };

  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const pos = importDeclaration.getPos();
    const end = importDeclaration.getEnd();

    const importClause = importDeclaration.getImportClause();
    const namedBindings = importClause?.getNamedBindings();
    const fileImport = importDeclaration.getModuleSpecifierSourceFile()?.getFilePath();

    // handle default import
    // https://github.com/dsherret/ts-morph/issues/1507
    if (importClause && namedBindings === undefined) {
      const importName = importClause.getText();
      if (fileImport) {
        const childFileTree = buildFileTree({
          project,
          filePath: fileImport,
          parentId: parentFileTree.id,
          range: [pos, end],
          usedExports: [
            {
              name: importName,
            },
          ],
          flatTree,
          additionalInfo,
          depth: depth + 1,
        }).fileTree;
        parentFileTree.children.push(childFileTree);
      }
    }

    if (Node.isNamedImports(namedBindings)) {
      const fileImportImportedNames: Record<string, { name: string; fromBarrel?: boolean }[]> = {};
      namedBindings.getElements().forEach((named) => {
        const nameNode = named.getNameNode();
        const importedName = nameNode.getText();
        const definitionNodes = nameNode.getDefinitionNodes();
        definitionNodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (!path.includes('node_modules') && path !== filePath && isValidNode(node)) {
            const fromBarrel = path !== fileImport ? true : undefined;
            console.log('isFromBarrel', fromBarrel);
            // handle multiple named imports from the same file in the same line
            // import { nested2, nested3 } from './nested2';
            if (fileImportImportedNames[path]) {
              fileImportImportedNames[path].push({
                name: importedName,
                fromBarrel: fromBarrel,
              });
            } else {
              fileImportImportedNames[path] = [
                {
                  name: importedName,
                  fromBarrel: fromBarrel,
                },
              ];
            }
          }
        });
      });

      if (false) {
        parentFileTree.children.push({
          id: crypto.randomUUID(),
          path: fileImport!,
          name: 'index.ts',
          isBarrel: true,
          range: [pos, end],
          usedExports: [],
          children: Object.entries(fileImportImportedNames).map(([fileImport, importedNames]) => {
            return buildFileTree({
              project,
              filePath: fileImport,
              parentId: parentFileTree.id,
              range: [pos, end],
              usedExports: importedNames,
              flatTree,
              additionalInfo,
              depth: depth + 1,
            }).fileTree;
          }),
          depth: 3,
        });
      } else {
        Object.entries(fileImportImportedNames).forEach(([fileImport, importedNames]) => {
          const childFileTree = buildFileTree({
            project,
            filePath: fileImport,
            parentId: parentFileTree.id,
            range: [pos, end],
            usedExports: importedNames,
            flatTree,
            additionalInfo,
            depth: depth + 1,
          }).fileTree;
          // prevent new children creation and update exports in case of import from the same file in other line,
          // its produce uncorrected range since it takes range from last import
          // TODO: optimize this?
          const sameChildIndex = parentFileTree.children.findIndex((child) => child.path === childFileTree.path);
          if (sameChildIndex !== -1) {
            parentFileTree.children[sameChildIndex].usedExports.push(...childFileTree.usedExports);
          } else {
            parentFileTree.children.push(childFileTree);
          }
        });
      }
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
    project,
    filePath,
    parentId: undefined,
    usedExports: [],
    flatTree: {},
    additionalInfo,
  });
};
