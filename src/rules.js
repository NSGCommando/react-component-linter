import * as t from '@babel/types';

let inspectReturnedValue;
// HELPER DYNAMIC IMPORTS
const loadUtils = async (targetPath, targetFuncName) => {
  try {
    const module = await import(targetPath.href);
    if (!module[targetFuncName]) {
        throw new Error(`Function "${targetFuncName}" not found in module`);
    }
    return module[targetFuncName];
  } 
  catch (err) {console.error("Helper failed to load:", err);}
};
const utilPath = new URL("./utils/utilFuncs.js", import.meta.url);
const targetFuncName = "inspectReturnedValue";
// load helper function
inspectReturnedValue = await loadUtils(utilPath,targetFuncName);

// RULE IMPLEMENTATIONS
/**
 * Checks if map() functions in the code are properly receiving a "key" prop to apply.
 * Without a "key", React would need to re-render the full list as it would check the list positionally.
 * @param {object} path - The Babel path node for the JSXAttribute.
 * @param {function} errorFn - The callback to store discovered errors.
 */
export const checkMapKey=(path, errorFn)=>{
    const { node } = path;
    if (!t.isMemberExpression(node.callee) ||!t.isIdentifier(node.callee.property, { name: "map" })) return;
    const callback = node.arguments[0];
    inspectReturnedValue(callback.body, path, errorFn);
}

/**
 * Checks if there are stray console log statements within the passed AST.
 * * @param {object} path - The Babel path node for the JSXAttribute.
 * @param {function} errorFn - The callback to store discovered errors.
 */
export const checkConsole = (path,errorFn)=>{
        if (
        t.isMemberExpression(path.node.callee) && // check if the function belongs to an object (eg. object.property : console.log)
        t.isIdentifier(path.node.callee.object, { name: 'console' }) // check if the fn's object is "console"
        ) {
        const { line, column } = path.node.loc.start; // get the node's starting line and column values. 'loc.start' contains these
        errorFn({
                line:path.node.loc.start.line,
                column:path.node.loc.start.column,
                message:`Unexpected console statement at line ${line}, position ${column}`,
                severity:"warning"
        })
    }
}

/**
 * Checks if a React component function is not in PascalCase within the passed AST.
 * * @param {object} path - The Babel path node for the JSXAttribute.
 * @param {function} errorFn - The callback to store discovered errors.
 */
export const checkPascalName=(path,errorFn)=>{
        const name = path.node.id?.name;
        if (name && /^[a-z]/.test(name)) {
            errorFn({
                line:path.node.loc.start.line,
                column:path.node.loc.start.column,
                message:`React component "${name}" should start with an uppercase letter.`,
                severity:"error"
            })
        }
    }

/**
 * Checks if a JSX attribute is named "class" instead of "className" within the passed AST.
 * * @param {object} path - The Babel path node for the JSXAttribute.
 * @param {function} errorFn - The callback to store discovered errors.
 */
export const checkJSXClassName=(path,errorFn)=>{
    if(path.node.name.name === "class"){
        errorFn({
            line:path.node.loc.start.line,
            column:path.node.loc.start.column,
            message:"React/JSX tags should have 'className', not 'class' as an attribute",
            severity:"warning"
        })
    }
}