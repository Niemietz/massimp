# Massimp v0.1 (para Materialize)
Um componente HTML para tratamento e processamento de dados massivos

Escrito em **JavaScript (ES6)**

Criado por **Renan Niemietz Cardoso**

Leia isto em outros idiomas: *[English](https://github.com/Niemietz/massimp/blob/master/README.md)*.

## Descrição

O Massimp gera um elemento de entrada de arquivo **(\<input\> do tipo "file")** e outros componentes, como botões e tabelas, para permitir que os usuários simplesmente escolham um arquivo de planilha, relacionem cada coluna com sua propriedade de objeto correspondente e finalmente gerem um objeto javascript com o qual trabalhar. O Massimp simplifica a maneira como os usuários lidam com uma grande quantidade de dados quando precisam ser registrados no banco de dados ou qualquer outra coisa.

## Dependências

Antes de declarar o **massimp.min.js**, tenha certeza que o **[Materialize CSS v0.100.0](https://github.com/Dogfalo/materialize/tree/v0.100.0)**, **massimp.min.css** e **[XLSX v0.14.0](https://github.com/SheetJS/js-xlsx/tree/v0.14.0)** foram declarados previamente em seu HTML, como no exemplo a seguir:
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

## Utilização

1. Crie um elemento **\<div\>** com uma *class* chamada **massimp-container**, dentro de seu arquivo HTML

2. Depois que o documento for carregado, incialize o elemento Massimp fazendo o seguinte:

**jQuery:**
```javascript
$(".massimp-container").massimp( [OPTIONS] );
```
   * ex.:
```javascript
$(".massimp-container").massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   **Javascript (ES6) puro:**
```javascript
getElementsByClassName("massimp-container")[0].massimp( [OPTIONS] );
```
   * ex.:
```javascript
getElementsByClassName("massimp-container")[0].massimp({
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```
   ou
```javascript
new Massimp(".massimp-container", [OPTIONS] );
```
   * ex.:
```javascript
new Massimp(".massimp-container", {
    showInputFileText: false,
    maxVerticalRowsToDisplay: 3,
    buttonText: "Make it happen!"
});
```

## Opções

Opção | Padrão | Descrição | Tipo
--- | --- | --- | ---
language | Idioma do navegador ou "en-US" se o idioma do navegador não for suportado | Idioma do componente (Somente "pt-BR" e "en-US" estão disponíveis por enquanto) | string
attributes | [ ] | Atributos para se associar as colunas do arquivo de dados massivo | array
inputFileText | "List" | Texto ao lado do input de arquivo | string
inputFileInsideText | "Choose a file" | Texto dentro do input de arquivo | string
maxVerticalRowsToDisplay | 5 | Numero de linhas visíveis verticalmente | number
colorButtonClass | "blue" | *Class* do botão principal | string
buttonText | "Do it!" | Texto do botão principal | string
onButtonClicked | null | Ação após o botão principal ter sido clicado (Acionado após o procedimente) | function
showExtraButton | false | Exibe or esconde o butão extra (Botão sem ação prévia) | boolean
colorExtraButtonClass | "red" | *Class* do botão extra | string
extraButtonText | "Cancel" | Texto do botão extra | string
onExtraButtonClicked | null | Ação após botão extra ter sido clicado | function
onError | function(error) { console.error(error) } | Ação após ocorrer um erro | function

## Métodos

Método | Descrição | Tipo de Parêmetro | Tipo de Retorno
--- | --- | --- | ---
setInputFileText | Altera o texto ao lado do input de arquivo | string | void
setInputFileInsideText | Altera o texto dentro do input de arquivo | string | void
setMaxVerticalRowsToDisplay | Altera o número de linhas visíveis verticalmente | number | void
getNumberOfObjects | Busca o número de linhas da planilha |  | number
setColorButtonClass | Altera a *class* do botão principal | string | void
setButtonText | Altera o texto do botão principal | string | void
setShowExtraButton | Exibe ou esconde o botão extra (Botão sem ação prévia) | boolean | void
setColorExtraButtonClass | Altera a *class* do botão extra | string | void
setExtraButtonText | Altera o texto do botão extra | string | void
processMassiveImport | Processa os dados masivos | function | void

   * exemplo em jQuery:
```javascript
$(".massimp-container").massimp("setInputFileInsideText", "Arquivo .xls, .xlsx ou .csv ...");
```
   * exemplo em Javascript (ES6) puro:
```javascript
getElementsByClassName("massimp-container")[0]._massimp.setInputFileInsideText("Arquivo .xls, .xlsx ou .csv ...");
```

## Eventos (Somente jQuery)

Evento | Descrição
--- | ---
after.mp.process | Este evento é disparado quando o procedimento for finalizado

   * ex.:
```javascript
$(".massimp-container").on("after.mp.process", function(e, result)
{
   console.warn("Dados Massivos Procesados", result);

   let alertText = "Dados Massivos Procesados:";
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

## Suporte

Se você tiver alguma dúvida quanto ao uso do Massimp, entre em contato comigo através do seguinte endereço de e-mail:

**[renan_ncs@msn.com](mailto:renan_ncs@msn.com)**