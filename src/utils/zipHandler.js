import path from "node:path";
import fs from "node:fs";
import yauzl from "yauzl-promise";
import { pathToFileURL } from "node:url";

// Get the current directory of this file
const __dirname = import.meta.dirname

/**
 * @typedef {Object} LintResult
 * @property {string} fileName
 * @property {FinalError[]} errors
 */

/**
 * 
 * @param {string} filePath - The path to selected file
 * @returns {Promise<LintResult[]>} Returns an array of results from lintFile function.
 */
export async function handleFiles(filePath){
    // define vars here for scope access
    let lintFile;
    let codeExts;
    const resultList = [];
    const ext = path.extname(filePath).toLowerCase(); // only accept JX,JSX or ZIP files
    // import the linter logic file
        try{
            // Dynamic imports (for ES6 Modules) require a pointer to the .js file inside the app.asar
            // Build the path to the Linter module
            const modulePath = path.resolve(__dirname, "../index.js"); // get the internal absolute filepath of the executable's app
            const moduleFileURL = pathToFileURL(modulePath).href; // convert the module path into a File URL like "D//:folder/file.js"
            ({ lintFile } = await import(moduleFileURL)); // Use of parenthesis is needed; ref: Destructuring - Javascript|MDN
            // import codefile extension array
            const codeExtPath = path.resolve(__dirname, "./utilsConsts.js");
            const codeExtURL = pathToFileURL(codeExtPath).href;
            ({ codeExts } = await import(codeExtURL));
        }
        catch(err){console.error("Linter failed to load:", err);}

    if(ext===".zip"){
        console.log(`Opened Zip at path: ${filePath}`)
        const zip = await yauzl.open(filePath);
        try{
            for await (const entry of zip){
                console.log(`Opened a file named :${entry.filename}`)
                if(codeExts.some(ext => entry.filename.endsWith(ext))){ // array slicing end is exclusive
                    const readStream = await entry.openReadStream();
                    resultList.push(await lintFile(entry.filename, readStream))
                }
            }
        }
        catch (err) {
            console.error("Error: Read Failure during zip streaming of file:", err);
            process.exit(1);
        }
    }
    else{
        const fileStream = fs.createReadStream(filePath);
        resultList.push(await lintFile(filePath, fileStream));
    }
    return resultList;
}