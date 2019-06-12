# Massimp v0.1 (w/ Materialize)
An HTML component for treatment and processing of massive data

Written in **JavaScript (ES6)**

Created by **Renan Niemietz Cardoso**

## Dependencies
[Materialize CSS v0.100.0](https://github.com/Dogfalo/materialize/tree/v0.100.0)

[XLSX v0.14.0](https://github.com/SheetJS/js-xlsx/tree/v0.14.0)

Before declaring **massimp.min.js**, make sure **[Materialize CSS v0.100.0](https://github.com/Dogfalo/materialize/tree/v0.100.0)**, **massimp.min.css** and **[XLSX v0.14.0](https://github.com/SheetJS/js-xlsx/tree/v0.14.0)** were declared previously in your HTML, like the following example:
```html
...
<head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">
    <link rel="stylesheet" href="massimp.min.css">
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.0/xlsx.full.min.js"></script>
    <script type="text/javascript" src="massimp.min.js"></script>
</head>
...
```

## Usage

1. Create a **\<div\>** element with a class named **massimp-container**, inside your HTML file

2. After document is loaded, start the Massimp element by doing the following:

**jQuery:**
```javascript
$(".massimp-container").massimp( [OPTIONS] );
```
   * Eg.:
```javascript
$(".massimp-container").massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   **Pure Javascript (ES6):**
```javascript
getElementsByClassName("massimp-container")[0].massimp( [OPTIONS] );
```
   * Eg.:
```javascript
getElementsByClassName("massimp-container")[0].massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   or
```javascript
new Massimp(".massimp-container", [OPTIONS] );
```
   * Eg.:
```javascript
new Massimp(".massimp-container", {
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen"
});
```

## Options

Option | Default | Description | Type
--- | --- | --- | ---
language | Browser's language or "en-US" if browser's language is not supported | Component language (Only pt-BR and en-US are avalible for now) | string
attributes | [ ] | Attributes do associate with the massive data file columns | Array of objects
inputFileText | "List" | Text beside file input | string
inputFileInsideText | "Choose a file" | Text inside file input | string
maxVerticalRowsToDisplay | 5 | Number of visible rows vertically | number
colorButtonClass | "blue" | Main button's class | string
buttonText | "Do it!" | Main button's text | string
onButtonClicked | null | Action after main button has been clicked (Triggered after processing) | function
showExtraButton | false | Show or hide the extra button (Button without pre-action) | boolean
colorExtraButtonClass | "red" | Extra button's class | string
extraButtonText | "Cancel" | Extra button's text | string
onExtraButtonClicked | null | Action after extra button has been clicked | function

## Methods:

Method | Description | Parameter Type | Return Type
--- | --- | --- | ---
setShowInputFileText | Show or hide the text beside file input | boolean | void
setInputFileText | Change the text beside file input | string | void
setInputFileInsideText | Change the text inside file input | string | void
setMaxVerticalRowsToDisplay | Changes the number of visible rows vertically | number | void
getNumberOfObjects | Gets the number of objects/lines to be inserted |  | number
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