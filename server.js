const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Ludo Carrom Server LIVE - 4 Player Ready!');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

let rooms = {};

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  socket.on('join_room', (data) => {
    const roomId = data.roomId;
    socket.join(roomId);
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push({ id: socket.id, name: data.playerName });
    io.to(roomId).emit('player_joined', { players: rooms[roomId] });
  });

  socket.on('dice_roll', (data) => {
    io.to(data.roomId).emit('dice_result', data);
  });

  socket.on('goti_move', (data) => {
    io.to(data.roomId).emit('goti_moved', data);
  });

  socket.on('carrom_move', (data) => {
    io.to(data.roomId).emit('carrom_moved', data);
  });

  socket.on('disconnect', () => {
    for (let r in rooms) {
      rooms[r] = rooms[r].filter(p => p.id!= socket.id);
      io.to(r).emit('player_left', { players: rooms[r] });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server LIVE on ' + PORT));
