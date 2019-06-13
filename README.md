# Massimp v0.1 (for Materialize)
An HTML component for treatment and processing of massive data

Written in **JavaScript (ES6)**

Created by **Renan Niemietz Cardoso**

## Description

Massimp generates an input file element and other components such as buttons and tables in order to allow users to simply choose a spreadsheet file, relates each column with their corresponding object property and finally generates a javascript object to work with. Massimp simplify the way user's deal with a large amount of data when they need to be registered in database or something else.

## Dependencies

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
   * e.g.:
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
   * e.g.:
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
   * e.g.:
```javascript
new Massimp(".massimp-container", {
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```

## Options

Option | Default | Description | Type
--- | --- | --- | ---
language | Browser's language or "en-US" if browser's language is not supported | Component language (Only "pt-BR" and "en-US" are avalible for now) | string
attributes | [ ] | Attributes do associate with the massive data file columns | Array of objects
inputFileText | "List" | Text beside file input | string
inputFileInsideText | "Choose a file" | Text inside file input | string
maxVerticalRowsToDisplay | 5 | Number of visible rows vertically | number
colorButtonClass | "blue" | Main button's class | string
buttonText | "Do it!" | Main button's text | string
onButtonClicked | null | Action after main button has been clicked (Triggered after procedure/calculation) | function
showExtraButton | false | Show or hide the extra button (Button without pre-action) | boolean
colorExtraButtonClass | "red" | Extra button's class | string
extraButtonText | "Cancel" | Extra button's text | string
onExtraButtonClicked | null | Action after extra button has been clicked | function
onError | function(error) { console.error(error) } | Action after an error occurs | function

## Methods

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
processMassiveImport | Process/Calculate the massive data | function | void

   * jQuery e.g.:
```javascript
$(".massimp-container").massimp("setInputFileInsideText", ".xls, .xlsx or .csv file ...");
```
   * Pure Javascript (ES6) e.g.:
```javascript
getElementsByClassName("massimp-container")[0]._massimp.setInputFileInsideText(".xls, .xlsx or .csv file ...");
```

## Events (jQuery Only)

Event | Description
--- | ---
after.mp.process | This event fires when the procedure/calculation is done

   * e.g.:
```javascript
$(".massimp-container").on("after.mp.process", function(e, result)
{
   console.warn("Massive Import Result", result);

   let alertText = "Massive Import Result:";
   alertText += "\n\n";
   result.forEach(function(obj, index)
   {
      Object.keys(obj).forEach(function(key, jndex)
      {
            let value = obj[key];
            if(value == null)
            {
               value = "-";
            }
            else if(value instanceof File)
            {
               value = value.name;
            }
            alertText += key + ": " + value + "\n";
      });

      alertText += "\n";
   });

   alert(alertText);
});
```

## Support

If you're having any issue by using Massimp, contact me through the following e-mail address:

**[renan_ncs@msn.com](mailto:renan_ncs@msn.com)**