import crypto, { UUID } from 'crypto';

import { Project, SyntaxKind, Node } from 'ts-morph';

type FileTree = {
  id: UUID;
  parentId?: UUID;
  path: string;
  name: string;
  children: FileTree[];
};

const buildFileTree = (project: Project, filePath: string, parentId?: UUID) => {
  const sourceFile = project.addSourceFileAtPath(filePath);
  const currentFilePath = sourceFile.getFilePath();
  const baseName = sourceFile.getBaseName();
  const fileTree: FileTree = {
    id: crypto.randomUUID(),
    path: currentFilePath,
    name: baseName,
    parentId,
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
            !Node.isInterfaceDeclaration(node)
          ) {
            paths.add(path);
          }
        });
      });
      const fileImports = [...Array.from(paths)];
      fileImports.forEach((fileImport) => {
        fileTree.children.push(buildFileTree(project, fileImport, fileTree.id));
      });
    }
  });
  return fileTree;
};

export const getTreeByFile = (filePath: string) => {
  const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
  });

  return buildFileTree(project, filePath);
};
