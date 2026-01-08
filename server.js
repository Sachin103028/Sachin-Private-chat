const io = require('socket.io')(process.env.PORT || 3000, {
    cors: { origin: "*" }
});

const rooms = {};

io.on('connection', (socket) => {
    socket.on('join-room', (roomCode) => {
        if (!rooms[roomCode]) rooms[roomCode] = [];
        if (rooms[roomCode].length >= 2) return socket.emit('error', 'Room Full');
        
        rooms[roomCode].push(socket.id);
        socket.join(roomCode);
        socket.emit('room-joined');
    });

    socket.on('send-message', (data) => {
        socket.to(data.roomCode).emit('receive-message', { text: data.text });
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(code => {
            if (rooms[code]) {
                rooms[code] = rooms[code].filter(id => id !== socket.id);
                if (rooms[code].length === 0) delete rooms[code];
            }
        });
    });
});
