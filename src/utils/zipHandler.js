import path from "node:path";
import fs from "node:fs";
import yauzl from "yauzl-promise";

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
            const moduleFileURL = new URL("../index.js", import.meta.url); // get the internal absolute filepath of the executable's app
            const moduleTarget = "lintFile";
            lintFile = await loadUtils(moduleFileURL, moduleTarget);
            // import codefile extension array
            const codeExtURL = new URL("./utilsConsts.js", import.meta.url);
            const codeExtTarget = "codeExts";
            codeExts = await loadUtils(codeExtURL, codeExtTarget);
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