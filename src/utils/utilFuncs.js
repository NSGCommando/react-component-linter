import * as t from '@babel/types';

// HELPER FUNCTIONS
const walkStatement = (stmt, mapPath, errorFn) => {
  if (!stmt) return;

  // Return statement
  if (t.isReturnStatement(stmt)) {
    inspectReturnedValue(stmt.argument, mapPath, errorFn);
    return;
  }

  // If statement (IMPORTANT FIX)
  if (t.isIfStatement(stmt)) {
    walkStatement(stmt.consequent, mapPath, errorFn);
    walkStatement(stmt.alternate, mapPath, errorFn);
    return;
  }

  // Block inside blocks
  if (t.isBlockStatement(stmt)) {
    stmt.body.forEach(s =>
      walkStatement(s, mapPath, errorFn)
    );
    return;
  }

  // Expression statements etc. (later)
};

const checkJSX = (node, errorFn) => {
  if (!t.isJSXElement(node)) return;

  const hasKey = node.openingElement.attributes.some(
    (attr) =>
      t.isJSXAttribute(attr) &&
      attr.name.name === "key"
  );

  if (!hasKey) {
    const { line, column } = node.loc.start;

    errorFn({
      line,
      column,
      message: `Missing "key" prop in .map()`,
      severity: "error",
    });
  }
};

export const inspectReturnedValue = (node, mapPath, errorFn) => {
  if (!node) return;

  // JSX
  if (t.isJSXElement(node) || t.isJSXFragment(node)) {
    checkJSX(node, errorFn);
    return;
  }

  // Array
  if (t.isArrayExpression(node)) {
    node.elements.forEach(el =>
      inspectReturnedValue(el, mapPath,errorFn)
    );
    return;
  }

  // Conditional
  if (t.isConditionalExpression(node)) {
    inspectReturnedValue(node.consequent, mapPath,errorFn);
    inspectReturnedValue(node.alternate, mapPath,errorFn);
    return;
  }

  // Nested map
  if (t.isCallExpression(node)) {
    if (
      t.isMemberExpression(node.callee) &&
      t.isIdentifier(node.callee.property, { name: "map" })
    ) {
      checkMapKey({ node }, errorFn);
    }
    return;
  }

  // Block
  if (t.isBlockStatement(node)) {
    node.body.forEach(stmt => {
        walkStatement(stmt, mapPath, errorFn);
    });
    return;
    }
};