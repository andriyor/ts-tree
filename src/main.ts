import { Project, SyntaxKind, ts } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

type FileInfo = {
  path: string;
  imports: string[];
  children: FileInfo[];
};

export const getTsConfig = () => {
  const tsConfigFilePath = ts.findConfigFile(process.cwd(), ts.sys.fileExists);
  if (tsConfigFilePath) {
    const configFile = ts.readConfigFile(tsConfigFilePath, ts.sys.readFile);
    return ts.parseJsonConfigFileContent(configFile.config, ts.sys, '');
  }
};

export const trimQuotes = (str: string) => {
  return str.slice(1, -1);
};

export const buildTree = (data: FileInfo[]) => {
  const tree: Record<string, FileInfo> = {};

  // Create nodes
  data.forEach((node) => {
    tree[node.path] = node;
  });

  // Create edges
  data.forEach((item) => {
    const node = tree[item.path];
    item.imports.forEach((importPath) => {
      const importNode = tree[importPath];
      if (node && importNode) {
        node.children.push(importNode);
      }
    });
  });

  // Find root nodes
  const rootNodes = data.filter((node) => {
    return !data.some((edge) => edge.imports.some((n) => n === node.path));
  });

  const rootNode: FileInfo = { path: 'Root', children: [], imports: [] };
  rootNodes.forEach((node) => {
    const child = tree[node.path];
    if (child) {
      rootNode.children.push(child);
    }
  });
  return rootNode;
};

export const getTree = (path: string) => {
  const tsConfig = getTsConfig();
  const filesInfo: FileInfo[] = [];
  if (tsConfig) {
    const sourceFiles = project.getSourceFiles(path);
    sourceFiles.forEach((sourceFile) => {
      const currentFilePath = sourceFile.getFilePath();
      const fileInfo: FileInfo = {
        path: currentFilePath,
        imports: [],
        children: [],
      };
      sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
        const moduleSpecifier = importDeclaration.getModuleSpecifier();

        const moduleName = trimQuotes(moduleSpecifier.getText());
        const resolvedModuleName = ts.resolveModuleName(
          moduleName,
          currentFilePath,
          tsConfig.options,
          ts.sys,
        );
        const path = resolvedModuleName.resolvedModule?.resolvedFileName;
        if (path) {
          fileInfo.imports.push(path);
        }
      });
      filesInfo.push(fileInfo);
    });
  }
  return filesInfo;
};

const info = getTree('test/test-project/**/*.ts');
console.log(info);
const tree = buildTree(info);
console.log(tree);
console.dir(tree, { depth: null });
