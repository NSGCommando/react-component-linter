### React Component Linter ###
## Introduction ##
This is a simple application for linting React/JSX files with a few simple errors/warnings.
Error List:
- Check if Component names are in PascalCase
- Check if all ```map()``` functions are receiving a ```key``` prop or not.
  - If they don't React.js will have to re-render the entire list where ```map()``` is being used, as it will default to checking the list positionally and won't be able to replace exact parts of the HTML
- Check if tags are using ```className``` and not ```class```
- Check if ```console.log()``` statements are there in the component code. Generally, you don't want these in a finished codebase.

## Architecture ##
- Built using Node.js, Babel, Electron, React.js and Vite.
- Babel used for creating and traversing the file's Abstract Syntax Tree (AST) and applying the linting rules.
- Electron used to give the app it's own window and build the app.
- React.js used to build the app's UI.
- Vite to build and package the UI.
- The app uses Babel parser to generate an AST for traversal instead of using regex pattern-matching for better performance. 
  - An AST is a tree of all the nodes in the react/jsx file, starting from the file root.
- Using AST is better as one can traverse selectively, for example - only checking for JSXAttributes or function calls (CallExpression); Regex is blind to this specificity.

## Usage ##
- Download the executable from Releases
- Double-click (or Right-click and click Open) on the executable; a window will open
- Click the button called ```Open & Lint JSX File```, browse to and select your jsx file (An example file with a few errors is provided in the source code as well)
- The app window will display all errors it found alongside line and column number and a code snippet from the file.
