const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
var bestScoreText = "";
var bestScore = 0;

app.get('/', function(req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function(socket) {
    socket.on('email', function(email) {        
        socket.email = email
        io.emit('is_online', '🔵 <i>' + email + ' joined the game..</i>');
        socket.emit('best_score', bestScoreText);
    });

    socket.on('disconnect', function() {
        io.emit('is_online', '🔴 <i>' + socket.email + ' left the game..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.email + '</strong>: ' + message);
    });

    socket.on('best_score', function(best_score) {
        if(best_score > bestScore){
            bestScoreText = '<strong>' + socket.email + '</strong>: ' + best_score
            bestScore = best_score
            io.emit('best_score', bestScoreText);
        }
    });
});

const server = http.listen(8080, function() {
    console.log('listening on *:8080');
});