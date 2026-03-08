import {readFile} from "node:fs/promises";
import { parse } from "@babel/parser";
import _traverseWrapper from '@babel/traverse'; // extract the default fn from the exported wrapper object
import {codeFrameColumns} from "@babel/code-frame"
import * as rules from "./rules.js"

/**
 * Initial error object, returned via the Rule functions
 * @typedef {Object} LintError
 * @property {number} line - Line number where the error occurred
 * @property {number} column - Column number where the error occurred
 * @property {string} message - Linter message describing the problem
 * @property {string} severity - Severity of the error, e.g., "error" or "warning"
 */

/**
 * The final Error object, with code snippet attached.
 * @typedef {LintError & { codeSnippet: string }} FinalError
 */

/**
 * @description Exported function for linter logic
 * @param {string} fileURL - A file URL for the target JS/JSX file
 * @returns {Promise<{fileName:string,errors:FinalError[]}>} Returns an Promise that resolves to an object with fileName and a list of error objects
 */
export async function lintFile(fileURL){
    const traverse = _traverseWrapper.default;
    const results =[] // empty array to store errors

    /**
     * @description Callback fn to store LintError objects into an array
     * @param {LintError} error - the LintError object to be stored
     */
    const errorStore = (error) => {results.push(error)}
    try{
        // const fileURL = path.join("examples","example.jsx") // join a preceding ".." if running this from the "src/" folder
        const code = await readFile(fileURL, 'utf-8');
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx'],
        });

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
            fileName: fileURL,
            errors: sortedResWithSnippets
        };
    }

    catch(error){
        return {
            fileName: fileURL,
            errors: [{ line: 0, column:0, message: `Parser Error: ${error.message}`, severity: 'error' }]
        };
    }
}