const fs = require('fs');
const express = require("express");
const bodyParser = require("body-parser");
const csv = require("csvtojson");
const axios = require('axios');
axios.defaults.timeout = 100000;

const app = express();
app.use(express.static(__dirname + "/public"));
const urlencodedParser = bodyParser.urlencoded({extended: false});

var data;
main();

function main() {
const converter = csv({
delimiter: ";"
});

converter.fromFile("adov_dataset.csv").then(function(temp) {
    data = temp;
    console.log('ready');
});

// fs.writeFileSync("adov_dataset.json", JSON.stringify(data));

}
//маршрутизация
app.get("/", urlencodedParser, function (request, response) {
// console.log(__dirname);
response.sendFile(__dirname + "/public/index.htm");
});

app.post("/mapPoints", urlencodedParser, function (req, res) {
// console.log("zapros ok");
// res.send(JSON.stringify(data));
res.sendFile(__dirname + "/adov_dataset.json");
});

app.listen(process.env.PORT || 3000);