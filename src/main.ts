import { Project, SyntaxKind, ts } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: 'tsconfig.json',
});

type Edge = {
  source: string;
  target: string;
};

type Node = {
  path: string;
  label: string;
};

type Graph = {
  nodes: Node[];
  edges: Edge[];
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

export const getTree = (path: string) => {
  const tsConfig = getTsConfig();
  const graph: Graph = {
    nodes: [],
    edges: [],
  };
  if (tsConfig) {
    const sourceFiles = project.getSourceFiles(path);
    sourceFiles.forEach((sourceFile) => {
      sourceFile.getChildrenOfKind(SyntaxKind.ImportDeclaration).forEach((importDeclaration) => {
        const currentFilePath = sourceFile.getFilePath();
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
          graph.nodes.push({
            path,
            label: moduleName,
          });
          graph.edges.push({
            source: currentFilePath,
            target: path,
          });
        }
      });
    });
  }
  return graph;
};

// const tree = getTree('test/test-project/**/*.ts');
// console.log(tree);
