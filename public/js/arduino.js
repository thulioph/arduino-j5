(function() {

  'use strict';

  const j5 = require('johnny-five');

  module.exports = (socket) => {
    const board = new j5.Board();

    socket.sockets.on('connection', (socket) => {
      board.on('ready', () => {
        socket.emit('board_ready', true);

        // proximity
        const proximity = new j5.Proximity({
          controller: "HCSR04",
          pin: 7,
        });

        let button = new j5.Button({
          pin: 2
        });

        let led = new j5.Led(13);

        board.repl.inject({
          button
        });

        // ====

        proximity.on('data', (e) => {
          socket.emit('proximity', e);

          if (Math.floor(e.cm) < 5) {
            led.on();
          } else if (Math.floor(e.cm) > 15) {
            led.blink(200);
          } else if (Math.floor(e.cm) > 20 && Math.floor(e.cm).toString().length <= 3) {
            led.off();
          }
        });

        socket.on('down', () => led.on());
        socket.on('up', () => led.stop().off());
        socket.on('hold', () => led.blink(200));

        // ====

        button.on('down', () => {
          socket.emit('down', true);
          led.on();
        });

        button.on('hold', () => {
          socket.emit('hold', true);
          led.blink(200);
        });

        button.on('up', () => {
          socket.emit('up', true);
          led.stop().off();
        });
      });
    });
  };

})();