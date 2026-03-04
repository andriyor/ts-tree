import { Node } from 'ts-morph';

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
