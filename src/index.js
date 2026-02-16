import {readFile} from "node:fs/promises";
import { parse } from "@babel/parser";
import _traverseWrapper from '@babel/traverse'; // extract the default fn from the exported wrapper object
import {codeFrameColumns} from "@babel/code-frame"
import * as rules from "./rules.js"

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
            rules.checkConsole(path, errorStore);
            rules.checkMapKey(path, errorStore);
        },

        // Rule: Ensure component names are PascalCase
        FunctionDeclaration(path) {rules.checkPascalName(path, errorStore);},
        // Rule: Check if any tag has "class" instead of "className"
        JSXAttribute(path){rules.checkJSXClassName(path, errorStore);},
        });
        const resWithSnippets=results.map(err=>({
            ...err, // store all error results in a arbitrary bucket before adding the code snippet
            codeSnippet:codeFrameColumns(code,
                {start:{line:err.line,column:err.column}},
                {linesAbove:2,linesBelow:2,highlightCode:false})
        }))
        // sort the errors, first by line numbers, and if on same line, then by column numbers
        const sortedResWithSnippets = resWithSnippets.sort((err1,err2)=>err1.line-err2.line||err1.column-err2.column);
        return {
            fileName: filePath,
            errors: sortedResWithSnippets
        };
    }

    catch(error){
        return {
            fileName: filePath,
            errors: [{ line: 0, message: `Parser Error: ${error.message}`, severity: 'error' }]
        };
    }
}