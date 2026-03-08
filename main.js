import path from "node:path";
import { pathToFileURL } from "node:url";
// build import paths
const __dirname = import.meta.dirname
const guiPath = pathToFileURL(path.resolve(__dirname,"gui.js")).href;
const cliPath = pathToFileURL(path.resolve(__dirname, "cli.js")).href;

// Dev runs via [node] [main.js] [...args] and defaultApp is True
// Prod runs via >[PathToReactLinter.exe] [PathToTargetFile] and defaultApp is False
const args = process.argv.slice(process.defaultApp ? 2 : 1);
console.log(process.defaultApp?"-- Running in Dev Mode --":"-- Running in Production Mode --");
if(args.length>0){
    console.log("-- Entered CLI mode --")
    const {runCLI} = await import(cliPath);
    await runCLI(args);
    console.log("-- CLI Finished --")
    process.exit(0);
}// if args still empty, run GUI
else { 
    console.log("-- GUI Mode --");
    const {startGUI} = await import (guiPath);
    await startGUI();
}
