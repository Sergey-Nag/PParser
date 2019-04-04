var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var rp = require('request-promise');
var cheerio = require('cheerio');

const pattern = /^(([^<>()[\]\\.,:\s@\"]+(\.[^<>()[\]\\.,:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i; // RegExp валидация E-mail'a

var newLinkFinal;

const towns = ["Авдеевка", "Александрия", "Александровск", "Алёшки", "Алмазная", "Алчевск", "Амвросиевка", "Ананьев", "Андрушёвка", "Антрацит", "Апостолово", "Артёмовск", "Арциз", "Ахтырка", "Балаклея", "Балта", "Бар", "Барановка", "Барвенково", "Батурин", "Бахмач", "Бахмут", "Баштанка", "Белая Церковь", "Белгород-Днестровский", "Белз", "Белицкое", "Белозёрское", "Белополье", "Беляевка", "Бердичев", "Бердянск", "Берегово", "Бережаны", "Березань", "Березно", "Березо́вка", "Берестечко", "Берислав", "Бершадь", "Бобринец", "Бобрка", "Бобровица", "Богодухов", "Богуслав", "Болград", "Болехов", "Борзна", "Борислав", "Борисполь", "Борщёв", "Боярка", "Бровары", "Броды", "Брянка", "Бурштын", "Бурынь", "Буск", "Буча", "Бучач", "Валки", "Вараш", "Васильевка", "Васильков", "Ватутино", "Вахрушево", "Вашковцы", "Великие Мосты", "Верхнеднепровск", "Верховцево", "Вижница", "Вилково", "Винники", "Винница", "Виноградов", "Вишнёвое", "Владимир-Волынский", "Вознесенск", "Волноваха", "Волочиск", "Волчанск", "Вольногорск", "Вольнянск", "Ворожба", "Вышгород", "Гадяч", "Гайворон", "Гайсин", "Галич", "Геническ", "Герца", "Глобино", "Глухов", "Глиняны", "Гнивань", "Голая Пристань", "Горишние Плавни", "Горловка", "Горное", "Горняк", "Городенка", "Городище", "Городня", "Городок", "Городок", "Горохов", "Гребёнка", "Гуляйполе", "Дебальцево", "Деражня", "Дергачи", "Днепр", "Днепрорудное", "Добромиль", "Доброполье", "Докучаевск", "Долина", "Долинская", "Донецк", "Дрогобыч", "Дружба", "Дружковка", "Дубляны", "Дубно", "Дубровица", "Дунаевцы", "Енакиево", "Жашков", "Ждановка", "Железное", "Жёлтые Воды", "Жидачов", "Житомир", "Жмеринка", "Жолква", "Заводское", "Залещики", "Запорожье", "Заставна", "Збараж", "Зборов", "Звенигородка", "Здолбунов", "Зеленодольск", "Зеньков", "Зимогорье", "Змиёв", "Знаменка", "Золотое", "Золотоноша", "Золочев", "Зоринск", "Зугрэс", "Ивано-Франковск", "Измаил", "Изюм", "Изяслав", "Иловайск", "Ильинцы", "Ирмино", "Ирпень", "Иршава", "Ичня", "Кагарлык", "Казатин", "Калиновка", "Калуш", "Каменец-Подольский", "Каменка", "Каменка-Бугская", "Каменка-Днепровская", "Каменское", "Камень-Каширский", "Канев", "Карловка", "Каховка", "Киверцы", "Киев", "Килия", "Кировск", "Кировское", "Кицмань", "Кобеляки", "Ковель", "Кодыма", "Коломыя", "Конотоп", "Константиновка", "Корец", "Коростень", "Коростышев", "Корсунь-Шевченковский", "Корюковка", "Косов", "Костополь", "Краматорск", "Красилов", "Красноград", "Краснодон", "Краснопартизанск", "Красный Луч", "Хрустальный", "Кременец", "Кременчуг", "Кривой Рог", "Кролевец", "Кропивницкий", "Купянск", "Ладыжин", "Лановцы", "Лебедин", "Лиман", "Лисичанск", "Лозовая", "Лохвица", "Лубны", "Луганск", "Лутугино", "Луцк", "Львов", "Любомль", "Люботин", "Малин", "Марганец", "Мариуполь", "Макеевка", "Малая Виска", "Мелитополь", "Мена", "Мерефа", "Миргород", "Мирноград (Димитров)", "Мироновка", "Миусинск", "Могилёв-Подольский", "Молодогвардейск", "Молочанск", "Монастыриска", "Монастырище", "Мостиска", "Мукачево", "Надворная", "Николаев", "Николаев", "Никополь", "Нежин", "Немиров", "Нетешин", "Новая Каховка", "Новая Одесса", "Новый Буг", "Новоазовск", "Нововолынск", "Новгород-Северский", "Новогродовка", "Новомиргород", "Новоград-Волынский", "Новодружеск", "Новоднестровск", "Новомосковск", "Новопсков", "Новоселица", "Новоукраинка", "Новый Роздол", "Носовка", "Обухов", "Овруч", "Одесса", "Орехов", "Острог", "Очаков", "Павлоград", "Первомайск", "Первомайск", "Первомайский", "Перевальск", "Перемышляны", "Перечин", "Перещепино", "Переяслав-Хмельницкий", "Першотравенск", "Петровское", "Пирятин", "Погребище", "Подволочиск", "Подгайцы", "Подгородное", "Подольск", "Покров", "Покровск", "Пологи", "Полонное", "Полтава", "Попасная", "Почаев", "Приволье", "Прилуки", "Приморск", "Припять", "Пустомыты", "Путивль", "Пятихатки", "Рава-Русская", "Радехов", "Радомышль", "Радивилов", "Раздельная", "Рахов", "Ржищев", "Рогатин", "Ровеньки", "Ровно", "Рожище", "Ромны", "Рубежное", "Рудки", "Самбор", "Сарны", "Свалява", "Сватово", "Свердловск", "Светловодск", "Северодонецк", "Седнев", "Селидово", "Семёновка", "Середина-Буда", "Синельниково", "Скадовск", "Скалат", "Сквира", "Сколе", "Славута", "Славутич", "Славянск", "Смела", "Снежное", "Снигирёвка", "Сновск", "Снятын", "Сокаль", "Сокиряны", "Соледар", "Старобельск", "Староконстантинов", "Старый Самбор", "Стаханов", "Кадиевка", "Сторожинец", "Стрый", "Сумы", "Суходольск", "Счастье", "Таврийск", "Тальное", "Тараща", "Татарбунары", "Теплодар", "Тернополь", "Терновка", "Тетиев", "Тысменица", "Тлумач", "Теребовля", "Тростянец", "Трускавец", "Токмак", "Торез", "Торецк", "Тульчин", "Тячев", "Угледар", "Угнев", "Узин", "Украинка", "Ужгород", "Умань", "Устилуг", "Фастов", "Харцызск", "Харьков", "Херсон", "Хмельник", "Хмельницкий", "Хорол", "Хотин", "Христиновка", "Хуст", "Хыров", "Червоноград", "Червонопартизанск", "Черноморск", "Черкассы", "Чернигов", "Чернобыль", "Черновцы", "Чигирин", "Чоп", "Чортков", "Чугуев", "Шаргород", "Шахтёрск", "Шепетовка", "Шостка", "Шпола", "Шумск", "Энергодар", "Южное", "Южноукраинск", "Яворов", "Яготин", "Ямполь", "Яремче", "Ясиноватая"];

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('connected');
  socket.on('link-export', (link) => {
    // переход по ссылке
    getCutUrl(link, function (stat) {
      socket.emit('email-import', stat);
    })
    //    loadContacts(link, function (stat) {
    //      socket.emit('email-import', stat);
    //    });

    //    console.log(')-->', urlLink);

  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

/*************************************************/

// получение ссылки контактов
function getCutUrl(url, callback) {
  var site = url.split('/');
  var prom = site[2].match(/prom.ua/);
  var newUrl;
  if (prom != null) {
    getUrlInProm(url, function (link) {
      console.log('\n !!>>', link);
      addContactsToLink(link, function (cont) {
        loadContacts(cont, function (stat) {
          callback(stat);
        });
      });
    });
  } else {
    var llink = url.match(/\;/g);
    console.log('maatch >>',llink);
    
    addContactsToLink(url, function (cont) {
      loadContacts(cont, function (stat) {
        callback(stat);
      });
    });
  }
}

// добавление /contacts к ссылке
function addContactsToLink(url, callback) {
  var newUrl;
  var cLink = url.match(/\//ig);
  if (cLink.length > 2) {
    var regexp = /\//ig;
    regexp.lastIndex = 8;
    var ind = regexp.exec(url).index;
    regexp = url.substr(0, ind);
    newUrl = regexp + '/contacts';
  } else newUrl = url + '/contacts';
  //    return newUrl;
  callback(newUrl);

}

// получение ссылки сайта с prom.ua
function getUrlInProm(urll, callback) {
  var goOn;
  var options = {
    uri: urll,
    transform: function (body) {
      var $ = cheerio.load(body);
      var link = $('.x-product-info__content').children('.x-product-info__item').children('.x-product-info__inline').children('a');
      if (link.attr('href') != undefined) {
        return link.attr('href');
      } else {
        link = $('.x-showroom__holder').children('.x-showroom__info');
        if (link.text() != '') {
          link = link.children('.x-company-menu').children('.x-company-menu__item').eq(0).children('a');
          //          console.log(link.attr('href'));
          return link.attr('href');
        }
      }
    }
  };
  rp(options)
    .then(function (link) {
      goOn = link;

      // Process html like you would with jQuery...
    })
    .catch(function (err) {
      // Crawling failed or Cheerio choked...
    })
    .finally(function (link) {
      callback(goOn);
      // This is called after the request finishes either successful or not successful.
    });
}

// поиск города
function foundTown(str) {
  for (i = 0; i < towns.length; i++) {
    var match = str.search(towns[i]);
    if (match != -1) {
      return towns[i];
    }
  }
}

// поиск города в массиве
function foundTownArr(arr) {
  for (a = 0; a < towns.length; a++) {
    var town = towns[a];
    for (b = 0; b < arr.length; b++) {
      if (arr[b] == town) {
        return town;
      }
    }
  }
}

/*-*-*-*/
function findEmailInTables(arr) {
  for (i = 0; i < arr.length; i++) {
    var txt = arr[i].children[0].data;
    console.log(txt);
    if (txt != '') {
      txt = txt.replace(/\s/g, '');
      console.log(txt);
      if (pattern.test(txt)) {
        return txt;
      } else {

      }
    }
  }
}

function findAddressInTables(arr) {
  for (i = 0; i < arr.length; i++) {
    var txt = arr[i].children[0].data;
    console.log(txt);
    if (txt != '') {
      txt = txt.match(/[А-Я]\S* область/g);
      if (txt != null) {
        return txt;
      }
    }
  }
}


/*====================*/
function loadContacts(urlLink, callback) {

  request(urlLink, (err, resp, body) => {
    if (err) throw err; // ошибка
    var sCode = resp.statusCode.toString(); // статус-код
    console.log('.................');
    console.log('StatusCode:', sCode);
    var splCode = sCode.split(''); // разделение статус-кода

    var status = {
      code: false,
      email: false,
      link: urlLink,
      adress: false,
      town: false
    };

    if (sCode[0] == '3') status.code = sCode;
    //      if (sCode[0] == '3') console.log('Перенаправление');
    //      else if (sCode[0] == '4') console.log('Ошибка клиента')
    else if (sCode[0] == '4') {
      status.code = sCode;
      socket.emit('email-import', status);
    }

    //      else if (sCode[0] == '5') console.log('Ошибка сервера');
    else if (sCode[0] == '5') status.code = sCode;
    else if (sCode[0] == '2') {
      console.log('Успешно');
      status.code = sCode;
      // если странинца успешно загружена то вытягивается разметка
      const $ = cheerio.load(body); // загрузка тела страницы
      var srch = $('div[title="Email"]').text(); // поиск E-mail'a


      // E-mail
      if (pattern.test(srch)) {
        // если это E-mail, то отправить клиенту
        status.email = srch;
      } else {
        // если E-mail не валидный, то вывести в консоль
        //          console.log('not email:', srch || '-');

        srch1 = body; // загрузка разметки
        var newSrch = srch1.match(/>\S*@\S*</ig); // поиск почты между тегом

        if (newSrch != null) { // если найдено
          newSrch = newSrch[0].replace(/>/g, '').replace(/<\S*/g, ''); // удаление символов тега
          // отправка клиенту
          status.email = newSrch;
        } else {
          // если не найдено то ищем почту в ячейках таблиц
          var td = $('td');
          var finded = findEmailInTables(td);
          if (finded != undefined) status.email = finded;
          else status.email = 'Не найдено';
        }
      }


      // Adress
      var adress = $('address').text();
      var obl = /[А-Я]\S* область/;
      /*--- поиск области в теге addres --*/
      if (adress != '') {

        // status.adress = adress;

        var matched = adress.match(obl);

        if (matched != null) {
          var splited = matched[0].split(/Украина/)[1];
          status.adress = matched[0].split(/Украина/)[1];
          console.log(matched[0].split(/Украина/)[1]);
        } else {

          adress = $('body').text();
          matched = adress.match(obl);
          //            console.log(matched);
          if (matched != '') {
            //                  status.adress = matched[0].split(/Украина/)[1];
          } else {

            status.adress = false;
          }
        }
      } else {
        /*--- поиск области по таблицам ---*/
        var td = $('td');
        var finded = findAddressInTables(td, 'область');
        console.log('! >> ', finded);
        if (finded != undefined) {
          status.adress = finded[0];
        } else {}
      }

      // поиск города
      //          console.log(adress);
      adress = $('address').text();
      var finded = false;
      var adress1 = adress.match(/область\S*/ig);

      if (adress1 != null) {
        finded = foundTown(adress1[0]); // поиск города в массиве

        if (finded == null) finded = foundTown(adress[0]);
        if (finded != null) {
          status.town = finded;
          if (finded == 'Киев' && status.adress == false) status.adress = 'Киевская область';
        } else status.town = 'Не найдено';
      } else {
        /*--- поиск в теге address по дочерним элементам ---*/
        adress = $('address').children('span');
        adress1 = $('div[title="Адрес:"]');

        var adrArr = function () {
          var arr = [];
          for (i = 0; i < adress.length; i++) {
            arr.push(adress[i].children[0].data);
          }
          return arr;
        }
        var adresses = adrArr();
        adress1 = foundTownArr(adresses);

        if (adress1 != null) {
          status.town = adress1;
        } else {
          var td = $('td').text();
          var finded = foundTown(td);
          if (finded != undefined) {
            status.town = finded;
          } else status.town = 'Не найдено';
          //          status.town = 'Не найдено';
        }

        if (adress1 == 'Киев' && status.adress == false) status.adress = 'Киевская область';
      }

      console.log('result:', status);
    }
    callback(status);
    //    else console.log('fuck you!');

  }); // &request
}
