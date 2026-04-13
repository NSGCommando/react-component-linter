import path from "node:path";
import fs from "node:fs";
import yauzl from "yauzl-promise";
import { lintFile } from "../index.js";
import { codeExts } from "./utilsConsts.js";

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
    const resultList = [];
    const ext = path.extname(filePath).toLowerCase(); // only accept JX,JSX or ZIP files
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