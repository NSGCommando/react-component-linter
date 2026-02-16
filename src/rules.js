import * as t from '@babel/types';

export const checkMapKey=(path)=>{
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
                            const { line } = jsxPath.node.loc.start;
                            const tagName = jsxPath.node.name.name;
                            console.error(`[ERROR] Missing "key" prop on <${tagName}> in .map() at line ${line}`);
                        }
                    }
                });
                path.skip(); // already checked map()'s children here, tell main traversal to skip it
            }
        }
    }

export const checkConsole = (path)=>{
        if (
        t.isMemberExpression(path.node.callee) && // check if the function belongs to an object (eg. object.property : console.log)
        t.isIdentifier(path.node.callee.object, { name: 'console' }) // check if the fn's object is "console"
        ) {
        const { line, column } = path.node.loc.start; // get the node's starting line and column values. 'loc.start' contains these
        console.warn(`[WARNING] Unexpected console statement at line ${line}, position ${column}`); // warn the dev of this console statement
        }
    }

export const checkPascalName=(path)=>{
        const name = path.node.id.name;
        if (path.node.id && /^[a-z]/.test(name)) {
        // If it returns JSX, it's a component and should be Uppercase
        console.error(`[ERROR] React component "${name}" should start with an uppercase letter.`);
        }
    }