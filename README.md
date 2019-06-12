# Massimp v0.1
An HTML component for treatment and processing of massive data

Written in **JavaScript (ES6)**

Created by **Renan Niemietz Cardoso**

## Dependencies
[Bootstrap CSS v4.3.1](https://github.com/twbs/bootstrap/tree/v4.3.1)

[XLSX v0.14.0](https://github.com/SheetJS/js-xlsx/tree/v0.14.0)

Before declaring **massimp.min.js**, make sure **Bootstrap CSS v4.3.1**, **massimp.min.css** and **XLSX v0.14.0** were declared previously in your HTML, like the following example:
```html
...
<head>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <link rel="stylesheet" href="massimp.min.css">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.0/xlsx.full.min.js"></script>
    <script type="text/javascript" src="massimp.min.js"></script>
</head>
...
```

## Usage

1. Create a **\<div\>** element with a class named **massimp-container**, inside your HTML file

2. After document is loaded, start the Massimp element by doing the following:

   Using jQuery:
```javascript
$(".massimp-container").massimp( [OPTIONS] );
```
   Using pure ES6 / Javascript:
```javascript
getElementsByClassName("massimp-container")[0].massimp( [OPTIONS] );
```
   or
```javascript
new Massimp(".massimp-container", [OPTIONS] );
```
   * PS.:
   If you want the set the default settings of the Massimp Element, send the options object as parameter, like:
   Using jQuery:
```javascript
$(".massimp-container").massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   Using pure ES6 / Javascript:
```javascript
getElementsByClassName("massimp-container")[0].massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   or
```javascript
new Massimp(".massimp-container", {
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen"
});
```

## Options

Option | Default | Description | Example
--- | --- | --- | ---
language | Local language or en-US if local language is unavailable | Component language (Only pt-BR and en-US are avalible for now) | "en-US"
attributes | [ ] | Attributes do associate with the massive data file columns | [ { valor: "name", titulo: "NOME" }, { valor: "age", titulo: "IDADE" }, { valor: "userImage", titulo: "FOTO", isImage: true } ]
inputFileText | "List" | Text beside file input | "File"
inputFileInsideText | "Choose a file" | Text inside file input | "CSV, XLS or XLSX file ..."
maxVerticalRowsToDisplay | 5 | Number of visible rows vertically | 2
colorButtonClass | "blue" | Main button's class | "green"
buttonText | "Do it!" | Main button's text | "Make it happen!"
onButtonClicked | null | Action after main button has been clicked (Triggered after processing) | function(result) { console.log(result); }
showExtraButton | false | Show or hide the extra button (Button without pre-action) | true
colorExtraButtonClass | "red" | Extra button's class | "orange"
extraButtonText | "Cancel" | Extra button's text | "Back"
onExtraButtonClicked | null | Action after extra button has been clicked | function() { console.log("Back clicked!"); }

## Methods:

Method | Description | Parameter Type | Return Type
--- | --- | --- | ---
setShowInputFileText | Show or hide the text beside file input | boolean | void
setInputFileText | Change the text beside file input | string | void
setInputFileInsideText | Change the text inside file input | string | void
setMaxVerticalRowsToDisplay | Changes the number of visible rows vertically | number | void
getNumberOfObjects | Gets the number of objects/lines to be inserted | null | number
setColorButtonClass | Change the main button's class | string | void
setButtonText | Change the main button's text | string | void
setShowExtraButton | Show or hide the extra button (Button without pre-action) | boolean | void
setColorExtraButtonClass | Change the extra button's class | string | void
setExtraButtonText | Change the extra button's text | string | void
processMassiveImport | Process/Calculate the massive import | function | void

## Events (jQuery Only):

Event | Description
--- | ---
after.mp.process | This event fires when the massive import process/calculation is done