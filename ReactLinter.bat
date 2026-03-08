@echo off
:: ~   -> Removes quotes from the path
:: d   -> Extracts the Drive letter
:: p   -> Extracts the Folder Path
:: 0   -> Represents the script itself
:: %* -> Passes all arguments (files, flags) to the exe

:: This line launches the EXE located in the same folder as this script
:: The empty "" is a quirk of the 'start' command for the window title
start /wait "" "%~dp0ReactLinter.exe" %*