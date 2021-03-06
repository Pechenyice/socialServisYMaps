window.onload = () => {

  //Важные переменные, вряд ли стоит удалять

  var points = [];

  var categories = [];
  var categoryFilter;
  var helpFilter;
  var areaFilter;
  var categoryOff;
  var helpOff;
  var areaOff;
  var activeCategory = '';
  var activeHelp = '';
  var activeArea = '';

  // var preset;

  ymaps.ready(init);
  //подгрузка карты
  function init(){
      var myMap = new ymaps.Map("map", {
          center: [59.939095, 30.315868],
          zoom: 9
      });

      //запрос на сервер для получения json
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/mapPoints', false);
      xhr.send();
      var data;
      if (xhr.status == 200) {
        data = JSON.parse(xhr.responseText);
      }
      for (var elem in data) {
        if (data[elem]['категория'] == '') data.splice(elem, 1);
      }

      
      //сортировка данных
      data = data.sort((prev, next) => {
        if ( +(prev['категория'].split('.')[0]) < +(next['категория'].split('.')[0])) return -1;
        if ( +(prev['категория'].split('.')[0]) > +(next['категория'].split('.')[0])) return 1;
        if ( prev['Поисковые слова'] < next['Поисковые слова']) return -1;
        if ( prev['Поисковые слова'] > next['Поисковые слова'] ) return 1;
        if ( prev['Район'] < next['Район']) return -1;
        if ( prev['Район'] >= next['Район'] ) return 1;
      });

      //подсчет услуг
      var categoryCounter = {};
      var helpCounter = {};
      var areaCounter = {};

      for (var elem in data) {
        if (!categoryCounter[data[elem]['категория']]) categoryCounter[data[elem]['категория']] = 1; else categoryCounter[data[elem]['категория']]++;
      }

      for (var elem in data) {
        if (!helpCounter[data[elem]['категория'] +' '+ data[elem]['Поисковые слова']]) helpCounter[data[elem]['категория'] +' '+ data[elem]['Поисковые слова']] = 1; else helpCounter[data[elem]['категория'] +' '+ data[elem]['Поисковые слова']]++;
      }

      for (var elem in data) {
        if (!areaCounter[data[elem]['категория'] + ' ' + data[elem]['Поисковые слова'] + ' ' +  data[elem]['Район']]) areaCounter[data[elem]['категория'] + ' ' + data[elem]['Поисковые слова'] + ' ' +  data[elem]['Район']] = 1; else areaCounter[data[elem]['категория'] + ' ' + data[elem]['Поисковые слова'] + ' ' +  data[elem]['Район']]++;
      }
      
      


      //создание точек
      for (var elem in data) {
        // if (data[elem]['Район'] == 'Некоммерческие организации') preset = "islands#redIcon"; else preset = "islands#blueIcon";
        

        var coords = data[elem]['pos'].split(' ');
              var x = +(coords[1]);
              var y = +(coords[0]);
              coords = [];
              coords.push(x);
              coords.push(y);

              var point = {
                "type": "Feature",
                "id":elem,
                "geometry":{
                    "type": "Point",
                    "coordinates": coords
                },
                "properties":{
                    "balloonContent": "<h2 class='red'>" +data[elem]['Наименование поставщика социальных услуг']+"</h2><br/><p class='gray'>"+data[elem]['Контактная информация поставщика социальных услуг (телефоны, адрес электронной почты...)']+"</p><p class='gray'>"+data[elem]['Описание']+"</p><p class='gray'>"+data[elem]['Адрес места нахождения поставщика социальных услуг']+"</p><br/><a href=\""+data[elem]['Сайт']+"\">Перейти на сайт</a>",
                    "clusterCaption": data[elem]['Адрес места нахождения поставщика социальных услуг'],
                    "hintContent": data[elem]['Адрес места нахождения поставщика социальных услуг']
                },
                options: {
                  area: data[elem]['категория'] +' '+ data[elem]['Поисковые слова'] + ' ' + data[elem]['Район'],
                  category: data[elem]['категория'],
                  helper: data[elem]['категория'] +' '+ data[elem]['Поисковые слова'],
                  helperCategory: data[elem]['Категория поисковых слов'],
                  rightCoords: coords.join(' '),
                  preset: data[elem]['Пресет']
              }
            } 
              points.push(point);


            
        
      }
      //добавление их на карту
      window.myObjects = ymaps.geoQuery({
        type: "FeatureCollection",
        features: points
    }).addToMap(myMap);

    // var clusterer = new ymaps.Clusterer({ clusterDisableClickZoom: true });
    // clusterer.add(pointsCoordsCluster);
    // map.geoObjects.add(clusterer);

    //Добавление категорий в структуру index.html
    // document.getElementById('spoilers').innerHTML += '<div class="spoiler" data="' + data[0]['категория'] + '"><div class="spoilerBox"><div class="spoilerBoxBack"><p class="back gray"><</p><p class="spoilerCategory gray">' + data[0]['категория'] + '</p></div></div><p class="spoilerIcon red"><i class="fas fa-heartbeat"></i></p><p class="spoilerName red">' + data[0]['категория'] + '</p><p class="spoilerInfo gray"><span class="infoCount">' + categoryCounter[data[0]['категория']] + '</span> услуг(-и)</p><p class="spoilerArrow gray">></p></div>'
    categories.push(data[0]['категория']);

    for (var elem in data) {
      if (elem-1 >= 0 && data[elem]['категория'] != data[elem-1]['категория']) {
        // document.getElementById('spoilers').innerHTML += '<div class="spoiler" data="' + data[elem]['категория'] + '"><div class="spoilerBox"><div class="spoilerBoxBack"><p class="back gray"><</p><p class="spoilerCategory gray">' + data[elem]['категория'] + '</p></div></div><p class="spoilerIcon red"><i class="fas fa-heartbeat"></i></p><p class="spoilerName red">' + data[elem]['категория'] + '</p><p class="spoilerInfo gray"><span class="infoCount">' + categoryCounter[data[elem]['категория']] + '</span> услуг(-и)</p><p class="spoilerArrow gray">></p></div>'
        categories.push(data[elem]['категория']);
      }
    }

    for (var cat in categories) {
      document.getElementById('categoriesSpoiler').innerHTML += '<div class="spoilerBox categoriesSpoilerBox" data="'+ categories[cat] +'"><p class="spoilerIcon red"><i class="fas fa-heartbeat"></i></p><p class="spoilerName red">'+categories[cat]+'</p><p class="spoilerInfo gray"><span class="infoCount">'+ categoryCounter[categories[cat]] + '</span> услуг(-и)</p><p class="spoilerArrow gray">></p></div>'
    }
    //Слушатель нажатия на категорию
    $(".categoriesSpoilerBox").click(function () {
      document.getElementById('helpSpoiler').classList.add('activeSpoiler');
      var category = $(this).attr('data');
      categoryFilter = category;
      activeCategory = category;
      //Фильтрация подходящих точек
      categoryFiltration(categoryFilter);

      //Создание структуры услуг выбранной категории
      for (var elem in data) {
        if ((elem > 0 && data[elem]['категория'] == category && data[elem]['Поисковые слова'] != data[elem-1]['Поисковые слова']) || (data[elem]['категория'] == category && elem == 0) || (elem > 0 && data[elem - 1]['категория'] != category && data[elem]['категория'] == category)) {
          if ((elem > 0 && data[elem]['Категория поисковых слов'] != data[elem-1]['Категория поисковых слов']) || (elem == 0)) {
            document.getElementById('helpSpoilerContent').innerHTML += '<div class="spoilerBoxSignature">Услуги: '+data[elem]['Категория поисковых слов']+'</div>';
          }
          
          document.getElementById('helpSpoilerContent').innerHTML += '<div class="spoilerBox helpSpoilerBox" data="'+ data[elem]['категория'] +' '+ data[elem]['Поисковые слова'] +'"><p class="spoilerIcon red">'+ data[elem]['Иконка'] +'</p><p class="spoilerName red">'+data[elem]['Поисковые слова']+'</p><p class="spoilerInfo gray"><span class="infoCount">'+ helpCounter[data[elem]['категория'] +' '+ data[elem]['Поисковые слова']] + '</span> мест(-а)</p><p class="spoilerArrow gray">></p></div>'
          
          $(".helpSpoilerBox").click(function () {
            document.getElementById('areaSpoiler').classList.add('activeSpoiler');
            var help = $(this).attr('data');
            activeHelp = help;
            helpFilter = help;
            console.log(help);
            //фильтрация подходящих услуг
            helpFiltration(helpFilter);
                      //создание структуры районов для выбранной услуги

                      // for (var area in data) {
                      //   if (data[area]['категория'] + ' ' + data[area]['Поисковые слова'] == help && data[area]['Район'] == 'Некоммерческие организации') {
                      //     document.getElementById('areaSpoilerContent').innerHTML += '<div class="spoilerBox areaSpoilerBox" data="'+ data[area]['категория'] +' '+ data[area]['Поисковые слова'] + ' ' +data[area]['Район'] +'"><p class="spoilerIcon red"><i class="fas fa-globe"></i></p><p class="spoilerName red">'+data[area]['Район']+'</p><p class="spoilerInfo gray"><span class="infoCount">'+ areaCounter[data[area]['категория'] +' '+ data[area]['Поисковые слова'] + ' ' +data[area]['Район']] + '</span> точки(-ек)</p><p class="spoilerArrow gray">></p></div>';
                      //     break;
                      //   }
                      // }

                      for (var el in data) {
                        if ((data[el]['категория'] +' '+ data[el]['Поисковые слова'] == help && el > 0 && data[el]['Район'] != data[el-1]['Район']) || (data[el]['категория'] +' '+ data[el]['Поисковые слова'] == help && el == 0) || (el > 0 && data[el-1]['категория'] +' '+ data[el-1]['Поисковые слова'] != help && data[el]['категория'] +' '+ data[el]['Поисковые слова'] == help)) {
                          // if (data[el]['Район'] == 'Некоммерческие организации') continue;
                          // console.log( data[el] );
                          document.getElementById('areaSpoilerContent').innerHTML += '<div class="spoilerBox areaSpoilerBox" data="'+ data[el]['категория'] +' '+ data[el]['Поисковые слова'] + ' ' +data[el]['Район'] +'"><p class="spoilerIcon red"><i class="fas fa-globe"></i></p><p class="spoilerName red">'+data[el]['Район']+'</p><p class="spoilerInfo gray"><span class="infoCount">'+ areaCounter[data[el]['категория'] +' '+ data[el]['Поисковые слова'] + ' ' +data[el]['Район']] + '</span> точки(-ек)</p><p class="spoilerArrow gray">></p></div>'
                          
                          $(".areaSpoilerBox").click(function () {
                            document.getElementById('adressSpoiler').classList.add('activeSpoiler');
                            var area = $(this).attr('data');
                            areaFilter = area;
                            activeArea = area;
                            //фильтрация подходящих районов
                            areaFiltration(areaFilter);
                            //создание структуры точек
                            for (var id in data) {
                              if (data[id]['категория'] +' '+ data[id]['Поисковые слова'] + ' ' +data[id]['Район'] == area) {
                                var coords = data[id]['pos'].split(' ');
                                var x = +(coords[1]);
                                var y = +(coords[0]);
                                coords = [];
                                coords.push(x);
                                coords.push(y);
                                document.getElementById('adressSpoilerContent').innerHTML += '<div class="spoilerBox adressSpoilerBox" data="'+ coords.join(' ') +'"><p class="spoilerIcon red"><i class="fas fa-map-marked-alt"></i></p><p class="spoilerName red">'+data[id]['Наименование поставщика социальных услуг']+'</p><p class="spoilerInfo gray">'+ data[id]['Адрес места нахождения поставщика социальных услуг'] +'</p><p class="spoilerArrow gray">></p></div>'
                              }
                            }

                            $('.adressSpoilerBox').click(function b() {
                              var neededCoords = $(this).attr('data');
                              // console.log(neededCoords)
                              myMap.geoObjects.each(function (geoPoint) {
                                // console.log(geoPoint.options.get('rightCoords') == neededCoords)
                                if (geoPoint.options.get('rightCoords') == neededCoords) {
                                  geoPoint.balloon.open();
                                  // console.log([Number(neededCoords.split(' ')[0]), Number(neededCoords.split(' ')[1])]);
                                  setTimeout(() => {myMap.setCenter([Number(neededCoords.split(' ')[0]), Number(neededCoords.split(' ')[1])], 18, {checkZoomRange: true});}, 100);
                                }
                              });
                            });




                          });





                        }
                      }

          });

        }
      }
    });





    //обработчики нажатий на кнопки выхода на уровень выше
    $('#helpBackSpoiler').click(function a() {
      document.getElementById("helpSpoiler").classList.remove("activeSpoiler");
      document.getElementById("helpSpoilerContent").innerHTML="";
      myObjects.add(categoryOff).addToMap(myMap);
      setTimeout(() => {myMap.setCenter([59.939095, 30.315868], 9, {checkZoomRange: true});}, 100);
      myMap.geoObjects.each(function (geoPoint) {
        // console.log(geoPoint.options.get('rightCoords') == neededCoords)
        if (geoPoint.balloon.isOpen()) {
          geoPoint.balloon.close();
        }
      });
    });

    $('#areaBackSpoiler').click(function a() {
      // document.getElementById("helpSpoiler").classList.remove("activeSpoiler");
      document.getElementById('areaSpoiler').classList.remove('activeSpoiler');
      // document.getElementById("helpSpoilerContent").innerHTML="";
      document.getElementById('areaSpoilerContent').innerHTML='';
      myObjects.add(helpOff).addToMap(myMap);
      categoryFiltration(activeCategory);
      setTimeout(() => {myMap.setCenter([59.939095, 30.315868], 9, {checkZoomRange: true});}, 100);
      myMap.geoObjects.each(function (geoPoint) {
        // console.log(geoPoint.options.get('rightCoords') == neededCoords)
        if (geoPoint.balloon.isOpen()) {
          geoPoint.balloon.close();
        }
      });

    });

    $('#adressBackSpoiler').click(function a() {
      // document.getElementById("helpSpoiler").classList.remove("activeSpoiler");
      // document.getElementById('areaSpoiler').classList.remove('activeSpoiler');
      document.getElementById('adressSpoiler').classList.remove('activeSpoiler');
      // document.getElementById("helpSpoilerContent").innerHTML="";
      // document.getElementById('areaSpoilerContent').innerHTML='';
      document.getElementById('adressSpoilerContent').innerHTML='';
      myObjects.add(areaOff).addToMap(myMap);
      helpFiltration(activeHelp);
      setTimeout(() => {myMap.setCenter([59.939095, 30.315868], 9, {checkZoomRange: true});}, 100);
      myMap.geoObjects.each(function (geoPoint) {
        // console.log(geoPoint.options.get('rightCoords') == neededCoords)
        if (geoPoint.balloon.isOpen()) {
          geoPoint.balloon.close();
        }
      });
    });

    //функции фильтрации
    function categoryFiltration(cat) {
      // console.log(cat);
      var filter_q=new ymaps.GeoQueryResult();
      // for (var elem in data) {
        filter_q = myObjects.search('options.category="'+cat+'"').add(filter_q);
        shownObjects=filter_q.addToMap(myMap);
      // }
      categoryOff = shownObjects;
      myObjects.remove(shownObjects).removeFromMap(myMap);
    }

    function helpFiltration(help) {
      // console.log(help);
      var filter_h=new ymaps.GeoQueryResult();
      // for (var elem in data) {
        filter_h = myObjects.search('options.helper="'+help+'"').add(filter_h);
        shownObjects=filter_h.addToMap(myMap);
      // }
      helpOff = shownObjects;
      myObjects.remove(shownObjects).removeFromMap(myMap);
    }
    
    function areaFiltration(area) {
      // console.log(area);
      var filter_a=new ymaps.GeoQueryResult();
      // for (var elem in data) {
        filter_a = myObjects.search('options.area="'+area+'"').add(filter_a);
        shownObjects=filter_a.addToMap(myMap);
        // activeHelp = help;
      // }
      areaOff = shownObjects;
      myObjects.remove(shownObjects).removeFromMap(myMap);
    }

  }

}