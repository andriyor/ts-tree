import path from 'node:path';

import { Node, Project, SyntaxKind } from 'ts-morph';
import findUp from 'find-up';

import { isValidNode } from './shared';

export type FileNode = {
  id: string;
  path: string;
  name: string;
  meta?: unknown;
};

export type FileEdge = {
  id: string;
  source: string;
  target: string;
  usedExports: string[];
};

export type FileGraphOutput = {
  nodes: FileNode[];
  edges: FileEdge[];
  rootId: string;
};

export type FileGraph = {
  nodes: Record<string, FileNode>;
  edges: FileEdge[];
  rootId: string;
};

const buildFileGraph = (
  project: Project,
  filePath: string,
  graph: FileGraph,
  additionalInfo: Record<string, unknown> = {},
  visited: Set<string> = new Set(),
): string => {
  const sourceFile = project.addSourceFileAtPath(filePath);

  const currentFilePath = sourceFile.getFilePath();
  const relativeFilePath = path.relative(process.cwd(), currentFilePath);
  const baseName = sourceFile.getBaseName();

  // Check if node already exists
  if (relativeFilePath in graph.nodes) {
    return graph.nodes[relativeFilePath]!.id;
  }

  const additionalFileInfo = additionalInfo[currentFilePath] ?? undefined;

  const fileNode: FileNode = {
    id: relativeFilePath,
    path: relativeFilePath,
    name: baseName,
    meta: additionalFileInfo,
  };

  graph.nodes[relativeFilePath] = fileNode;

  // Mark as visited before processing children to detect circular dependencies
  visited.add(relativeFilePath);

  sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
    const importClause = importDeclaration.getImportClause();
    const namedBindings = importClause?.getNamedBindings();

    // handle default import
    if (importClause && namedBindings === undefined) {
      const importName = importClause.getText();
      const fileImport = importDeclaration.getModuleSpecifierSourceFile()?.getFilePath();
      if (fileImport) {
        const importedRelativePath = path.relative(process.cwd(), fileImport);
        let childNodeId: string;

        if (visited.has(importedRelativePath)) {
          // Circular dependency - use existing node
          childNodeId = graph.nodes[importedRelativePath]!.id;
        } else {
          childNodeId = buildFileGraph(project, fileImport, graph, additionalInfo, visited);
        }

        graph.edges.push({
          id: `${fileNode.id}->${childNodeId}`,
          source: fileNode.id,
          target: childNodeId,
          usedExports: [importName],
        });
      }
    }

    if (Node.isNamedImports(namedBindings)) {
      const paths: Record<string, string[]> = {};
      namedBindings.getElements().forEach((named) => {
        const nameNode = named.getNameNode();
        const importedName = nameNode.getText();
        const definitionNodes = nameNode.getDefinitionNodes();
        definitionNodes.forEach((node) => {
          const nodePath = node.getSourceFile().getFilePath();
          if (!nodePath.includes('node_modules') && nodePath !== filePath && isValidNode(node)) {
            if (paths[nodePath]) {
              paths[nodePath].push(importedName);
            } else {
              paths[nodePath] = [importedName];
            }
          }
        });
      });

      Object.entries(paths).forEach(([fileImport, importedNames]) => {
        const importedRelativePath = path.relative(process.cwd(), fileImport);
        let childNodeId: string;

        if (visited.has(importedRelativePath)) {
          // Circular dependency - use existing node
          childNodeId = graph.nodes[importedRelativePath]!.id;
        } else {
          childNodeId = buildFileGraph(project, fileImport, graph, additionalInfo, visited);
        }

        // Check if edge already exists and merge usedExports
        const existingEdge = graph.edges.find((edge) => edge.source === fileNode.id && edge.target === childNodeId);
        if (existingEdge) {
          existingEdge.usedExports.push(...importedNames);
        } else {
          graph.edges.push({
            id: `${fileNode.id}->${childNodeId}`,
            source: fileNode.id,
            target: childNodeId,
            usedExports: importedNames,
          });
        }
      });
    }
  });

  return fileNode.id;
};

export const getGraphByFile = (filePath: string, additionalInfo: Record<string, unknown> = {}): FileGraphOutput => {
  const tsConfigFilePath = findUp.sync('tsconfig.json', { cwd: filePath });
  const project = new Project({
    skipAddingFilesFromTsConfig: false,
    skipFileDependencyResolution: true,
    tsConfigFilePath,
  });

  const graph: FileGraph = {
    nodes: {},
    edges: [],
    rootId: '',
  };

  graph.rootId = buildFileGraph(project, filePath, graph, additionalInfo);

  return {
    ...graph,
    nodes: Object.values(graph.nodes),
  };
};
