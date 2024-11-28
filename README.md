# Общее описание
В данном проекте реализован плагин для разработки на языке C++ в IDE Visual Studio Code, позволяющий с помощью сочетания клавиш Ctrl + Alt + K вставлять код, выводящий в стандартный поток выделенные переменные 
# Устройство плагина
Плагин состоит из многих служебных файлов, наибольшее значение из которых для нас играют 2 файла: **paclage.json** и **extension.js**.
В первом файле, помимо необходимых служебных переменных, также представлена реализация связи плагина с IDE - перечисление команд, их названий и сочетаний клавиш, при которых он вызываются
- package.json
```JSON
"contributes": {
    "commands": [{
      "command": "variable-printer-js.printer",
      "title": "Print variables"
    },
    {
      "command": "variable-printer-js.keywordsRegister",
      "title": "Register keywords"
    },
    {
      "command": "variable-printer-js.keywordsDisregister",
      "title": "Disregister keywords"
    }
  ],
    "keybindings":[{
      "command": "variable-printer-js.printer",
      "key": "Ctrl+Alt+P",
      "when": "editorTextFocus"
    },{
      "command": "variable-printer-js.keywordsRegister",
      "key":"Ctrl+Alt+K",
      "when": "editorTextFocus"
    },{
      "command": "variable-printer-js.keywordsDisregister",
      "key":"Shift+Alt+K",
      "when": "editorTextFocus"
    }
  ]
  },
``` 
Во втором хранится исходный код плагина. Исходный код плагина для VS code должен выглядеть следующим образом на языке js:
``` javascript
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');


/**
 * @param {vscode.ExtensionContext} context
 */
...
function activate(context){
    //Implementation of plugin
    const command = vscode.commands.registerCommand('variable-printer-js.printer', function () {
        ...
});
    context.subscriptions.push(command,.../*(list of others commands)*/);

}
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

```
# Реализация плагина
## Реализвация пользовательских функций
В процессе работы, помимо основных функций, мне потребовалось создавать новые для упрощения процесса разработки.
Список данных функций:
- getSelectionText()
``` javascript
function getSelectionText() {
	const editor = vscode.window.activeTextEditor;
	
	const selection = editor.selection;
	if (selection && !selection.isEmpty) {
		const selectionRange = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
		const highlighted = editor.document.getText(selectionRange);
		return highlighted;
	}
	return "";
}
```
Функция получает информацию о выделенном тексте, задает размеры выделенного текста и возвращает в качестве строки выделенный текст.
Если его нет возвращает пустую строку.

- iostreamCheck()
``` javascript
function iostreamCheck() {
	const editor = vscode.window.activeTextEditor;
	const selection = editor.selection

	
	// Creating a function which takes a file as input
	let arr = editor.document.getText().split('\n');
	
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
		editor.edit(editBuilder =>{editBuilder.insert(new vscode.Position(0,0),'#include <iostream>\n')});
	}

	return 0;
}
```
Функция получает информацию о файле с которым работает пользователь и проверет наличие в ней библиотеки iostream. В случает отсутсвия подключает библиотеку в начале файла.

- variableChar(char)
``` javascript
function variableChar(char){
	return '0' <= char && char <= '9' || 'A' <= char && char <= 'Z' || 'a' <= char && char <= 'z' || char == '_';
}

```
Функция принимает cтроку и проверяет - является ли она цифрой, буквой или нижним подчеркиванием. 

- clearFromQuotations(string)
``` javascript
function clearFromQuotations(string){
	let arr = string.split('\"');
	let output = "";
	for(let i = 0; i < arr.length; ++i){
		if (i % 2 == 0 && arr[i].length != 0){
			output += arr[i];
		}
	}
	string = output;
	output = "";
	arr = string.split('\'');
	for(let i = 0; i < arr.length; ++i){
		if (i % 2 == 0 && arr[i].length != 0){
			output += arr[i];
		}
	}
	return output;
}
```
Функция принимает строку и вовзвращает производную от нее, полученную путем  удаленния всех элементов между кавычками, включая их самих.

- clearFromSpaces(string)
``` javascript
function clearFromSpaces(string){
	let arr = string.split('\n');
	let output = "";
	for(let i = 0; i < arr.length; ++i){
		if (arr[i].length != 0){
			output += arr[i];
		}
	}
	string = output;
	output = "";
	arr = string.split('\t');
	
	for(let i = 0; i < arr.length; ++i){
		if (arr[i].length != 0){
			output += arr[i];
		}
	}
	string = output;
	output = "";
	arr = string.split(' ');
	for(let i = 0; i < arr.length; ++i){
		if (arr[i].length != 0){
			output += arr[i];
		}
	}

	return output;
} 

```
Функция принимает строку и вовзвращает производную от нее, полученную путем  удаленния всех пробелов, табуляций и символов новой строки.

- bracketChar(char)
``` javascript
function bracketChar(char){
	return char == '[' || char == ']' || char == '(' || char == ')' || char == '{' || char == '}'; 
}

```
Функция принимает cтроку и проверяет - является ли она скобкой.

- digitCharacter(char)
``` javascript
function digitCharacter(char){
	return char >= '0' && char <= '9';
}   

```
Функция принимает cтроку и проверяет - является ли она цифрой.


- getVariables(keywords, string, functionIncluded = true, arraysIncluded = true, membersIncluded = true)
``` javascript
function getVariables(keywords, string, functionIncluded = true, arraysIncluded = true, membersIncluded = true){
	let variableStarted = false;
	let output = [];
	let buffer = "";

	let squareBrackets = 0;
	let circleBrackets = 0;
	let avoidBracketsAndMembers = false;

	let j = 0;

	string = clearFromQuotations(string);
	string = clearFromSpaces(string);
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
		avoidBracketsAndMembers = keywords.includes(buffer);

		if(!avoidBracketsAndMembers && membersIncluded && (i < string.length) && (string[i] == '.') ){
			buffer += '.';
			++i;
			
			while ( i < string.length && string[i] != ';'){
				if(bracketChar(string[i])){
				if(string[i] == '('){
					++circleBrackets; 
				} else if (string[i] == ')'){
					--circleBrackets;
					
				}

				if(string[i] == '['){
					++squareBrackets; 
				} else if (string[i] == ']'){
					--squareBrackets; 
					
				}
			} else if ((!variableChar(string[i]) )&& squareBrackets == 0 && circleBrackets == 0){
				
				break;
			}
				buffer += string[i];
				++i;
			}
			circleBrackets = 0;
			squareBrackets = 0;
		}
		else if (!avoidBracketsAndMembers && arraysIncluded && (i < string.length) && (string[i] == '[') ){
			squareBrackets = 1;
			buffer += '[';
			j = i + 1;
		}  
		else if (!avoidBracketsAndMembers && functionIncluded &&(i < string.length) && (string[i] == '(') ){
			circleBrackets = 1;
			buffer += '(';
			j = i + 1;
		}

		while (squareBrackets != 0 && j < string.length){
			buffer += string[j];
			if(string[j] == '['){
				++squareBrackets;
			} else if (string[j] == ']'){
				--squareBrackets;
			}
			++j;
		}		

		while (circleBrackets != 0 && j < string.length){
			buffer += string[j];
			if(string[j] == '('){
				++circleBrackets;
			} else if (string[j] == ')'){
				--circleBrackets;
			}
			++j;
		}

		if(buffer != ""){
			output.push(buffer);
		}
		buffer = "";
		variableStarted = false;
		avoidBrackets = false;
		
	}
	return output;

}

```
Функция принимает массив ключевых слов (включая определенные плагином), строку (котора была выделена при вызове комманды плагина), три флага изначально равных true - вовзращает функция массив переменных, которые были в данной строке. Если флаг functionIncluded = true, то будет выведено значение после вызова функции, если верен arraysIncluded - соответствующий эдемент массива, если membersIncluded - элемент или значение после вызова метода. 


- printVariables(keywords,string)
``` javascript
function printVariables (keywords,string) {

	
	let output = "";
	let arr = getVariables(keywords,string);
	for(let i = 0; i < arr.length; ++i){
		if(arr[i] != "" && !keywords.includes( arr[i] )){

			if(output == ""){
				output = "std::cout";
			}
			output += " << " + '\"' + arr[i] + " value:\" << " + arr[i];
		} 
	}
	if(output != ""){
		output += ';\n';
	}
	let editor = vscode.window.activeTextEditor;
	if(output != ""){
		
		editor.edit( editBuilder =>{editBuilder.insert(new vscode.Position(editor.selection.active.line + 1, 0),output + '\n')});

	}
	return 0;

}

```
Функция принимает массив ключевых слов (включая определенные плагином) и строку (которая была выделена при вызове плагина). Если в данной строке будет хотя бы 1 переменная, то в результате исполнения в активный файл (на следующую после курсора строку) строки, которая выведет в стандартный поток нужные переменные.

- registerKeywords(keywords,string)
``` javascript
function registerKeywords(keywords,string){
	let arr = getVariables(keywords,string, false, false);
	for(let i = 0; i < arr.length; ++i){
		if(!keywords.includes(arr[i])){
			keywords.push(arr[i]);
			
		}
	}
	return 0;
}

```
Функция принимает массив ключевых слов (включая определенные плагином) и строку (которая была выделена при вызове плагина). Если в выделенной строке будет подстрока, котору. можно трактовать как переменную и при этом в keywords нет данной строки, то в  keywords эта
строка добавляется.


- disregisterKeywords(keywordsCPP, keywords,string)
``` javascript
function disregisterKeywords(keywordsCPP, keywords,string){
	let arr = getVariables(keywords,string, false, false);
	let index = 0;
	
	for(let i = 0; i < arr.length; ++i){
		index = keywords.indexOf(arr[i]); 
		if(index > -1 && !keywordsCPP.includes(arr[i])){
			 keywords.splice(index, 1);
			
		} 
	}
	return 0;
}
   

```
Функция принимает массив с ключевыми словами C++, массив ключевых слов (включая определенные плагином) и строку (которая была выделена при вызове плагина).  Если в выделенной строке будет подстрока, котору. можно трактовать как переменную и при этом в keywords есть там данная строка, то строка из keywords удаляется добавляется.

## РеалЫизация функции activate
- activate(context)
``` javascript

function activate(context) {

	const keywordsCPP = ["alignas","alignof","and","and_eq","asm","atomic_cancel","atomic_commit","atomic_noexcept","auto","bitand",
"bitor","bool","break","case","catch","char","char8_t","char16_t","char32_t","class","compl","concept","const","consteval","constexpr",
"constinit","const_cast","continue","co_await","co_return","co_yield","decltype","default","delete","do","double","dynamic_cast","else",
"enum","explicit","export","extern","false","float","for","friend","goto","if","inline","int","long","mutable","namespace","new",
"noexcept","not","not_eq","nullptr","operator","or","or_eq","private","protected","public","reflexpr","register","reinterpret_cast",
"requires","return","short","signed","sizeof","static","static_assert","static_cast","struct","switch","synchronized","template","this",
"thread_local","throw","true","try","typedef","typeid","typename","union","unsigned","using","virtual","void","volatile","wchar_t","while",
"xor","xor_eq"];

	let keywords = [];
	keywords.push(keywordsCPP);	
	const filename = vscode.window.activeTextEditor.document.fileName;
	const registrator = vscode.commands.registerCommand('variable-printer-js.keywordsRegister',function(){
		registerKeywords(keywords, getSelectionText().toString());

	}); 
	const disregistrator = vscode.commands.registerCommand('variable-printer-js.keywordsDisregister',function(){
		 disregisterKeywords(keywordsCPP, keywords, getSelectionText());
	}); 

	const printer = vscode.commands.registerCommand('variable-printer-js.printer', function () {
		iostreamCheck(filename);
		
		printVariables(keywords,getSelectionText());
	});

	context.subscriptions.push(printer, registrator, disregistrator);
}

```
Помимо задания массивов с ключевыми словами, легко заметить 3 комманды - добавить в keyword, убрать из keyword и напечатать переменную 
```javascript
    const printer = vscode.commands.registerCommand('variable-printer-js.printer', function () {
		iostreamCheck(filename);
		
		printVariables(keywords,getSelectionText());
	});
    ...
	const disregistrator = vscode.commands.registerCommand('variable-printer-js.keywordsDisregister',function(){
		 disregisterKeywords(keywordsCPP, keywords, getSelectionText());
	}); 
    ...
	const printer = vscode.commands.registerCommand('variable-printer-js.printer', function () {
		iostreamCheck(filename);
		
		printVariables(keywords,getSelectionText());
	});
```
# История изменения
1. По официальному гайду VS Code установка Yeoman
2. Реализации пользовательских функций
3. Реализация функции activate
```
$ git log
commit 2942fcfedaa97472cb1e1e4277df2adc570300d7 (HEAD -> master)
Author: ginger-gafgot <465333@niuitmo.ru>
Date:   Thu Nov 28 04:11:26 2024 +0300

    plugin realised

commit 9ffa5c6d8be1253c8ad4679cc2d32efbb8adaa6f
Author: ginger-gafgot <465333@niuitmo.ru>
Date:   Wed Nov 27 16:48:01 2024 +0300

    that should work

```
# Работу выполнил
- Быстров Игорь
- Группа M3102