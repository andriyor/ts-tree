import crypto, { UUID } from 'node:crypto';
import fs from 'node:fs';

import { Project, SyntaxKind, Node } from 'ts-morph';
import { typeFlag } from 'type-flag';

const parsed = typeFlag({
  rootFile: {
    type: String,
    alias: 'r',
  },
  outputFile: {
    type: String,
    alias: 'o',
  },
  metaFile: {
    type: String,
    alias: 'm',
  },
});

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
  const baseName = sourceFile.getBaseName();

  const additionalFileInfo = additionalInfo[currentFilePath] ?? undefined;

  const fileTree: FileTree = {
    id: crypto.randomUUID(),
    path: currentFilePath,
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
if (parsed.flags.rootFile && parsed.flags.outputFile && parsed.flags.metaFile) {
  const meta = JSON.parse(fs.readFileSync(parsed.flags.metaFile, 'utf-8'));
  const tree = getTreeByFile(parsed.flags.rootFile, meta);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.rootFile && parsed.flags.outputFile) {
  const tree = getTreeByFile(parsed.flags.rootFile);
  fs.writeFileSync(parsed.flags.outputFile, JSON.stringify(tree, null, 2), 'utf-8');
} else if (parsed.flags.rootFile) {
  console.log(getTreeByFile(parsed.flags.rootFile));
} else {
  console.log('provide required --root-file option');
}
