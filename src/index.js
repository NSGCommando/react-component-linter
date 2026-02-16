import {readFile} from "node:fs/promises";
import { parse } from "@babel/parser";
import _traverseWrapper from '@babel/traverse'; // extract the default fn from the exported wrapper object
import {checkMapKey, checkConsole, checkPascalName} from "./rules.js"

export async function lintFile(filePath){
    const traverse = _traverseWrapper.default;
    const results =[] // empty array to store errors

    const errorStore = (error) => {results.push(error)}
    try{
        // const filePath = path.join("examples","example.jsx") // join a preceding ".." if running this from the "src/" folder
        const code = await readFile(filePath, 'utf-8');
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx'],
        });
        console.log(`--- Linting: ${filePath} ---`);

        // traversal code    
        traverse(ast, {
        // Rule: Check for stray log statements and ensure map functions' returned JSX has the "key" prop
        // so React.js can execute diffing properly
        CallExpression(path) // check if the node is a function call
        {
            checkConsole(path, errorStore);
            checkMapKey(path, errorStore);
        },

        // Rule: Ensure component names are PascalCase
        FunctionDeclaration(path) {checkPascalName(path, errorStore);}
        });
        return {
            fileName: filePath,
            errors: results
        };
    }

    catch(error){
        console.error("error processing file", error.message)
        return {
            fileName: filePath,
            errors: [{ line: 0, message: `Parser Error: ${error.message}`, severity: 'error' }]
        };
    }
}