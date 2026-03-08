import path from "node:path";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
let lintRes
// Get the current directory of this file
const __dirname = import.meta.dirname
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
    const ext = path.extname(filePath).toLowerCase(); // only lint JS/JSX files
    if (![".js", ".jsx"].includes(ext)) {
        console.error("Error: Only .js or .jsx files are supported.");
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
    // import the linter logic file
    try{
        // Build the path to your module
        const modulePath = path.resolve(__dirname, "src/index.js");
        const moduleFileURL = pathToFileURL(modulePath).href;
        const { lintFile } = await import(moduleFileURL);
        lintRes = await lintFile(filePath)
    }
    catch(err){console.error("Linter failed to load:", err);}
    // Output the returned data to console
    if (lintRes.errors.length === 0) {
        console.log("Linter found no errors!");
        process.exitCode = 0;
        return;
    }
    for (const err of lintRes.errors) {
    console.log(
        `${err.severity.toUpperCase()} at ${err.line}:${err.column}`
    );
    console.log(err.message);
    console.log(err.codeSnippet);
    console.log();
    }
    process.exitCode = 1;
}