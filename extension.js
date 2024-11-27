// The module 'vscode' contains the VS Code extensibility API

import { buffer } from 'stream/consumers';

// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function getSelectionText() {
	const editor = vscode.window.activeTextEditor;
	
	const selection = editor.selection;
	if (selection && !selection.isEmpty) {
		const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
		const highlighted = editor.document.getText(selectionRange);
		return highlighted;
	}
	console.log(editor.selection.active.line + "|");
	return "";
}
function iostreamCheck(str) {
	// Requiring the fs module
	const fs = require("fs")

	// Creating a function which takes a file as input
	let arr = fs.readFileSync(str).toString().split('\n');
	let addIostream = true;
	let string = "";
	let splittedArrStrings;
	for (let i = 0; i < arr.length; ++i) {
		
		string += arr[i] + '\n';
		if (addIostream) {
			if (arr[i].includes("#include") && arr[i].includes("<iostream>")) {
				addIostream = false;
			} 
		}
	}
	if (addIostream) {
		string = "#include <iostream>\n" + string;
		fs.writeFileSync(str, string);
	}

	return 0;
}
function variableChar(char){
	return '0' <= char && char <= '9' || 'A' <= char && char <= 'Z' || 'a' <= char && char <= 'z' || char == '_';
}
function getVariables(string){
	let output = [];
	let buffer = "";
	let variableStarted = false;
	for(let i = 0; i < string.length; ++i){
		if (!variableStarted && !(string[i]<='Z' && string[i] >= 'A' || string[i] <= 'z' && string[i] >= 'a' ) && string[i] !='_'){
			continue;
		} else if( !variableStarted){
			variableStarted = true;
		}
		while(variableStarted && i < string.length){
			if(!variableChar(string[i])){
				break;
			}
			buffer += string[i];
			++i;
			
		}
		if(buffer != ""){
			output.push(buffer);
		}
		buffer = "";
		variableStarted = true;
	}
	return output;
}

function printVariables(keywords, string) {
	let output = "";
	let arr = getVariables(string);
	for(let i = 0; i < arr.length; ++i){
			if(!keywords.includes(arr[i])){
			if(output == ""){
				output = "std::cout";
			}
			output += " << " + '\"' + arr[i] + " value:\" << " + arr[i];
		} 

		
	}
	if(output != ""){
		output += ';\n';
	}
	console.log(output);
	return output;

}

function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "variable-printer-js" is now active!');

let keywords = ["alignas","alignof","and","and_eq","asm","atomic_cancel","atomic_commit","atomic_noexcept","auto","bitand",
"bitor","bool","break","case","catch","char","char8_t","char16_t","char32_t","class","compl","concept","const","consteval","constexpr",
"constinit","const_cast","continue","co_await","co_return","co_yield","decltype","default","delete","do","double","dynamic_cast","else",
"enum","explicit","export","extern","false","float","for","friend","goto","if","inline","int","long","mutable","namespace","new",
"noexcept","not","not_eq","nullptr","operator","or","or_eq","private","protected","public","reflexpr","register","reinterpret_cast",
"requires","return","short","signed","sizeof","static","static_assert","static_cast","struct","switch","synchronized","template","this",
"thread_local","throw","true","try","typedef","typeid","typename","union","unsigned","using","virtual","void","volatile","wchar_t",
"while","xor","xor_eq"];

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const filename = vscode.window.activeTextEditor.document.fileName;

	const registrator = vscode.commands.registerCommand('variable-printer-js.keywords',function(){
		console.log("ddd");
	}); 

	const printer = vscode.commands.registerCommand('variable-printer-js.printer', function () {
		// The code you place here will be executed every time your command is executed
		//lmaoXd(str);
		// Display a message box to the user
		iostreamCheck(filename);
		
		
		console.log(getVariables(getSelectionText().toString()));
	});

	context.subscriptions.push(printer, registrator);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
