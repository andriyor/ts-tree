import path from 'node:path';
import crypto, { UUID } from 'node:crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';

type FileTree = {
  id: UUID;
  parentId?: UUID;
  path: string;
  name: string;
  meta?: unknown;
  usedExports: string[];
  children: FileTree[];
};

const buildFileTree = (
  project: Project,
  filePath: string,
  parentId?: UUID,
  usedExports: string[] = [],
  additionalInfo: Record<string, unknown> = {},
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
  };
  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const namedBindings = importDeclaration.getImportClause()?.getNamedBindings();
    if (Node.isNamedImports(namedBindings)) {
      const paths: Record<string, string[]> = {};
      namedBindings.getElements().forEach((named) => {
        const nameNode = named.getNameNode();
        const importedName = nameNode.getText();

        const definitionNodes = nameNode.getDefinitionNodes();
        definitionNodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (
            !path.includes('node_modules') &&
            !Node.isTypeAliasDeclaration(node) &&
            !Node.isInterfaceDeclaration(node) &&
            !Node.isEnumDeclaration(node)
          ) {
            if (paths[path]) {
              paths[path].push(importedName);
            } else {
              paths[path] = [importedName];
            }
          }
        });
      });

      Object.entries(paths).forEach(([fileImport, value]) => {
        fileTree.children.push(buildFileTree(project, fileImport, fileTree.id, value, additionalInfo));
      });
    }
  });
  return fileTree;
};

export const getTreeByFile = (filePath: string, additionalInfo: Record<string, unknown> = {}) => {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  return buildFileTree(project, filePath, undefined, [], additionalInfo);
};
