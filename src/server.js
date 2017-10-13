const http = require('http');
const path = require('path');

const express = require('express');
const socketio = require('socket.io');
// const sockets = ('./sockets.js');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../client/index.html`));
});

const server = http.createServer(app);

const io = socketio(server);

let turn = 'X';
let numOfPlayers = 0;

const tictactoe = {
  1: '',
  2: '',
  3: '',
  4: '',
  5: '',
  6: '',
  7: '',
  8: '',
  9: '',
};

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});

const checkForWinner = (player) => {
  let winner = false;
  if (tictactoe[1] === player && tictactoe[2] === player && tictactoe[3] === player) {
    winner = true;
  } else if (tictactoe[4] === player && tictactoe[5] === player && tictactoe[6] === player) {
    winner = true;
  } else if (tictactoe[7] === player && tictactoe[8] === player && tictactoe[9] === player) {
    winner = true;
  } else if (tictactoe[1] === player && tictactoe[4] === player && tictactoe[7] === player) {
    winner = true;
  } else if (tictactoe[2] === player && tictactoe[5] === player && tictactoe[8] === player) {
    winner = true;
  } else if (tictactoe[3] === player && tictactoe[6] === player && tictactoe[7] === player) {
    winner = true;
  } else if (tictactoe[1] === player && tictactoe[5] === player && tictactoe[9] === player) {
    winner = true;
  } else if (tictactoe[3] === player && tictactoe[5] === player && tictactoe[7] === player) {
    winner = true;
  }
  return winner;
};

io.on('connection', (sock) => {
  const socket = sock;
  if (numOfPlayers === 0) {
    socket.join('room1');
    const data = { player: 'X' };
    socket.emit('joined', data);
    numOfPlayers++;
  } else if (numOfPlayers === 1) {
    socket.join('room1');
    const data = { player: 'O' };
    socket.emit('joined', data);
    numOfPlayers++;
  }

  socket.on('play', (data) => {
        if (data.player === turn) {
            tictactoe[data.location] = data.player;
            if (checkForWinner(turn)) {
                io.sockets.in('room1').emit('winner', {player: data.player });
                io.sockets.in('room1').emit('playFromServer', tictactoe);
                return;
            }
            console.log(tictactoe);
            io.sockets.in('room1').emit('playFromServer', tictactoe);
            if (turn === 'X') turn = 'O';
            else if (turn === 'O') turn = 'X';
        }
  });
    socket.on('disconnect', () =>{
        numOfPlayers--;
    })
});
