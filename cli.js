import path from "node:path";
import fs from "node:fs";
import { handleFiles } from "./src/utils/zipHandler.js";
import { exts } from "./src/utils/utilsConsts.js";

// var declarations to make them available globally
let errorCounter = 0;
/**
 * @function runCLI
 * @description Exports the full functionality for CLI mode of the Linter
 * @returns {void} Returns nothing, prints all errors to console
 */
export const runCLI = async (args) =>{
    if(args.length!==1){
        console.error("Error: Incorrect number of CLI arguments.");
        console.error("Usage: ReactLinter.exe [filepath/filename]");
        process.exit(1);
    }
    const fileArg = args[0];
    const filePath = path.resolve(process.cwd(),fileArg);
    const ext = path.extname(filePath).toLowerCase(); // only accept JX,JSX or ZIP files
    if (!exts.includes(ext)) // use Array.Prototype.includes to check membership
    {
        console.error("Error: Only .js, .jsx or .zip files are supported.");
        process.exit(1);
    }
    // Ensure the filepath is pointing to a file, not a directory
    try {
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) {
            console.error("Error: Argument is not a file:", filePath);
            process.exit(1);
        }
    } catch (err) {
        console.error("Error: File does not exist:", filePath);
        process.exit(1);
    }
    console.log("Info: File validated:",filePath);

    // handle zips and single files
    const results = await handleFiles(filePath);
    
    // Output the returned data to console
    for (const listItem of results){
        console.log(`Filename: ${listItem.fileName}`)
        if (listItem.errors.length === 0) {
            console.log("Linter found no errors in current file!");
            continue;
        }
        for (const err of listItem.errors) {
            errorCounter+=1;
            console.log(`${err.severity.toUpperCase()} at ${err.line}:${err.column}`);
            console.log(err.message);
            console.log(err.codeSnippet);
            console.log();
        }
    }
    console.log(`Error Counter: ${errorCounter}`)
    if(errorCounter===0) process.exitCode = 0;
    else process.exitCode = 1;
}