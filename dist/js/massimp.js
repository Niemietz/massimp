/**
    Massimp - v0.1
    https://github.com/Niemietz/massimp

    Written in JavaScript (ES6)
    Created by Renan Niemietz Cardoso
*/

const Massimp = (function ()
{
    // ===== "GLOBAL" VARIABLES AND CONSTANTS =====
    let atributos = [ ];

    const massimpErrorPrefix = "Massimp Error: ";
    const _languages = {
        "en-us": {
            // MASSIMP ERRORs
            elementNotFound: massimpErrorPrefix + "Element not found",
            fileWithNoContent: massimpErrorPrefix + "File without content",
            invalidFile: massimpErrorPrefix + "Invalid file",
            noDataProcessed: massimpErrorPrefix + "No data was processed",
            noAttributeAssociated: massimpErrorPrefix + "None attribute was associated to any column from file",
            noFileSet: massimpErrorPrefix + "No file was set",

            // ELEMENTs STRINGs
            list: "List",
            fileChoose: "Choose a file",
            fileWithHeader: "Header (It has a column title at the 1st line)",
            fileWithoutHeader: "No Header (It doesn't have a column title at the 1st line)",
            defaultButtonText: "Do it!",
            extraButtonText: "Cancel",
            line: "Line",
            column: "Column",
            attribute: "Attribute",
            open: "Open",
            close: "Close",
            change: "Change",
            remove: "Remove",
        },
        "pt-br": {
            // MASSIMP ERRORs
            elementNotFound: massimpErrorPrefix + "Elemento não encontrado",
            fileWithNoContent: massimpErrorPrefix + "Não foi possível encontrar conteúdo neste arquivo!",
            invalidFile: massimpErrorPrefix + "Arquivo inválido",
            noDataProcessed: massimpErrorPrefix + "Nenhum dado foi processado",
            noAttributeAssociated: massimpErrorPrefix + "Nenhum atributo foi associado à nenhuma coluna do arquivo",
            noFileSet: massimpErrorPrefix + "Nenhum arquivo foi selecionado",

            // ELEMENTs STRINGs
            list: "Lista",
            fileChoose: "Escolha um arquivo",
            fileWithHeader: "Com cabeçalho (Com o título da coluna na 1ª linha)",
            fileWithoutHeader: "Sem cabeçalho (Sem o título da coluna na 1ª linha)",
            defaultButtonText: "Processar!",
            extraButtonText: "Cancelar",
            line: "Linha",
            column: "Coluna",
            attribute: "Atributo",
            open: "Abrir",
            close: "Fechar",
            change: "Alterar",
            remove: "Remover",
        },
    };

    Object.keys(_languages).forEach(function(key)
    {
        const lang = _languages[key];
        lang["languageNotSupported"] = "Massimp Error: Unsupported language";
    });

    let _selectedLanguage = navigator.language.toLocaleLowerCase() || navigator.userLanguage.toLocaleLowerCase();

    if(_selectedLanguage == null || !Object.keys(_languages).includes(_selectedLanguage))
    {
        console.warn("Massimp Warning: Could not use local language, setting English (en-US) as default language.");
        _selectedLanguage = "en-us";
    }

    let _sheets = null;
    let _sheetIndex = 0;
    let _header = true;
    let _showImagesTable = false;
    let _imagesProcessed = true;
   
    // ELEMENT CLASSES OR/AND IDs
    const inputGroupElementClass = "massimp-file-group";
    const customFileElementClass = "massimp-custom-file";
    const inputFileInsideTextGroupElementClass = "massimp-file-group-append";    
    const clearInputFileGroupElementClass = "massimp-file-group-clean";
    const radioGroupElementClass = "massimp-radio-group";
    const radioElementClass = "massimp-radio";
    const radioHasHeaderElementName = "massimp-has-header";

    const sheetsRadioGroupElementClass = "massimp-excel-sheets";
    const radioSheetElementName = "massimp-sheet";

    const tableDivElementClass = "massimp-table-group";
    const tableElementTag = "table";
    const tableBodyElementTag = "tbody";
    const tableHeadElementTag = "thead";

    const tableResultDivElementClass = "massimp-table-result-group";

    const buttonsGroupElementClass = "massimp-buttons-group";
    const defaultButtonElementClass = "massimp-default-button";
    const extraButtonElementClass = "massimp-extra-button";

    // ===== PRIVATE "GLOBAL" FUNCTIONS =====    
    /** excelFileToJSON
     * @param fileBinary
     * @param {Boolean} hasHeader - If spreadsheet has the column names on the first line
     */
    function excelFileToJSON(fileBinary, hasHeader = true)
    {
        const workbook = XLSX.read(fileBinary, {
            type: 'binary'
        });
    
        const sheets = [];
    
        workbook.SheetNames.forEach((sheetName) =>
        {
            let options = { };
            if(!hasHeader)
            {
                options["header"] = 1;
            }
    
            // XLSX sheet rows converted into array
            const rowsArray = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], options);
            
            const sheet = { "nome": sheetName, "conteudo": rowsArray };
    
            sheets.push(sheet);
        });
    
        return sheets;
    };
    
    /** excelFileInputToJSON
     * @param {HTMLElement} fileInput - Spreadsheet file input element
     * @param {Function} success - Action after parsing
     * @param {Function} error - Action if error on parsing
     * @param {Boolean} hasHeader - If spreadsheet has the column names on the first line
     */
    function excelFileInputToJSON(fileInput, success, error, hasHeader = true)
    {
        const fileReader = new FileReader();
    
        fileReader.onload = (e) =>
        {
            try
            {
                const fileBin = e.target.result;
        
                const excelSheets = excelFileToJSON(fileBin, hasHeader);
        
                success(excelSheets);
            }
            catch(ex)
            {
                error(ex);
            }
        };
    
        fileReader.onerror = (ex) =>
        {
            error(ex);
        };
    
        fileReader.readAsBinaryString(fileInput.files[0]);
    };
    
    /** renameObjectKeys
     * @param {JSON} object - Object in which keys will be renamed
     * @param {Array} array_FromTo - Array of objects that has to follow the following format: [{ "from": string, "to": string }] */
    function renameObjectKeys(object, array_FromTo)
    {
        let result = Object.assign({}, object);
    
        array_FromTo.forEach(function(item, index)
        {
            const from = item.from;
            const to = item.to;
    
            if(result[from] != null)
            {
                result[to] = result[from];
                delete result[from];
            }
        });
    
        return result;
    };

    /** getAllIndexes
     * @param {Array} arr - Array to be looked for
     * @param val - Value to look for in array
     * @param attr - Attribute to search in array objects */
    function getAllIndexes(arr, val, attr = null)
    {
        let indexes = [], i;
        for(i = 0; i < arr.length; i++)
        {
            if(attr != null)
            {
                if (arr[i][attr] === val)
                {
                    indexes.push(i);
                }
            }
            else
            {
                if (arr[i] === val)
                {
                    indexes.push(i);
                }
            }
        }
        return indexes;
    }

    const privateProps = new WeakMap();

    /** Massimp
     * @param _element 
     * @param {Object} _options 
     */
    class Massimp
    {
        constructor(_element, _options)
        {
            if(typeof _element === "string")
            {
                _element = document.querySelector(_element);
                _element._massimp = this;
            }

            privateProps.set(this, {
                element: _element,
                options: _options,

                // ===== PRIVATE FUNCTIONS =====

                _getStringList: function()
                {
                    return _languages[_selectedLanguage.toLocaleLowerCase()];
                },

                // CREATING AND LOADING MASSIMP CONTAINER HTML
                _loadHTML: function()
                {
                    /*
                        <div class="massimp-container">
                            <div class="massimp-file-group file-field input-field row" style="margin-bottom: 30px">
                                <div class="massimp-custom-file btn light-blue lighten-5 black-text waves-effect waves-light col s1 m1 l1">
                                    <span class="massimp-file-text">List</span>
                                    <input class="massimp-file" type="file" accept=".csv, .xls, .xlsx">
                                </div>
                                <div class="massimp-file-group-append file-path-wrapper col s9 m9 l9">
                                    <input class="massimp-file-label file-path validate" type="text" placeholder="Choose a file">
                                </div>
                                <div class="massimp-file-group-clean col s2 m2 l2" style="display: none; line-height: 6vh">
                                    <button type="button" class="waves-effect waves-light btn-flat red-text">&#10006;</button>
                                </div>
                            </div>
                            <div class="massimp-radio-group row">
                                <label class="massimp-radio col s6 m6 l6">
                                    <input class="with-gap" name="massimp-has-header" value="true" type="radio" checked />
                                    <span>Header (It has a column title at the 1st line)</span>
                                </label>
                                <label class="massimp-radio col s6 m6 l6">
                                    <input class="with-gap" name="massimp-has-header" value="false" type="radio" />
                                    <span>No Header (It doesn't have a column title at the 1st line)</span>
                                </label>
                            </div>
                            <div class="massimp-excel-sheets" style="display: none; padding-bottom: 30px">
                                <p>
                                    <label>
                                        <input class="with-gap" name="sheet" value="a" type="radio" checked />
                                        <span>Spreadsheet A</span>
                                    </label>
                                </p>
                                <p>
                                    <label>
                                        <input class="with-gap" name="sheet " value="b" type="radio" />
                                        <span>Spreadsheet B</span>
                                    </label>
                                </p>
                            </div>
                            <div class="massimp-table-group" style="display: none; margin-bottom: 30px">
                                <table class="responsive-table striped">
                                    <thead>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                            <div class="massimp-table-result-group" style="display: none; margin-bottom: 30px">
                                <table class="responsive-table striped">
                                    <thead>
                                    </thead>
                                    <tbody>
                                    </tbody>
                                </table>
                            </div>
                            <div class="massimp-buttons-group">
                                <button type="button" class="btn blue waves-effect waves-light massimp-default-button">Process!</button>
                            </div>
                        </div>
                    */
                    while (this.element.firstChild)
                    {
                        this.element.removeChild(this.element.firstChild);
                    }
                    
                    this.element.appendChild(this._createFileHTML());
                    this.element.appendChild(this._createRadioHeaderHTML());
                    this.element.appendChild(this._createExcelSheetsHTML());
                    this.element.appendChild(this._createColumnsAssociationsHTML());
                    this.element.appendChild(this._createResultHTML());
                    this.element.appendChild(this._createButtonsHTML());
                },
                _createFileHTML: function()
                {
                    /*
                        <div class="massimp-file-group file-field input-field row" style="margin-bottom: 30px">
                            <div class="massimp-custom-file btn waves-effect waves-light col s1 m1 l1">
                                <span class="massimp-file-text">List</span>
                                <input class="massimp-file" type="file" accept=".csv, .xls, .xlsx">
                            </div>
                            <div class="massimp-file-group-append file-path-wrapper col s9 m9 l9">
                                <input class="massimp-file-label file-path validate" type="text" placeholder="Choose a file">
                            </div>
                            <div class="massimp-file-group-clean col s2 m2 l2" style="display: none; line-height: 6vh">
                                <button type="button" class="waves-effect waves-light btn-flat red-text">&#10006;</button>
                            </div>
                        </div>
                    */
                    const fileText = document.createElement("span");
                    fileText.classList.add("massimp-file-text");
                    fileText.innerHTML = this._getStringList().list;

                    const fileInput = document.createElement("input");
                    fileInput.classList.add("massimp-file");
                    fileInput.setAttribute("accept", ".csv, .xls, .xlsx");
                    fileInput.setAttribute("type", "file");

                    const fileTextDiv = document.createElement("div");
                    fileTextDiv.classList.add("massimp-custom-file");
                    fileTextDiv.classList.add("btn");
                    fileTextDiv.classList.add("waves-effect");
                    fileTextDiv.classList.add("waves-light");
                    fileTextDiv.classList.add("col");
                    fileTextDiv.classList.add("s1");
                    fileTextDiv.classList.add("m1");
                    fileTextDiv.classList.add("l1");

                    fileTextDiv.appendChild(fileText);
                    fileTextDiv.appendChild(fileInput);
                    
                    const fileLabel = document.createElement("input");
                    fileLabel.setAttribute("type", "text");
                    fileLabel.classList.add("massimp-file-label");
                    fileLabel.classList.add("file-path");
                    fileLabel.placeholder = this._getStringList().fileChoose;
                    fileLabel.onclick = () =>
                    {
                        const inputFile = this._getInputFileElement();
                        if(inputFile != null)
                        {
                            inputFile.click();
                        }
                    }

                    const fileDiv = document.createElement("div");
                    fileDiv.classList.add("massimp-file-group-append");
                    fileDiv.classList.add("file-path-wrapper");
                    fileDiv.classList.add("col");
                    fileDiv.classList.add("s9");
                    fileDiv.classList.add("m9");
                    fileDiv.classList.add("l9");

                    fileDiv.appendChild(fileLabel);

                    const cleanButton = document.createElement("button");
                    cleanButton.setAttribute("type", "button");
                    cleanButton.classList.add("btn-flat");
                    cleanButton.classList.add("waves-effect");
                    cleanButton.classList.add("waves-light");
                    cleanButton.classList.add("red-text");
                    cleanButton.innerHTML = "&#10006;";

                    const cleanFileButtonDiv = document.createElement("div");
                    cleanFileButtonDiv.classList.add("massimp-file-group-clean");
                    cleanFileButtonDiv.classList.add("col");
                    cleanFileButtonDiv.classList.add("s2");
                    cleanFileButtonDiv.classList.add("m2");
                    cleanFileButtonDiv.classList.add("l2");
                    cleanFileButtonDiv.setAttribute("title", this._getStringList().close);
                    cleanFileButtonDiv.style.display = "none";
                    cleanFileButtonDiv.style.lineHeight = "6vh";

                    cleanFileButtonDiv.appendChild(cleanButton);

                    const fileGroupDiv = document.createElement("div");
                    fileGroupDiv.classList.add("massimp-file-group");
                    fileGroupDiv.classList.add("file-field");
                    fileGroupDiv.classList.add("input-field");
                    fileGroupDiv.classList.add("row");
                    fileGroupDiv.style.marginBottom = "30px";

                    fileGroupDiv.appendChild(fileTextDiv);
                    fileGroupDiv.appendChild(fileDiv);
                    fileGroupDiv.appendChild(cleanFileButtonDiv);

                    return fileGroupDiv;
                },
                _createRadioHeaderHTML: function()
                {
                    /*
                        <div class="massimp-radio-group row">
                            <label class="massimp-radio col s6 m6 l6">
                                <input class="with-gap" name="massimp-has-header" value="true" type="radio" checked />
                                <span>Header (It has a column title at the 1st line)</span>
                            </label>
                            <label class="massimp-radio col s6 m6 l6">
                                <input class="with-gap" name="massimp-has-header" value="false" type="radio" />
                                <span>No Header (It doesn't have a column title at the 1st line)</span>
                            </label>
                        </div>
                    */
                    const inputRadio1 = document.createElement("input");
                    inputRadio1.setAttribute("type", "radio");
                    inputRadio1.setAttribute("checked", "true");
                    inputRadio1.name = "massimp-has-header";
                    inputRadio1.value = "true";
                    inputRadio1.classList.add("with-gap");
                    
                    const labelRadio1 = document.createElement("span");
                    labelRadio1.classList.add("black-text");
                    labelRadio1.innerHTML = this._getStringList().fileWithHeader;

                    const radio1 = document.createElement("label");
                    radio1.classList.add("massimp-radio");
                    radio1.style.marginRight = "1rem";

                    radio1.appendChild(inputRadio1);
                    radio1.appendChild(labelRadio1);

                    const inputRadio2 = document.createElement("input");
                    inputRadio2.setAttribute("type", "radio");
                    inputRadio2.name = "massimp-has-header";
                    inputRadio2.value = "false";
                    inputRadio2.classList.add("with-gap");

                    const labelRadio2 = document.createElement("span");
                    labelRadio2.classList.add("black-text");
                    labelRadio2.innerHTML = this._getStringList().fileWithoutHeader;

                    const radio2 = document.createElement("label");
                    radio2.classList.add("massimp-radio");
                    radio2.style.marginRight = "1rem";

                    radio2.appendChild(inputRadio2);
                    radio2.appendChild(labelRadio2);

                    const headerRadioDiv = document.createElement("div");
                    headerRadioDiv.classList.add("massimp-radio-group");

                    headerRadioDiv.appendChild(radio1);
                    headerRadioDiv.appendChild(radio2);

                    return headerRadioDiv;
                },
                _createExcelSheetsHTML: function()
                {
                    /*
                        <div class="massimp-excel-sheets" style="display: none; padding-bottom: 30px">
                        </div>
                    */
                    const excelSheetsDiv = document.createElement("div");
                    excelSheetsDiv.classList.add("massimp-excel-sheets");
                    excelSheetsDiv.style.paddingBottom = "30px";
                    excelSheetsDiv.style.display = "none";

                    return excelSheetsDiv;
                },
                _createColumnsAssociationsHTML: function()
                {
                    /*
                        <div class="massimp-table-group" style="display: none; margin-bottom: 30px">
                            <table class="responsive-table striped">
                                <thead>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    */
                    const thead = document.createElement("thead");

                    const tbody = document.createElement("tbody");

                    const table = document.createElement("table");
                    table.classList.add("responsive-table");
                    table.classList.add("striped");

                    table.appendChild(thead);
                    table.appendChild(tbody);

                    const columnsAssociationDiv = document.createElement("div");
                    columnsAssociationDiv.classList.add("massimp-table-group");
                    columnsAssociationDiv.style.marginBottom = "30px";
                    columnsAssociationDiv.style.display = "none";

                    columnsAssociationDiv.appendChild(table);

                    return columnsAssociationDiv;
                },
                _createResultHTML: function()
                {
                    /*
                        <div class="massimp-table-result-group" style="display: none; margin-bottom: 30px">
                            <table class="responsive-table striped">
                                <thead>
                                </thead>
                                <tbody>
                                </tbody>
                            </table>
                        </div>
                    */
                    const thead = document.createElement("thead");

                    const tbody = document.createElement("tbody");

                    const table = document.createElement("table");
                    table.classList.add("responsive-table");
                    table.classList.add("striped");

                    table.appendChild(thead);
                    table.appendChild(tbody);

                    const resultDiv = document.createElement("div");
                    resultDiv.classList.add("massimp-table-result-group");
                    resultDiv.style.marginBottom = "30px";
                    resultDiv.style.display = "none";

                    resultDiv.appendChild(table);

                    return resultDiv;
                },
                _createButtonsHTML: function()
                {
                    /*
                        <div class="massimp-buttons-group">
                            <button type="button" class="btn blue waves-effect waves-light massimp-default-button">Process!</button>
                        </div>
                    */
                    const defaultButton = document.createElement("button");
                    defaultButton.setAttribute("type", "button");
                    defaultButton.classList.add("btn");
                    defaultButton.classList.add("blue");
                    defaultButton.classList.add("waves-effect");
                    defaultButton.classList.add("waves-light");
                    defaultButton.classList.add("massimp-default-button");
                    defaultButton.innerHTML = this._getStringList().defaultButtonText;

                    const buttonsDiv = document.createElement("div");
                    buttonsDiv.classList.add("massimp-buttons-group");

                    buttonsDiv.appendChild(defaultButton);

                    return buttonsDiv;
                },

                // GETTING ELEMENTS
                _getInputGroupElement: function()
                {
                    let result = null;
            
                    const inputGroup = (_element.getElementsByClassName(inputGroupElementClass).length > 0) ? _element.getElementsByClassName(inputGroupElementClass)[0] : null;
                    if(inputGroup != null)
                    {
                        result = inputGroup;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getCustomFileElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const customFile = (inputGroup.getElementsByClassName(customFileElementClass).length > 0) ? inputGroup.getElementsByClassName(customFileElementClass)[0] : null;
                        if(customFile != null)
                        {
                            result = customFile;
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getInputFileTextElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const customFile = this._getCustomFileElement();
                        if(customFile != null)
                        {
                            const inputGroupText = (customFile.getElementsByTagName("span").length > 0) ? customFile.getElementsByTagName("span")[0] : null;
                            if(inputGroupText != null)
                            {
                                result = inputGroupText;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getInputFileElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const customFile = this._getCustomFileElement();
                        if(customFile != null)
                        {
                            const inputGroupText = (customFile.getElementsByTagName("input").length > 0) ? customFile.getElementsByTagName("input")[0] : null;
                            if(inputGroupText != null)
                            {
                                result = inputGroupText;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getInputFileInsideTextElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const inputInsideTextGroup = (inputGroup.getElementsByClassName(inputFileInsideTextGroupElementClass).length > 0) ? inputGroup.getElementsByClassName(inputFileInsideTextGroupElementClass)[0] : null;
                        if(inputInsideTextGroup != null)
                        {
                            const inputInsideText = (inputInsideTextGroup.getElementsByTagName("input").length > 0) ? inputInsideTextGroup.getElementsByTagName("input")[0] : null;
                            if(inputInsideText != null)
                            {
                                result = inputInsideText;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getClearInputFileGroupElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const inputGroupAppend = (inputGroup.getElementsByClassName(clearInputFileGroupElementClass).length > 0) ? inputGroup.getElementsByClassName(clearInputFileGroupElementClass)[0] : null;
                        if(inputGroupAppend != null)
                        {
                            result = inputGroupAppend;
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getClearInputFileElement: function()
                {
                    let result = null;
            
                    const inputGroup = this._getInputGroupElement();
                    if(inputGroup != null)
                    {
                        const inputGroupAppend = this._getClearInputFileGroupElement();
                        if(inputGroupAppend != null)
                        {
                            const clearInputText = (inputGroupAppend.getElementsByTagName("button").length > 0) ? inputGroupAppend.getElementsByTagName("button")[0] : null;
                            if(clearInputText != null)
                            {
                                result = clearInputText;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
            
                _getRadioElements: function()
                {
                    let result = null;
            
                    const radios = (document.querySelectorAll("." + radioGroupElementClass + " ." + radioElementClass) != null) ? document.querySelectorAll("." + radioGroupElementClass + " ." + radioElementClass) : null;
                    if(radios != null )
                    {
                        result = [];
                        radios.forEach(function (radio, index)
                        {
                            const radioInput = (radio.querySelector("input") != null) ? radio.querySelector("input") : null;
                            if(radioInput != null)
                            {
                                result.push(radioInput);
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        });
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getRadioHasHeaderElement: function()
                {
                    let result = null;
            
                    const radioHasHeader = (document.querySelector('input[name="' + radioHasHeaderElementName + '"]:checked') != null) ? document.querySelector('input[name="' + radioHasHeaderElementName + '"]:checked') : null;
                    if(radioHasHeader != null)
                    {
                        result = radioHasHeader;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
            
                _getSheetsRadioElements: function()
                {
                    let result = null;
            
                    const sheetsGroup = (_element.getElementsByClassName(sheetsRadioGroupElementClass).length > 0) ? _element.getElementsByClassName(sheetsRadioGroupElementClass)[0] : null;
                    if(sheetsGroup != null)
                    {
                        result = sheetsGroup;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
            
                _getTableDivElement: function()
                {
                    let result = null;
            
                    const tableDiv = (_element.getElementsByClassName(tableDivElementClass).length > 0) ? _element.getElementsByClassName(tableDivElementClass)[0] : null;
                    if(tableDiv != null)
                    {
                        result = tableDiv;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getTableBodyElement: function()
                {
                    let result = null;
            
                    const tableDiv = this._getTableDivElement();
                    if(tableDiv != null)
                    {
                        const table = (tableDiv.getElementsByTagName(tableElementTag).length > 0) ? tableDiv.getElementsByTagName(tableElementTag)[0] : null;
                        if(table != null)
                        {
                            const tbody = (table.getElementsByTagName(tableBodyElementTag).length > 0) ? table.getElementsByTagName(tableBodyElementTag)[0] : null;
                            if(tbody != null)
                            {
                                result = tbody;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getTableHeadElement: function()
                {
                    let result = null;
            
                    const tableDiv = this._getTableDivElement();
                    if(tableDiv != null)
                    {
                        const table = (tableDiv.getElementsByTagName(tableElementTag).length > 0) ? tableDiv.getElementsByTagName(tableElementTag)[0] : null;
                        if(table != null)
                        {
                            const thead = (table.getElementsByTagName(tableHeadElementTag).length > 0) ? table.getElementsByTagName(tableHeadElementTag)[0] : null;
                            if(thead != null)
                            {
                                result = thead;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
            
                _getTableResultDivElement: function()
                {
                    let result = null;
            
                    const tableResultDiv = (_element.getElementsByClassName(tableResultDivElementClass).length > 0) ? _element.getElementsByClassName(tableResultDivElementClass)[0] : null;
                    if(tableResultDiv != null)
                    {
                        result = tableResultDiv;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getTableResultBodyElement: function()
                {
                    let result = null;
            
                    const tableResultDiv = this._getTableResultDivElement();
                    if(tableResultDiv != null)
                    {
                        const table = (tableResultDiv.getElementsByTagName(tableElementTag).length > 0) ? tableResultDiv.getElementsByTagName(tableElementTag)[0] : null;
                        if(table != null)
                        {
                            const tbody = (table.getElementsByTagName(tableBodyElementTag).length > 0) ? table.getElementsByTagName(tableBodyElementTag)[0] : null;
                            if(tbody != null)
                            {
                                result = tbody;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getTableResultHeadElement: function()
                {
                    let result = null;
            
                    const tableResultDiv = this._getTableResultDivElement();
                    if(tableResultDiv != null)
                    {
                        const table = (tableResultDiv.getElementsByTagName(tableElementTag).length > 0) ? tableResultDiv.getElementsByTagName(tableElementTag)[0] : null;
                        if(table != null)
                        {
                            const thead = (table.getElementsByTagName(tableHeadElementTag).length > 0) ? table.getElementsByTagName(tableHeadElementTag)[0] : null;
                            if(thead != null)
                            {
                                result = thead;
                            }
                            else
                            {
                                throw this._getStringList().elementNotFound;
                            }
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
            
                _getButtonsGroupElement: function()
                {
                    let result = null;
            
                    const formGroup = (_element.getElementsByClassName(buttonsGroupElementClass).length > 0) ? _element.getElementsByClassName(buttonsGroupElementClass)[0] : null;
                    if(formGroup != null)
                    {
                        result = formGroup;
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getDefaultButtonElement: function()
                {
                    let result = null;
            
                    const formGroup = this._getButtonsGroupElement();
                    if(formGroup != null)
                    {
                        const defaultButton = (formGroup.getElementsByClassName(defaultButtonElementClass).length > 0) ? formGroup.getElementsByClassName(defaultButtonElementClass)[0] : null;
                        if(defaultButton != null)
                        {
                            result = defaultButton;
                        }
                        else
                        {
                            throw this._getStringList().elementNotFound;
                        }
                    }
                    else
                    {
                        throw this._getStringList().elementNotFound;
                    }
            
                    return result;
                },
                _getExtraButtonElement: function()
                {
                    let result = null;
            
                    const formGroup = this._getButtonsGroupElement();
                    if(formGroup != null)
                    {
                        const extraButton = (formGroup.getElementsByClassName(extraButtonElementClass).length > 0) ? formGroup.getElementsByClassName(extraButtonElementClass)[0] : null;
                        if(extraButton != null)
                        {
                            result = extraButton;
                        }
                    }
            
                    return result;
                },

                // OTHER FUNCTIONS

                _processFile: function(fileInput, header, afterProcess = null)
                {
                    excelFileInputToJSON(fileInput, (excelSheets) =>
                    {
                        if(excelSheets != null && excelSheets.length > 0)
                        {
                            if(excelSheets[0].conteudo.length > 0)
                            {
                                _sheets = excelSheets;

                                afterProcess(excelSheets);
                            }
                            else
                            {
                                throw this._getStringList().fileWithNoContent;
                            }
                        }
                        else
                        {
                            throw this._getStringList().invalidFile;
                        }
                    },
                    (error) =>
                    {
                        this._onError(error);
                    }, header);
                },

                /** @_showColumnAssociationTable */
                _showColumnAssociationTable: function(hasHeader = true, sheetIndex = 0)
                {
                    // EXAMPLE
            
                    // HEAD
                    /*<tr>
                        <th scope="col">Line</th>
                        <th scope="col">Column</th>
                        <th scope="col">Attribute</th>
                    </tr>*/
            
                    // BODY
                    /*<tr>
                        <th scope="row">1</th>
                        <td class="massimp-column-col">
                            <span>NAME</span>
                        </td>
                        <td class="massimp-attribute-col">
                            <select class="massimp-attribute browser-default">
                                <option value="0" selected></option>
                                <option value="_name">Name</option>
                                <option value="_age">Age</option>
                                <option value="_socialId">Social ID</option>
                                <option value="_phone">Phone</option>
                            </select>
                        </td>
                    </tr>*/
            
                    let tableDiv = this._getTableDivElement();
                    let tableBody = this._getTableBodyElement();
                    let tableHead = this._getTableHeadElement();
                    if(tableDiv != null && tableBody != null && tableHead != null)
                    {
                        this._removeColumnAssociationTable();
            
                        let headRow = document.createElement('tr');
            
                        const indexHeadCol = document.createElement('th');
                        indexHeadCol.setAttribute("scope", "col");
                        indexHeadCol.innerHTML = this._getStringList().line;
                        headRow.appendChild(indexHeadCol);
            
                        if(hasHeader)
                        {
                            const columnHeadCol = document.createElement('th');
                            columnHeadCol.setAttribute("scope", "col");
                            columnHeadCol.innerHTML = this._getStringList().column;
                            headRow.appendChild(columnHeadCol);
                        }
            
                        const attributeHeadCol = document.createElement('th');
                        attributeHeadCol.setAttribute("scope", "col");
                        attributeHeadCol.innerHTML = this._getStringList().attribute;
                        headRow.appendChild(attributeHeadCol);
            
                        tableHead.appendChild(headRow);
            
                        Object.keys(_sheets[sheetIndex].conteudo[0]).forEach(function(key, index)
                        {
                            const th = document.createElement('th');
                            th.setAttribute("scope", (index + 1).toString());
                            th.innerHTML = (index + 1).toString();
            
                            const emptyOption = document.createElement('option');
                            emptyOption.value = "0";
                            emptyOption.setAttribute("selected", true);
            
                            const attributeSelect = document.createElement('select');
                            attributeSelect.classList.add("browser-default");
                            attributeSelect.classList.add("massimp-column");
            
                            attributeSelect.appendChild(emptyOption);
            
                            atributos.forEach(function(atributo, index)
                            {
                                if(atributo.isImage == null || atributo.isImage == false)
                                {
                                    let option = document.createElement('option');
                                    option.value = atributo.valor;
                                    option.innerHTML = atributo.titulo;
            
                                    if(hasHeader && (key == atributo.titulo || key == atributo.valor))
                                    {
                                        option.setAttribute("selected", true);
                                    }
                
                                    attributeSelect.appendChild(option);   
                                }
                                else if(!_showImagesTable)
                                {
                                    _showImagesTable = true;
                                }
                            });
            
                            const attributeCol = document.createElement('td');
                            attributeCol.classList.add("massimp-attribute-col");
                            attributeCol.appendChild(attributeSelect);
            
                            let row = document.createElement('tr');
                            row.appendChild(th);
            
                            if(hasHeader)
                            {
                                const column = document.createElement('span');
                                column.innerHTML = key;
                
                                const columnCol = document.createElement('td');
                                columnCol.classList.add("massimp-column-col");
                                columnCol.appendChild(column);
                            
                                row.appendChild(columnCol);
                            }
            
                            row.appendChild(attributeCol);
            
                            tableBody.appendChild(row);
                        });
            
                        tableDiv.style.display = null;
                    }
                },

                /** @_removeColumnAssociationTable */
                _removeColumnAssociationTable: function()
                {
                    let tableDiv = this._getTableDivElement();
                    let tableBody = this._getTableBodyElement();
                    let tableHead = this._getTableHeadElement();
                    if(tableDiv != null && tableBody != null)
                    {
                        while (tableHead.firstChild)
                        {
                            tableHead.removeChild(tableHead.firstChild);
                        }
                        while (tableBody.firstChild)
                        {
                            tableBody.removeChild(tableBody.firstChild);
                        }
            
                        tableDiv.style.display = "none";
                    }
                },

                _showSheetSelection: function(sheets, onSheetSelect)
                {
                    const radioSheets = this._getSheetsRadioElements();
                    this._removeSheetSelection();

                    radioSheets.appendChild(document.createElement('hr'));
                
                    sheets.forEach((planilha, index) =>
                    {
                        /*
                            <p>
                                <label class="massimp-radio">
                                    <input class="with-gap" id="massimp-sheet-0-0" name="massimp-sheet" value="a" type="radio" checked />
                                    <span>Planilha A</span>
                                </label>
                            </p>
                        */

                        let radPlanilha = document.createElement('input');
                        radPlanilha.setAttribute('type', 'radio');
                        radPlanilha.id = 'massimp-sheet-' + index.toString();
                        radPlanilha.setAttribute('name', 'massimp-sheet');
                        radPlanilha.setAttribute('value', index.toString());
                        radPlanilha.classList.add("with-gap");
                        if(index == 0)
                        {
                            radPlanilha.setAttribute("checked", true);
                        }
                        radPlanilha.onchange = onSheetSelect;
                        
                        let label = document.createElement('span');
                        label.innerHTML = planilha.nome;

                        let radio = document.createElement('label');
                        radio.classList.add("massimp-radio");

                        radio.appendChild(radPlanilha);
                        radio.appendChild(label);

                        let radioRow = document.createElement('p');
                        radioRow.appendChild(radio);
                                    
                        radioSheets.appendChild(radioRow);
                    });

                    radioSheets.style.display = null;
                },

                _removeSheetSelection: function()
                {
                    const radioSheets = this._getSheetsRadioElements();
                    if(radioSheets != null)
                    {
                        while (radioSheets.firstChild)
                        {
                            radioSheets.removeChild(radioSheets.firstChild);
                        }
            
                        radioSheets.style.display = "none";
                    }
                },
            
                /** @_showResultTable
                    * @param {Array} result - Result of process and calculation 
                    */
                _showResultTable: function(result)
                {
                    let tableDiv = this._getTableResultDivElement();
                    let tableBody = this._getTableResultBodyElement();
                    let tableHead = this._getTableResultHeadElement();
                    if(tableDiv != null && tableBody != null && tableHead != null && atributos.length > 0)
                    {
                        this._removeResultTable();
            
                        result.forEach((item, jndex) =>
                        {
                            if(jndex == 0)
                            {
                                let headRow = document.createElement('tr');
            
                                Object.keys(atributos).forEach(function(key, index)
                                {
                                    // HEAD
                                    if(((atributos[key].isImage == null || atributos[key].isImage == false) && item[atributos[key].valor] != null) || atributos[key].isImage == true)
                                    {
                                        const indexHeadCol = document.createElement('th');
                                        indexHeadCol.setAttribute("scope", "col");
                                        indexHeadCol.innerHTML = atributos[key].titulo;
                                        if(atributos[key].isImage == true)
                                        {
                                            indexHeadCol.style.textAlign = "center";
                                        }
                                        headRow.appendChild(indexHeadCol);
                                    }
                                });
            
                                tableHead.appendChild(headRow);
                            }
            
                            // BODY
                            let row = document.createElement('tr');
            
                            let i = 0;
                            Object.keys(atributos).forEach((key, index) =>
                            {
                                if(((atributos[key].isImage == null || atributos[key].isImage == false) && item[atributos[key].valor] != null) || atributos[key].isImage == true)
                                {
                                    const attributeCol = document.createElement('td');
                                    attributeCol.classList.add("massimp-attribute-" + atributos[key].valor);
            
                                    let attributeContent = document.createElement('span');
                                    if(atributos[key].isImage == true)
                                    {
                                        attributeCol.style.textAlign = "center";
                                        
                                        const anchor = document.createElement('a');
                                        anchor.setAttribute("href", "javascript:void(0);");
                                        anchor.classList.add("lightbox");
                                        anchor.id = "lightbox-" + jndex.toString() + "-" + i.toString();
            
                                        const anchorImage = document.createElement('img');
                                        anchorImage.id = "massimp-anchorimg-" + jndex.toString() + "-" + i.toString();
            
                                        const closeImage = document.createElement('span');
                                        closeImage.style.cursor = "pointer";
                                        closeImage.style.color = "white";
                                        closeImage.style.position = "absolute";
                                        closeImage.style.right = "20px";
                                        closeImage.style.top = "20px";
                                        //closeImage.style.fontSize = "xx-large";
                                        closeImage.style.fontSize = "70px";
                                        closeImage.setAttribute("title", this._getStringList().close);
                                        //closeImage.innerHTML = "&#10005;";
                                        //closeImage.innerHTML = "&#10007;";
                                        closeImage.innerHTML = "&#10008;";
                                        closeImage.onclick = function()
                                        {
                                            location.href = "#_";
                                        }                            
            
                                        anchor.appendChild(closeImage);
                                        anchor.appendChild(anchorImage);
            
                                        const attributeImage = document.createElement('img');
                                        attributeImage.id = "massimp-image-" + jndex.toString() + "-" + i.toString();
                                        attributeImage.style.display = "none";
                                        attributeImage.style.objectFit = "contain";
                                        attributeImage.style.width = "65px";
                                        attributeImage.style.cursor = "pointer";
                                        attributeImage.classList.add("responsive-img");
                                        attributeImage.classList.add("massimp-img-thumbnail");
                                        attributeImage.onclick = function()
                                        {
                                            const anchorId = "lightbox" + this.id.substr(13, this.id.length);
            
                                            location.href = "#" + anchorId;
                                        }
            
                                        const attributeInput = document.createElement('input');
                                        const attributeContent = document.createElement('button');
                                        const attributeCleanContent = document.createElement('button');
            
                                        attributeInput.setAttribute("type", "file");
                                        attributeInput.setAttribute("accept", "image/*");
                                        attributeInput.style.display = "none";
                                        attributeInput.id = "massimp-input-" + jndex.toString() + "-" + i.toString();
                                        attributeInput.onchange = (e) =>
                                        {
                                            const anchorimgId = attributeInput.id.substr(0, 8) + "anchorimg" + attributeInput.id.substr(13, attributeInput.id.length);
                                            const anchorimg = document.getElementById(anchorimgId);
            
                                            const imageId = attributeInput.id.substr(0, 8) + "image" + attributeInput.id.substr(13, attributeInput.id.length);
                                            const image = document.getElementById(imageId);
            
                                            const buttonId = attributeInput.id.substr(0, 8) + "button" + attributeInput.id.substr(13, attributeInput.id.length);
                                            const button = document.getElementById(buttonId);
            
                                            const clearButtonId = attributeInput.id.substr(0, 8) + "clear-button" + attributeInput.id.substr(13, attributeInput.id.length);
                                            const clearButton = document.getElementById(clearButtonId);
            
                                            if(attributeInput.files.length > 0)
                                            {
                                                const reader = new FileReader();
                                    
                                                reader.onload = (evt) =>
                                                {
                                                    //button.innerHTML = this.files[0].name;
                                                    button.innerHTML = this._getStringList().change;
                                                    image.setAttribute('src', evt.target.result);
                                                    image.setAttribute('title', attributeInput.files[0].name);
                                                    anchorimg.setAttribute('src', evt.target.result);
                                                }
                                                reader.readAsDataURL(attributeInput.files[0]);
            
                                                image.style.display = null;

                                                clearButton.style.display = null;
                                            }
                                            else
                                            {
                                                button.innerHTML = this._getStringList().open;
                                                image.removeAttribute('src');
                                                image.style.display = "none";

                                                clearButton.style.display = "none";
                                            }
                                        }
            
                                        attributeContent.setAttribute("type", "button");
                                        attributeContent.classList.add("btn");
                                        attributeContent.id = "massimp-button-" + jndex.toString() + "-" + i.toString();
                                        attributeContent.innerHTML = this._getStringList().open;
                                        attributeContent.onclick = function()
                                        {
                                            const inputId = this.id.substr(0, 8) + "input" + this.id.substr(14, this.id.length);
                                            const input = document.getElementById(inputId);
            
                                            input.click();
                                        }
            
                                        attributeCleanContent.setAttribute("type", "button");
                                        attributeCleanContent.setAttribute("title", this._getStringList().remove);
                                        attributeCleanContent.classList.add("btn-flat");
                                        attributeCleanContent.classList.add("red-text");
                                        attributeCleanContent.id = "massimp-clear-button-" + jndex.toString() + "-" + i.toString();
                                        attributeCleanContent.innerHTML = "&#10006;";
                                        attributeCleanContent.style.display = "none";
                                        attributeCleanContent.onclick = () =>
                                        {
                                            const inputId = attributeCleanContent.id.substr(0, 8) + "input" + attributeCleanContent.id.substr(20, attributeCleanContent.id.length);
                                            const input = document.getElementById(inputId);
            
                                            const imageId = attributeCleanContent.id.substr(0, 8) + "image" + attributeCleanContent.id.substr(20, attributeCleanContent.id.length);
                                            const image = document.getElementById(imageId);
            
                                            const buttonId = attributeCleanContent.id.substr(0, 8) + "button" + attributeCleanContent.id.substr(20, attributeCleanContent.id.length);
                                            const button = document.getElementById(buttonId);
            
                                            // REMOVING CHOSEN FILE
                                            const parent = input.parentNode;
                                            
                                            document.tempForm = document.createElement("form");
                                            document.tempForm.appendChild(input);
                                            document.tempForm.reset();

                                            parent.appendChild(document.tempForm.childNodes[0]);
                                            // --------------------

                                            image.removeAttribute("src");
                                            image.style.display = "none";

                                            button.innerHTML = this._getStringList().open;

                                            attributeCleanContent.style.display = "none";
                                        }
            
                                        attributeCol.appendChild(anchor);
                                        attributeCol.appendChild(attributeImage);
                                        attributeCol.appendChild(document.createElement("br"));
                                        attributeCol.appendChild(attributeInput);
                                        attributeCol.appendChild(attributeContent);
                                        attributeCol.appendChild(document.createElement("br"));
                                        attributeCol.appendChild(attributeCleanContent);
                                    }
                                    else
                                    {
                                        attributeContent.innerHTML = item[atributos[key].valor];
                                        attributeCol.appendChild(attributeContent);
                                    }
                            
                                    row.appendChild(attributeCol);
            
                                    i++;
                                }
                            });
            
                            tableBody.appendChild(row);
                        });
            
                        tableDiv.style.display = null;

                        _showImagesTable = false;
                    }
                },

                /** @_removeResultTable */
                _removeResultTable: function()
                {
                    let tableDiv = this._getTableResultDivElement();
                    let tableBody = this._getTableResultBodyElement();
                    let tableHead = this._getTableResultHeadElement();
                    if(tableDiv != null && tableBody != null)
                    {
                        while (tableHead.firstChild)
                        {
                            tableHead.removeChild(tableHead.firstChild);
                        }
                        while (tableBody.firstChild)
                        {
                            tableBody.removeChild(tableBody.firstChild);
                        }
            
                        tableDiv.style.display = "none";
                    }
                },

                _processImages: function(ending = null)
                {
                    this._process(false, (result) =>
                    {
                        let tableResultBody = this._getTableResultBodyElement();
                        if(tableResultBody != null)
                        {
                            result.forEach((item, index) =>
                            {
                                const row = tableResultBody.childNodes[index];
    
                                row.querySelectorAll("td").forEach(function(col, colIndex)
                                {
                                    // GETTING IMAGE ATTRIBUTE NAMES
                                    const newClassList = Array.from(col.classList).filter(function(class_, classIndex)
                                    {
                                        let ok = true;
                                        Object.keys(item).forEach(function(key, index)
                                        {
                                            if(class_.substr(18, class_.length) == key)
                                            {
                                                ok = false;
    
                                                return false;
                                            }
                                        });
    
                                        return ok;
                                    });
                                    
                                    // SETTINGS IMAGE ATTRIBUTES
                                    newClassList.forEach(function(class_, index)
                                    {
                                        const input = row.getElementsByClassName(class_)[0].getElementsByTagName('input')[0];
    
                                        if(input != null && input.files.length > 0)
                                        {
                                            item[class_.substr(18, class_.length)] = input.files[0];
                                        }
                                        else
                                        {
                                            item[class_.substr(18, class_.length)] = null;
                                        }
                                    })
                                });
                            });
                        }

                        // VALIDATING ALL ATTRIBUTES
                        let ok = false;
                        result.forEach(function(obj, index)
                        {
                            Object.keys(obj).forEach(function(key, index)
                            {
                                if(obj[key] != null)
                                {
                                    ok = true;
    
                                    return false;
                                }
                            });

                            if(ok)
                            {
                                return false;
                            }
                        });                 

                        if(ok && ending != null && typeof ending === "function")
                        {
                            _showImagesTable = true;
    
                            this._removeResultTable();

                            ending(result);
                        }
                        else if(!ok)
                        {
                            throw this._getStringList().noDataProcessed;
                        }
                    })
                },

                _process: function(validate = true, ending = null)
                {
                    let inputFile = this._getInputFileElement();
                    if(inputFile != null && inputFile.files.length > 0)
                    {
                        let result = [];

                        let ok = false;
                        if(!validate)
                        {
                            ok = true;
                        }

                        let tableBody = this._getTableBodyElement();
                        if(tableBody != null)
                        {
                            // RENAME ALL XLSX RESULT OBJECT ATTRIBUTES
                            let array_FromTo = [];
                            NodeList.prototype.forEach = Array.prototype.forEach;
                            const rows = tableBody.childNodes;
                            rows.forEach(function(row, index)
                            {
                                const atributo = row.getElementsByClassName('massimp-attribute-col')[0].getElementsByTagName('select')[0].value;
                                if(atributo != 0)
                                {
                                    if(!ok)
                                    {
                                        ok = true;
                                    }

                                    let from_to = { "from": index, "to": atributo };
                                    if(_header)
                                    {
                                        const colunaExcel = row.getElementsByClassName("massimp-column-col")[0].getElementsByTagName('span')[0].innerHTML;
                    
                                        from_to = { "from": colunaExcel, "to": atributo };
                                    }
                                    
                                    array_FromTo.push(from_to);
                                }
                            });

                            if(ok)
                            {
                                _sheets[_sheetIndex].conteudo.forEach((item, index) =>
                                {
                                    let new_item = renameObjectKeys(item, array_FromTo);
                
                                    // REMOVE UNSET ATTRIBUTES FROM XLSX RESULT OBJECT
                                    Object.keys(new_item).forEach(function(key, index)
                                    {
                                        if(!array_FromTo.find(from_to => { return from_to.to == key }))
                                        {
                                            delete new_item[key];
                                        }
                                    });
                
                                    // ADDING UNSET ATTRIBUTES WITH NULL VALUE
                                    atributos.forEach(function(attr, index)
                                    {                        
                                        if(attr.valor != null && new_item[attr.valor] == null && (attr.isImage == null || attr.isImage == false))
                                        {
                                            new_item[attr.valor] = null;
                                        }
                                    });
                
                                    result.push(new_item);
                                });
                            }
                        }

                        if(ok && ending != null && typeof ending === "function")
                        {
                            ending(result);
                        }
                        else if(!ok)
                        {
                            throw this._getStringList().noAttributeAssociated;
                        }
                    }
                    else
                    {
                        throw this._getStringList().noFileSet;
                    }
                },

                // ERROR TREATMENT
                _onError: function(error)
                {
                    if(this.options != null && this.options.onError != null && typeof this.options.onError === "function")
                    {
                        this.options.onError(error);
                    }
                    else
                    {
                        console.error(error);
                    }
                },
            });

            try
            {
                // ===== MASSIMP START =====
                privateProps.get(this)._loadHTML();

                // LANGUAGE
                if(_options != null && _options.language != null && typeof _options.language === "string")
                {
                    if(Object.keys(_languages).includes(_options.language.toLowerCase()))
                    {
                        _selectedLanguage = _options.language;
                    }
                    else
                    {
                        // Send the unsupported language error to user then keep going
                        privateProps.get(this)._onError(privateProps.get(this)._getStringList().languageNotSupported);

                        // TODO Uncomment if you want to interrupt the code because of this unsupported language set by user
                        //throw privateProps.get(this)._getStringList().languageNotSupported;
                    }
                }

                // ATRIBUTTES
                if(_options != null && _options.attributes != null && typeof _options.attributes === "object")
                {
                    Object.keys(_options.attributes).forEach(function(key, index)
                    {          
                        let useIndex = true;
                        if(typeof parseInt(key) === "NaN")
                        {
                            useIndex = false;
                        }

                        let newAttribute = { valor: "", titulo: "", isImage: false };
                        if(_options.attributes[((useIndex) ? index : key)].valor != null)
                        {
                            newAttribute.valor = _options.attributes[((useIndex) ? index : key)].valor;
                        }
                        if(_options.attributes[((useIndex) ? index : key)].titulo != null)
                        {
                            newAttribute.titulo = _options.attributes[((useIndex) ? index : key)].titulo;
                        }
                        if(_options.attributes[((useIndex) ? index : key)].isImage != null)
                        {
                            newAttribute.isImage = _options.attributes[((useIndex) ? index : key)].isImage;
                        }

                        atributos.push(newAttribute);
                    });

                    // TODO Change the code below if Massimp should send an error instead of deleting the twin attribute
                    let attr2Exclude = [];
                    for(let index = 0; index < atributos.length; index++)
                    {
                        const allOcorrencies = getAllIndexes(atributos, atributos[index].valor, "valor");
                        if(allOcorrencies.length > 1)
                        {
                            allOcorrencies.forEach(function(ocorrency, i)
                            {
                                if(i > 0)
                                {
                                    if(!attr2Exclude.includes(ocorrency))
                                    {
                                        attr2Exclude.push(ocorrency);
                                    }
                                }
                            });
                        }
                    }

                    attr2Exclude.forEach(function(attrIndex, index)
                    {
                        delete atributos[attrIndex];
                    });
                    // -------------------------------------------------------------------------------------------------
                }

                // INPUT FILE
                const clearInputFile = (inputFile) =>
                {
                    try
                    {
                        // REMOVING CHOSEN FILE
                        const parent = inputFile.parentNode;
                        
                        document.tempForm = document.createElement("form");
                        document.tempForm.appendChild(inputFile);
                        document.tempForm.reset();

                        parent.appendChild(document.tempForm.childNodes[0]);
                        // --------------------

                        // REMOVING COLUMN ASSOCIATION TABLE AND RESULT (IMAGE ASSOCIATION) TABLE
                        privateProps.get(this)._removeResultTable();
                        privateProps.get(this)._removeColumnAssociationTable();
                        
                        // INDICATING THAT A FILE WAS UNSET
                        const inputFileInsideText = privateProps.get(this)._getInputFileInsideTextElement();
                        if(inputFile != null)
                        {
                            inputFileInsideText.removeAttribute("readonly");
                            inputFileInsideText.classList.remove("valid");
                            inputFileInsideText.classList.remove("invalid");

                            inputFileInsideText.value = null;
                        }

                        // HIDING THE CLEAR FILE BUTTON
                        const clearButtonGroup = privateProps.get(this)._getClearInputFileGroupElement();
                        clearButtonGroup.style.display = "none";

                        // HIDING THE SHEET SELECTION
                        const radioSheets = privateProps.get(this)._getSheetsRadioElements();
                        radioSheets.style.display = "none";

                        // ENABLING 'HAS HEADER' RADIOS
                        const radios = privateProps.get(this)._getRadioElements();
                        radios.forEach(function(radio, index)
                        {
                            radio.removeAttribute("disabled");
                        });

                        // HIDING DEFAULT BUTTON
                        const defaultButton = privateProps.get(this)._getDefaultButtonElement();
                        defaultButton.style.display = "none";

                        const radioHasHeader = privateProps.get(this)._getRadioHasHeaderElement();
                        const hasHeader = JSON.parse(radioHasHeader.value);
                        
                        // DEFAULTING THE "GLOBAL" VARIABLES
                        _sheets = null;
                        _sheetIndex = 0;
                        _header = hasHeader;
                        _showImagesTable = false;
                        _imagesProcessed = true;
                    }
                    catch(ex)
                    {
                        privateProps.get(this)._onError(ex);
                    }
                }

                let inputFileText = privateProps.get(this)._getStringList().list;
                if(privateProps.get(this).options != null && privateProps.get(this).options.inputFileText != null && typeof privateProps.get(this).options.inputFileText === "string")
                {
                    inputFileText = privateProps.get(this).options.inputFileText;
                }
                
                let inputFileInsideText = privateProps.get(this)._getStringList().fileChoose;
                if(_options != null && _options.inputFileInsideText != null && typeof _options.inputFileInsideText === "string")
                {
                    inputFileInsideText = _options.inputFileInsideText;
                }

                const customFileInput = privateProps.get(this)._getInputFileElement();
                customFileInput.onchange = () =>
                {
                    try
                    {
                        // IF A FILE WAS SET
                        if(customFileInput.files[0] != null)
                        {
                            // REMOVE COLUMN ASSOCIATION TABLE AND RESULT (IMAGE ASSOCIATION) TABLE FROM PREVIOUS FILES
                            privateProps.get(this)._removeColumnAssociationTable();
                            privateProps.get(this)._removeResultTable();

                            // INDICATES THAT A FILE WAS SET
                            const inputFileInsideText = privateProps.get(this)._getInputFileInsideTextElement();
                            inputFileInsideText.setAttribute("readonly", true);
                            inputFileInsideText.classList.remove("invalid");
                            inputFileInsideText.classList.add("valid");

                            inputFileInsideText.value = customFileInput.files[0].name;
                            
                            // SHOW CLEAR FILE BUTTON
                            const clearButtonGroup = privateProps.get(this)._getClearInputFileGroupElement();
                            clearButtonGroup.style.display = null;
                
                            const radioHasHeader = privateProps.get(this)._getRadioHasHeaderElement();
                            const hasHeader = JSON.parse(radioHasHeader.value);

                            // PROCESS FILE AND AFTER THAT vv
                            privateProps.get(this)._processFile(customFileInput, hasHeader, (excelSheets) =>
                            {
                                privateProps.get(this)._showColumnAssociationTable(hasHeader, 0);
                                        
                                let maxVerticalRowsToDisplay = 5;
                                if(_options != null && _options.maxVerticalRowsToDisplay != null && typeof _options.maxVerticalRowsToDisplay === "number")
                                {
                                    maxVerticalRowsToDisplay = _options.maxVerticalRowsToDisplay;
                                }

                                this.setMaxVerticalRowsToDisplay(maxVerticalRowsToDisplay);

                                if(excelSheets.length > 1)
                                {
                                    // SHOW SHEET SELECTION AND WHAT TO DO WHEN SHEET IS SELECTED
                                    privateProps.get(this)._showSheetSelection(excelSheets, () =>
                                    {
                                        _sheetIndex = parseInt(radPlanilha.value); // Change "global" sheetIndex variable

                                        privateProps.get(this)._showColumnAssociationTable(hasHeader, sheetIndex);
                                        
                                        let maxVerticalRowsToDisplay = 5;
                                        if(_options != null && _options.maxVerticalRowsToDisplay != null && typeof _options.maxVerticalRowsToDisplay === "number")
                                        {
                                            maxVerticalRowsToDisplay = _options.maxVerticalRowsToDisplay;
                                        }

                                        this.setMaxVerticalRowsToDisplay(maxVerticalRowsToDisplay);
                                    });
                                }
        
                                // DISABLE 'HAS HEADER' RADIOS
                                const radios = privateProps.get(this)._getRadioElements();
                                radios.forEach(function(radio, index)
                                {
                                    radio.setAttribute("disabled", true);
                                });
            
                                // SHOW DEFAULT BUTTON
                                const defaultButton = privateProps.get(this)._getDefaultButtonElement();
                                defaultButton.style.display = null;
                            });

                            // DEFAULTING THE "GLOBAL" VARIABLES
                            _sheets = null;
                            _sheetIndex = 0;
                            _header = hasHeader;
                            _showImagesTable = false;
                            _imagesProcessed = true;
                        }
                        // IF NO FILE WAS SET
                        else
                        {
                            clearInputFile(customFileInput);
                        }
                    }
                    catch(ex)
                    {
                        privateProps.get(this)._onError(ex);
                    }
                }

                const clearInputTextButton = privateProps.get(this)._getClearInputFileElement();
                clearInputTextButton.onclick = () =>
                {
                    try
                    {
                        const customFileInput = privateProps.get(this)._getInputFileElement();
                        clearInputFile(customFileInput);
                    }
                    catch(ex)
                    {
                        privateProps.get(this)._onError(ex);
                    }
                }

                this.setInputFileInsideText(inputFileInsideText);
                this.setInputFileText(inputFileText);

                // TABLE
                let maxVerticalRowsToDisplay = 5;
                if(_options != null && _options.maxVerticalRowsToDisplay != null && typeof _options.maxVerticalRowsToDisplay === "number")
                {
                    maxVerticalRowsToDisplay = _options.maxVerticalRowsToDisplay;
                }

                this.setMaxVerticalRowsToDisplay(maxVerticalRowsToDisplay);

                // DEFAULT BUTTON
                let colorButtonClass = "blue";
                if(_options != null && _options.colorButtonClass != null && typeof _options.colorButtonClass === "string")
                {
                    colorButtonClass = _options.colorButtonClass;
                }

                let buttonText = privateProps.get(this)._getStringList().defaultButtonText;
                if(_options != null && _options.buttonText != null && typeof _options.buttonText === "string")
                {
                    buttonText = _options.buttonText;
                }

                let _onButtonClicked = () =>
                {
                    try
                    {
                        if(_showImagesTable)
                        {
                            privateProps.get(this)._process(false, (result) =>
                            {
                                privateProps.get(this)._showResultTable(result);

                                _imagesProcessed = false;
                            });
                        }
                        else
                        {
                            if(_imagesProcessed)
                            {
                                privateProps.get(this)._process(true, null);
                            }
                            else
                            {
                                privateProps.get(this)._processImages(null);
                            }
                        }
                    }
                    catch(ex)
                    {
                        privateProps.get(this)._onError(ex);
                    }
                }
                if(_options != null && _options.onButtonClicked != null && typeof _options.onButtonClicked === "function")
                {
                    _onButtonClicked = () =>
                    {
                        try
                        {
                            if(_showImagesTable)
                            {
                                privateProps.get(this)._process(false, (result) =>
                                {
                                    privateProps.get(this)._showResultTable(result);

                                    _imagesProcessed = false;
                                });
                            }
                            else
                            {
                                if(_imagesProcessed)
                                {
                                    privateProps.get(this)._process(true, _options.onButtonClicked);
                                }
                                else
                                {
                                    privateProps.get(this)._processImages(_options.onButtonClicked);
                                }
                            }
                        }
                        catch(ex)
                        {
                            privateProps.get(this)._onError(ex);
                        }
                    }
                }

                this.setColorButtonClass(colorButtonClass);
                this.setButtonText(buttonText);
                const defaultButton = privateProps.get(this)._getDefaultButtonElement();
                defaultButton.onclick = _onButtonClicked;
                defaultButton.style.display = "none";

                // EXTRA BUTTON
                let showExtraButton = false;
                if(_options != null && _options.showExtraButton != null && typeof _options.showExtraButton === "boolean")
                {
                    showExtraButton = _options.showExtraButton;
                }

                this.setShowExtraButton(showExtraButton);
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        // ===== PUBLIC FUNCTIONS =====

        // INPUT FILE
        setInputFileText(inputFileText = privateProps.get(this)._getStringList().list)
        {
            try
            {
                const inputGroupText = privateProps.get(this)._getInputFileTextElement();
                if(inputFileText != null && typeof inputFileText === "string" && inputFileText.length > 0)
                {
                    inputGroupText.innerHTML = inputFileText;
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        setInputFileInsideText(inputFileInsideText = privateProps.get(this)._getStringList().fileChoose)
        {
            try
            {
                const customFileLabel = privateProps.get(this)._getInputFileInsideTextElement();
                if(inputFileInsideText != null)
                {
                    customFileLabel.placeHolder = inputFileInsideText;
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        // TABLE
        setMaxVerticalRowsToDisplay(maxVerticalRowsToDisplay = 5, checkNumberOfRows = false)
        {
            try
            {
                let maxHeight = 446;    // DEFAULT ROWS TO DISPLAY (5 ROWS) - 75px PER ROW AFTER FIRST | 127px FOR FIRST ROW | +19px AT THE END

                if(maxVerticalRowsToDisplay != null && typeof maxVerticalRowsToDisplay === "number")
                {
                    const tbody = privateProps.get(this)._getTableBodyElement();
                    const numberOfRows = tbody.getElementsByTagName("tr").length;
                    if(checkNumberOfRows && maxVerticalRowsToDisplay >= numberOfRows)
                    {
                        maxHeight = 127 + ((numberOfRows - 1) * 75);
                    }
                    else
                    {
                        maxHeight = 127 + ((maxVerticalRowsToDisplay - 1) * 75);
                    }
                }
                                    
                const tableDiv = privateProps.get(this)._getTableDivElement();
                tableDiv.style.maxHeight = maxHeight.toString() + "px";
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        getNumberOfObjects()
        {
            let result = 0.
            try
            {
                if(_sheets != null)
                {
                    result = _sheets[_sheetIndex].conteudo.length;
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }

            return result;
        }

        // DEFAULT BUTTON
        setColorButtonClass(colorButtonClass = "blue")
        {
            try
            {
                const okButton = privateProps.get(this)._getDefaultButtonElement();
                if(colorButtonClass != null && typeof colorButtonClass === "string" && colorButtonClass.length > 0)
                {
                    okButton.removeAttribute("class");
                    okButton.classList.add("btn");
                    okButton.classList.add("waves-effect");
                    okButton.classList.add("waves-light");
                    okButton.classList.add(defaultButtonElementClass);
                    okButton.classList.add(colorButtonClass);
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        setButtonText(buttonText = privateProps.get(this)._getStringList().defaultButtonText)
        {
            try
            {
                const okButton = privateProps.get(this)._getDefaultButtonElement();
                if(buttonText != null && typeof buttonText === "string" && buttonText.length > 0)
                {
                    okButton.innerHTML = buttonText;
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        // EXTRA BUTTON
        setColorExtraButtonClass(colorExtraButtonClass = "red")
        {
            try
            {
                const extraButton = privateProps.get(this)._getExtraButtonElement();
                if(colorExtraButtonClass != null && typeof colorExtraButtonClass === "string" && colorExtraButtonClass.length > 0)
                {
                    extraButton.removeAttribute("class");
                    extraButton.classList.add("btn");
                    extraButton.classList.add("waves-effect");
                    extraButton.classList.add("waves-light");
                    extraButton.classList.add(extraButtonElementClass);
                    extraButton.classList.add(colorExtraButtonClass);
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        setExtraButtonText(extraButtonText = privateProps.get(this)._getStringList().extraButtonText)
        {
            try
            {
                const extraButton = privateProps.get(this)._getExtraButtonElement();
                if(extraButtonText != null && typeof extraButtonText === "string" && extraButtonText.length > 0)
                {
                    extraButton.innerHTML = extraButtonText;
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        setShowExtraButton(showExtraButton = false)
        {
            try
            {
                const formGroup = privateProps.get(this)._getButtonsGroupElement();
                const extraButton = privateProps.get(this)._getExtraButtonElement();
                if(extraButton != null)
                {
                    formGroup.removeChild(extraButton);
    
                    if(showExtraButton)
                    {
                        const extraButton = document.createElement("button");
                        extraButton.setAttribute("type", "button");
                        extraButton.classList.add("btn");
                        extraButton.classList.add("red");
                        extraButton.classList.add("waves-effect");
                        extraButton.classList.add("waves-light");
                        extraButton.classList.add(extraButtonElementClass);
                        extraButton.innerHTML = privateProps.get(this)._getStringList().extraButtonText;
    
                        formGroup.appendChild(extraButton);
    
                        let colorExtraButtonClass = "red";
                        if(privateProps.get(this).options != null && privateProps.get(this).options.colorExtraButtonClass != null && typeof privateProps.get(this).options.colorExtraButtonClass === "string")
                        {
                            colorExtraButtonClass = privateProps.get(this).options.colorExtraButtonClass;
                        }
                        let extraButtonText = privateProps.get(this)._getStringList().extraButtonText;
                        if(privateProps.get(this).options != null && privateProps.get(this).options.extraButtonText != null && typeof privateProps.get(this).options.extraButtonText === "string")
                        {
                            extraButtonText = privateProps.get(this).options.extraButtonText;
                        }
    
                        let _onExtraButtonClicked = null;
                        if(privateProps.get(this).options != null && privateProps.get(this).options.onExtraButtonClicked != null && typeof privateProps.get(this).options.onExtraButtonClicked === "function")
                        {
                            _onExtraButtonClicked = privateProps.get(this).options.onExtraButtonClicked;
                        }
    
                        privateProps.get(this)._setColorExtraButtonClass(colorExtraButtonClass);
                        privateProps.get(this)._setExtraButtonText(extraButtonText);
                        extraButton.onclick = _onExtraButtonClicked;
                    }
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }

        processMassiveImport(ending = null)
        {
            try
            {
                if(_showImagesTable)
                {
                    privateProps.get(this)._process(false, (result) =>
                    {
                        privateProps.get(this)._showResultTable(result);

                        _imagesProcessed = false;
                    });
                }
                else
                {
                    if(_imagesProcessed)
                    {
                        privateProps.get(this)._process(true, ending);
                    }
                    else
                    {
                        privateProps.get(this)._processImages(ending);
                    }
                }
            }
            catch(ex)
            {
                privateProps.get(this)._onError(ex);
            }
        }
    }

    return Massimp;
})();

/** baseMainFunction
 * @param {Object} option - OPTIONS
 * @param {String} method - METHOD
 * @param argument1 - ARGUMENT A
 * @param argument2 - ARGUMENT B
 * @param argument3 - ARGUMENT C
 */
const massimpMainFunction = function(optionsOrMethod = {}, argument1 = null, argument2 = null, argument3 = null)
{
    let isUsingJquery = false;

    thisElement = this;
    if(this[0] != null)
    {
        thisElement = this[0];
        isUsingJquery = true;
    }
    
    // OPTIONS TREATMENT
    if(typeof optionsOrMethod === "object")
    {
        if(thisElement._massimp == null)
        {
            thisElement._massimp = new Massimp(thisElement, optionsOrMethod);
        }
    }

    // METHODS AND EVENTS TREATMENT (jQuery Only)
    else if(isUsingJquery && typeof optionsOrMethod === "string" && thisElement._massimp != null)
    {
        // METHODS
        if(optionsOrMethod == "setInputFileText")
        {
            thisElement._massimp.setInputFileText(argument1);
        }
        else if(optionsOrMethod == "setInputFileInsideText")
        {
            thisElement._massimp.setInputFileInsideText(argument1);
        }
        else if(optionsOrMethod == "setMaxVerticalRowsToDisplay")
        {
            thisElement._massimp.setMaxVerticalRowsToDisplay(argument1);
        }
        else if(optionsOrMethod == "getNumberOfObjects")
        {
            return thisElement._massimp.getNumberOfObjects();
        }
        else if(optionsOrMethod == "setColorButtonClass")
        {
            thisElement._massimp.setColorButtonClass(argument1);
        }
        else if(optionsOrMethod == "setButtonText")
        {
            thisElement._massimp.setButtonText(argument1);
        }
        else if(optionsOrMethod == "setColorExtraButtonClass")
        {
            thisElement._massimp.setColorExtraButtonClass(argument1);
        }
        else if(optionsOrMethod == "setExtraButtonText")
        {
            thisElement._massimp.setExtraButtonText(argument1);
        }
        else if(optionsOrMethod == "setShowExtraButton")
        {
            thisElement._massimp.setShowExtraButton(argument1);
        }

        // METHODS W/ EVENT RELATED
        else if(optionsOrMethod == "processMassiveImport")
        {
            thisElement._massimp.processMassiveImport(function(result)
            {
                $(thisElement).trigger("after.mp.process", [ result ] );
            });
        }
        else
        {
            console.error("Massimp error: Method not found");
        }
    }
    else
    {
        console.error("Massimp error: Invalid initialization");
    }
};

if(window.jQuery != null)
{
    $.fn.massimp = massimpMainFunction;
}

HTMLElement.prototype.massimp = massimpMainFunction;