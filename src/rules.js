import * as t from '@babel/types';

/**
 * Checks if map() functions in the code are properly receiving a "key" prop to apply.
 * Without a "key", React would need to re-render the full list as it would check the list positionally.
 * * @param {object} path - The Babel path node for the JSXAttribute.
 * @param {function} errorFn - The callback to store discovered errors.
 */
export const checkMapKey=(path, errorFn)=>{
    const {arguments:args} = path.node;
    if (t.isMemberExpression(path.node.callee) &&
        t.isIdentifier(path.node.callee.property, { name: 'map' })) 
        {
            const callback_fn = args[0];
            if (t.isArrowFunctionExpression(callback_fn) || t.isFunctionExpression(callback_fn)){
                path.traverse({
                    JSXOpeningElement(jsxPath){
                        const keyPresent = jsxPath.node.attributes.some(val => t.isJSXAttribute(val) && val.name.name === "key");
                        if(!keyPresent) {
                            const { line,column } = jsxPath.node.loc.start;
                            const tagName = jsxPath.node.name.name;
                            errorFn({
                                line:line,
                                column:column,
                                message:`Missing "key" prop on <${tagName}> in .map() at line ${line}`,
                                severity:"error"
                            })
                        }
                    }
                });
                path.skip(); // already checked map()'s children here, tell main traversal to skip it
            }
        }
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