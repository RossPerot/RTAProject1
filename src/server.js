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
let rooms = 0;

const tictactoe = {};

server.listen(PORT, (err) => {
  if (err) {
    throw err;
  }
  console.log(`Listening on port ${PORT}`);
});

const checkForWinner = (player, room) => {
  const currentBoard = tictactoe[`room${room}`].split(',');
  let winner = false;
  if (currentBoard[0] === player && currentBoard[1] ===
      player && currentBoard[2] === player) {
    winner = true;
  } else if (currentBoard[3] === player && currentBoard[4] ===
             player && currentBoard[5] === player) {
    winner = true;
  } else if (currentBoard[6] === player && currentBoard[7] ===
             player && currentBoard[8] === player) {
    winner = true;
  } else if (currentBoard[0] === player && currentBoard[3] ===
             player && currentBoard[6] === player) {
    winner = true;
  } else if (currentBoard[1] === player && currentBoard[4] ===
             player && currentBoard[7] === player) {
    winner = true;
  } else if (currentBoard[2] === player && currentBoard[5] ===
             player && currentBoard[8] === player) {
    winner = true;
  } else if (currentBoard[0] === player && currentBoard[4] ===
             player && currentBoard[8] === player) {
    winner = true;
  } else if (currentBoard[2] === player && currentBoard[4] ===
             player && currentBoard[6] === player) {
    winner = true;
  }
  return winner;
};

io.on('connection', (sock) => {
  const socket = sock;
  if (numOfPlayers === 0) {
    socket.join(`room${rooms}`);
    tictactoe[`room${rooms}`] = ' , , , , , , , , ';
    const data = { player: 'X', room: rooms, tictactoe: tictactoe[`room${rooms}`]};
    console.log(`${rooms} ${numOfPlayers}`);
    socket.emit('joined', data);
    numOfPlayers++;
  } else if (numOfPlayers === 1) {
    socket.join(`room${rooms}`);
    const data = { player: 'O', room: rooms, tictactoe: tictactoe[`room${rooms}`] };
    console.log(`${rooms} ${numOfPlayers}`);
    socket.emit('joined', data);
    numOfPlayers = 0;
    rooms++;
  }

  socket.on('play', (data) => {
    if (data.player === turn) {
        let validPlay = false;
      let currentBoard = tictactoe[`room${data.room}`];
      const tempBoard = currentBoard.split(',');
        if(tempBoard[data.location] !== 'X' && tempBoard[data.location] !== 'O')
        {
            tempBoard[data.location] = data.player;
            validPlay = true;
        }
      currentBoard = tempBoard.join();
      tictactoe[`room${data.room}`] = currentBoard;
      if (checkForWinner(turn, data.room)) {
        io.sockets.in(`room${data.room}`).emit('winner', { player: data.player });
        io.sockets.in(`room${data.room}`).emit('playFromServer', tictactoe[`room${data.room}`]);
        return;
      }
      io.sockets.in(`room${data.room}`).emit('playFromServer', tictactoe[`room${data.room}`]);
        if(validPlay)
        {
            if (turn === 'X') turn = 'O';
            else if (turn === 'O') turn = 'X';
        }
    }
  });
  socket.on('disconnect', () => {
    numOfPlayers--;
  });
});
