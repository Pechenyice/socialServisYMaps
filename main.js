const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const csv = require("csvtojson");
const axios = require('axios');

const app = express();
app.use(express.static(__dirname + "/public"));
const urlencodedParser = bodyParser.urlencoded({extended: false});

main();

async function main() {
    const converter = csv({
    delimiter: ";",
    });

    let data = await converter.fromFile("top_csv.csv");
    
    //запрос на координаты точек
    for (var elem in data) {
        let response = await axios.get(
            "https://geocode-maps.yandex.ru/1.x"
            + "?geocode=" + encodeURI(data[elem]['Адрес места нахождения поставщика социальных услуг'])
            + "&apikey=" + encodeURI("00107961-9380-4b22-b49f-970fdb90c2af")
            + "&format=" + "json"
        );
        
        data[elem]['Координаты'] = response.data.response.GeoObjectCollection.featureMember[0].GeoObject.Point;

            // запрос на районы, соответствующие точкам
        response = await axios.get(
            "https://geocode-maps.yandex.ru/1.x"
            + "?geocode=" + encodeURI(data[elem]['Координаты']['pos'])
            + "&apikey=" + encodeURI("00107961-9380-4b22-b49f-970fdb90c2af")
            + "&format=" + "json"
            + "&kind=" + "district"
            );
            
            if (response.data.response.GeoObjectCollection.featureMember.length != 0)
            {
            let address_components = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
            address_components = address_components.metaDataProperty.GeocoderMetaData.Address.Components;

            data[elem]['Район'] = null;

            for (comp of address_components)
            {
            if (comp.kind != "area") continue;

            data[elem]['Район'] = comp.name;
            break;
            }

            if (data[elem]['Район'] == null)
            {
            if (address_components[address_components.length - 2].kind == "district")
            data[elem]['Район'] = address_components[address_components.length - 2].name;
            else
            data[elem]['Район'] = address_components[address_components.length - 1].name;
            }
            } else
            {
            data[elem]['Район'] = "Другие";
            }
    }
    fs.writeFileSync("test1234.json", JSON.stringify(data));
    
}
//маршрутизация
app.get("/", urlencodedParser, function (request, response) {
    response.sendFile(__dirname + "/public/index.htm");
});

app.post("/mapPoints", urlencodedParser, (req, res) => {
    res.sendFile(__dirname +'/test1234.json');
});
  
app.listen(3000);
console.log(':3000');