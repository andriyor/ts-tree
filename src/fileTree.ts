import path from 'node:path';
import crypto, { UUID } from 'node:crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';

type FileTree = {
  id: UUID;
  parentId?: UUID;
  path: string;
  name: string;
  meta?: unknown;
  children: FileTree[];
};

const buildFileTree = (
  project: Project,
  filePath: string,
  parentId?: UUID,
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
    children: [],
  };
  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const namedBindings = importDeclaration.getImportClause()?.getNamedBindings();
    if (Node.isNamedImports(namedBindings)) {
      const paths = new Set<string>();
      namedBindings.getElements().forEach((named) => {
        const nodes = named.getNameNode().getDefinitionNodes();
        nodes.forEach((node) => {
          const path = node.getSourceFile().getFilePath();
          if (
            !path.includes('node_modules') &&
            !Node.isTypeAliasDeclaration(node) &&
            !Node.isInterfaceDeclaration(node) &&
            !Node.isEnumDeclaration(node)
          ) {
            paths.add(path);
          }
        });
      });
      const fileImports = [...Array.from(paths)];
      fileImports.forEach((fileImport) => {
        fileTree.children.push(buildFileTree(project, fileImport, fileTree.id, additionalInfo));
      });
    }
  });
  return fileTree;
};

export const getTreeByFile = (filePath: string, additionalInfo: Record<string, unknown> = {}) => {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  return buildFileTree(project, filePath, undefined, additionalInfo);
};
