import path from 'node:path';

import { CompilerOptions, Node, ts } from 'ts-morph';

export const trimQuotes = (str: string) => {
  return str.slice(1, -1);
};

export const isValidNode = (node: Node) => {
  // ignore as const variable
  if (Node.isVariableDeclaration(node)) {
    const initializer = node.getInitializer();
    if (Node.isAsExpression(initializer)) {
      return false;
    }
  }

  return !(Node.isTypeAliasDeclaration(node) || Node.isInterfaceDeclaration(node) || Node.isEnumDeclaration(node));
};

export const getResolvedFileName = (moduleName: string, containingFile: string, tsOptions: CompilerOptions) => {
  const resolvedModuleName = ts.resolveModuleName(moduleName, containingFile, tsOptions, ts.sys);
  if (resolvedModuleName.resolvedModule) {
    if (
      !resolvedModuleName.resolvedModule.isExternalLibraryImport &&
      ['.js', '.ts', '.jsx', '.tsx'].includes(resolvedModuleName.resolvedModule.extension)
    ) {
      if (resolvedModuleName.resolvedModule.resolvedFileName.includes(process.cwd())) {
        return resolvedModuleName.resolvedModule?.resolvedFileName;
      } else {
        // handle alias
        return path.join(process.cwd(), resolvedModuleName.resolvedModule.resolvedFileName);
      }
    }
  }
};
