# Massimp v0.1
An HTML component for treatment and processing of massive data

Written in ES6 / JavaScript
Created by Renan Niemietz Cardoso

Dependencies:
    - Bootstrap CSS v4.3.1
    https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css

    - XLSX v0.14.3
    https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.3/xlsx.full.min.js

Massimp dependencies:

    Before declaring "massimp.min.js", make sure "Bootstrap CSS v4.3.1", "massimp.min.css" and "XLSX v0.14.3" were declared previously in your HTML, like the following example:
    
        ...
        <head>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
            <link rel="stylesheet" href="massimp.min.css">
            <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.14.3/xlsx.full.min.js"></script>
            <script type="text/javascript" src="massimp.min.js"></script>
        </head>
        ...

Massimp usage:

    1. Create a <div> element with a class named "massimp-container", inside your HTML file

    2. After document is loaded, start the Massimp element by doing the following:

    Using jQuery:
        $(".massimp-container").massimp( [OPTIONS] );

    Using pure ES6 / Javascript:
        getElementsByClassName("massimp-container")[0].massimp( [OPTIONS] );

        or

        new Massimp(".massimp-container", [OPTIONS] );

    PS.:
        If you want the set the default settings of the Massimp Element, send the options object as parameter, like:

        Using jQuery:
            $(".massimp-container").massimp({
                showInputFileText: false,
                maxVerticalRowsToDisplay: 3,
                buttonText: "Make it happen!"
            });

        Using pure ES6 / Javascript:
            getElementsByClassName("massimp-container")[0].massimp({
                showInputFileText: false,
                maxVerticalRowsToDisplay: 3,
                buttonText: "Make it happen!"
            });

            or

            new Massimp(".massimp-container", {
                showInputFileText: false,
                maxVerticalRowsToDisplay: 3,
                buttonText: "Make it happen"
            });

Massimp options:

    - language - Component language (Only pt-BR and en-US are avalible for now)

    - attributes - Attributes do associate with the massive data file columns

        It must be an object array, and each object with the following properties:
            valor {string} - Attribute name on the final result, it can not contain spaces, or starts with numbers or special characters.
            titulo {string} - Presentable name of attribute
            isImage {boolean} - Image file. If this property is set, a table will appear asking for the user to choose and define the image of each data to be inserted (OPTIONAL)

        Ex.:
            [ { valor: "name", titulo: "NOME" }, { valor: "age", titulo: "IDADE" }, { valor: "userImage", titulo: "FOTO", isImage: true } ]

    - showInputFileText - Show or hide the text beside file input
    - inputFileText - Text beside file input
    - inputFileInsideText - Text inside file input

    - maxVerticalRowsToDisplay - Number of visible rows vertically

    - colorButtonClass - Main button's class (Default: "btn-outline-primary")
    - buttonText - Main button's text
    - onButtonClicked - Action after main button has been clicked

    - showExtraButton - Show or hide the extra button (Button without pre-action)
    - colorExtraButtonClass - Extra button's class (Default: "btn-outline-primary")
    - extraButtonText - Extra button's text
    - onExtraButtonClicked - Action after extra button has been clicked

Massimp methods:

    - setShowInputFileText - Show or hide the text beside file input
        Params: boolean
    - setInputFileText - Change the text beside file input
        Params: string
    - setInputFileInsideText - Change the text inside file input
        Params: string

    - setMaxVerticalRowsToDisplay - Changes the number of visible rows vertically
        Params: number

    - getNumberOfObjects - Gets the number of objects/lines to be inserted
        Return: number

    - setColorButtonClass - Change the main button's class (Default: "btn-outline-primary")
        Params: string
    - setButtonText - Change the main button's text
        Params: string

    - setShowExtraButton - Show or hide the extra button (Button without pre-action)
        Params: boolean
    - setColorExtraButtonClass - Change the extra button's class (Default: "btn-outline-danger")
        Params: string
    - setExtraButtonText - Change the extra button's text
        Params: string
    - processMassiveImport - Process/Calculate the massive import (Callback with result as param)

    jQuery Usage Examples:
        $(".massimp-container").massimp("setMaxVerticalRowsToDisplay", 3);

        $(".massimp-container")[0]._massimp.setMaxVerticalRowsToDisplay(3);

    Pure ES6 / Javascript Usage Examples:
        getElementById("my-massimp-container")._massimp.setMaxVerticalRowsToDisplay(3);

        getElementsByClassName("massimp-container")[0]._massimp.setMaxVerticalRowsToDisplay(3);

Massimp events (jQuery Only):

    - after.mp.process - This event fires when the massive import process/calculation is done

    Ex.:
        $(".massimp-container").on("after.mp.process", function(e, result)
        {
            console.warn("Massive Import Result", result);
        });