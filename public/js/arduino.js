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

        proximity.on('data', (e) => socket.emit('proximity', e));
        proximity.on('change', (e) => socket.emit('proximity_change', e));

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