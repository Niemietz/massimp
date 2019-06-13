document.addEventListener("DOMContentLoaded", function(event)
{
    const massimpOptions = {
        attributes: [
            {
                valor: "name",
                titulo: "Name",
                isImage: false
            },
            {
                valor: "age",
                titulo: "Age",
                isImage: null
            },
            {
                valor: "phone",
                titulo: "Phone",
                isImage: false
            },
            {
                valor: "photo",
                titulo: "Profile Photo",
                isImage: true
            },
        ],
        onButtonClicked: function(result)
        {
            console.warn("Button clicked!", result);

            let alertText = "Processed Massive Data:";
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
        },
        onError: function(error)
        {
            if(error != null)
            {
                if(typeof error === "string" && error.length > 0)
                {
                    alert(error);
                }
                else if(error.message != null && error.length > 0)
                {
                    alert(error.message);
                }
    
                console.error(error);
            }
            else
            {
                alert("Erro desconhecido!");
                console.error("Erro desconhecido!");
            }
        },
        language: "en-US",
    };

    $(".massimp-container").on("after.mp.process", function(e, result)
    {
        console.warn("Processed Massive Data", result);

        let alertText = "Processed Massive Data:";
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

    $(".massimp-container").massimp(massimpOptions);
});