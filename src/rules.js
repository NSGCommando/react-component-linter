import * as t from '@babel/types';

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