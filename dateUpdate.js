const fs = require('fs');
// const express = require("express");
const bodyParser = require("body-parser");
const csv = require("csvtojson");
const axios = require('axios');
axios.defaults.timeout = 100000;

// const app = express();
// app.use(express.static(__dirname + "/public"));
const urlencodedParser = bodyParser.urlencoded({extended: false});

main();

async function main() {
    const converter = csv({
    delimiter: ";"
    });

    let data = await converter.fromFile("adov_dataset.csv");
    let response;
    //запрос на координаты точек
    for (var elem in data) {
        try {
            response = await axios.get(
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
        } catch (e) {
            console.log("error: " + e);
        }
            
            if (response.data.response.GeoObjectCollection.featureMember.length != 0) {
                let address_components = response.data.response.GeoObjectCollection.featureMember[0].GeoObject;
                address_components = address_components.metaDataProperty.GeocoderMetaData.Address.Components;
                data[elem]['Район'] = null;
                for (comp of address_components) {
                    if (comp.kind != "area") continue;
                    data[elem]['Район'] = comp.name;
                    break;
                }

                if (data[elem]['Район'] == null) {
                    if (address_components[address_components.length - 2].kind == "district") data[elem]['Район'] = address_components[address_components.length - 2].name; else data[elem]['Район'] = address_components[address_components.length - 1].name;
                }
            } else {
                data[elem]['Район'] = "Некоммерческие организации";
            }

            // var url = data[elem]['Контактная информация поставщика социальных услуг (телефоны, адрес электронной почты...)'].split(',');
            // url = url[url.length-1];
            // data[elem]['url'] = url;
            console.log(elem + '/' + data.length + '\n');
    }

    var accumulator = "категория;Поисковые слова;Категория поисковых слов;Наименование поставщика социальных услуг;Адрес места нахождения поставщика социальных услуг;Описание;Контактная информация поставщика социальных услуг (телефоны, адрес электронной почты...);Сайт;Иконка;pos;Пресет;Район\n";
    for (var elem in data) {
        accumulator += data[elem]['категория'] + ';';
        accumulator += data[elem]['Поисковые слова'] + ';';
        accumulator += data[elem]['Категория поисковых слов'] + ';';
        accumulator += data[elem]['Наименование поставщика социальных услуг'] + ';';
        accumulator += data[elem]['Адрес места нахождения поставщика социальных услуг'] + ';';
        accumulator += data[elem]['Описание'] + ';';
        accumulator += data[elem]['Контактная информация поставщика социальных услуг (телефоны, адрес электронной почты...)'] + ';';
        accumulator += data[elem]['Сайт'] + ';';
        accumulator += data[elem]['Иконка'] + ';';
        accumulator += data[elem]['Координаты']['pos'] + ';';
        accumulator += data[elem]['Пресет'] + ';';
        accumulator += data[elem]['Район'] + '\n';
    }

    fs.writeFileSync("adov_dataset.csv", accumulator);
    console.log('ready');
    
}
//маршрутизация
// app.get("/", urlencodedParser, function (request, response) {
//     response.sendFile(__dirname + "/public/index.htm");
// });

// app.post("/mapPoints", urlencodedParser, (req, res) => {
//     res.sendFile(__dirname +'/data.json');
// });
  
// app.listen(process.env.PORT || 3000);
// console.log(':3000');