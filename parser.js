const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');

class Parser {
  constructor(data) {
    if (data) {
      this.link = data.link || false;
    }
  }

  isLink(link) {
    if (link) return (/([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/.test(link));
    else return (/([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/.test(this.link));
  }
}

var PP = new Parser();

var global = {
  links: []
}

io.on('connection', function (socket) {
  console.log('connected');
  socket.on('link-export', (data) => {
    if (PP.isLink(data.link)) {
//      response(socket, 'yes')
      socket.emit('loading', true);
    } else socket.emit('send-error', 'Неправильная ссылка');
  });
});


http.listen(3030, function () {
  console.log('listening on *:3030');
});

function response(socket, obj) {
  if (obj) {
    socket.emit('response', obj);
  }
}