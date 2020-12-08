const express = require('express');
const mysql = require('mysql');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 3000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set database info
const dbInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "BattleshipsDB"
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/getDBTable", getDBTable);
app.get("/updateSuccess", updateSuccess);
app.get("/updateFail", updateFail);
app.get("/enhance", enhance);

// Create DB connection
const connection = mysql.createConnection(dbInfo);
connection.connect(function(err) {
  if(err) throw err;
})

// Write DB results
function writeResult(res, object) {
  res.writeHead(200, {"Content-Type" : "application/json"});
  res.end(JSON.stringify(object));
}

// Get and return list of possible square classes
function getDBTable(req, res) {
  connection.query("SELECT * FROM PossibleMoves", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err});
    else 
      writeResult(res, result);
  })
}

// Update the success and total of item in possible square table
function updateSuccess(req, res) {
  connection.query("UPDATE PossibleMoves SET dSuccessful = dSuccessful + 1, dTotal = dTotal + 1 WHERE Id = " + req.query.dbClassId + ";", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err});
    else 
      writeResult(res, {'success' : 'Success'});
  })
}

// Update total of item in possible square table
function updateFail(req, res) {
  connection.query("UPDATE PossibleMoves SET dTotal = dTotal + 1 WHERE Id = " + req.query.dbClassId + ";", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err});
    else 
      writeResult(res, {'success' : 'Success'});
  })
}

// Insert query for increasing difficulty of the AI
function enhance(req, res) {
  if (req.query.level == 1) {
    connection.query("INSERT INTO PossibleMoves(Id, dLeft, dUp, dRight, dDown, dSuccessful, dTotal) VALUES   (1, 'U', 'U', 'U', 'U', 0, 0), (2, 'U', 'U', 'U', 'E', 0, 0), (3, 'U', 'U', 'U', 'S', 0, 0), (4, 'U', 'U', 'E', 'U', 0, 0), (5, 'U', 'U', 'S', 'U', 0, 0), (6, 'U', 'E', 'U', 'U', 0, 0), (7, 'U', 'S', 'U', 'U', 0, 0), (8, 'E', 'U', 'U', 'U', 0, 0), (9, 'S', 'U', 'U', 'U', 0, 0), (10, 'U', 'U', 'E', 'E', 0, 0), (11, 'U', 'U', 'S', 'S', 0, 0), (12, 'U', 'E', 'E', 'U', 0, 0), (13, 'U', 'S', 'S', 'U', 0, 0), (14 , 'E', 'E', 'U', 'U', 0, 0), (15 , 'S', 'S', 'U', 'U', 0, 0), (16 , 'U', 'E', 'E', 'E', 0, 0), (17 , 'U', 'S', 'S', 'S', 0, 0), (18 , 'E', 'E', 'E', 'U', 0, 0), (19 , 'S', 'S', 'S', 'U', 0, 0), (20 , 'E', 'E', 'E', 'E', 0, 0), (21 , 'S', 'S', 'S', 'S', 0, 0), (22 , 'U', 'E', 'U', 'E', 0, 0), (23 , 'U', 'S', 'U', 'S', 0, 0), (24 , 'E', 'U', 'E', 'U', 0, 0), (25 , 'S', 'U', 'S', 'U', 0, 0), (26 , 'E', 'U', 'U', 'E', 0, 0), (27 , 'S', 'U', 'U', 'S', 0, 0), (28 , 'E', 'E', 'U', 'E', 0, 0), (29 , 'S', 'S', 'U', 'S', 0, 0), (30 , 'E', 'U', 'E', 'E', 0, 0), (31 , 'S', 'U', 'S', 'S', 0, 0), (32 , 'U', 'U', 'E', 'S', 0, 0), (33 , 'U', 'U', 'S', 'E', 0, 0), (34 , 'U', 'E', 'S', 'U', 0, 0), (35 , 'U', 'S', 'E', 'U', 0, 0), (36 , 'E', 'S', 'U', 'U', 0, 0), (37 , 'S', 'E', 'U', 'U', 0, 0), (38 , 'E', 'U', 'U', 'S', 0, 0), (39 , 'S', 'U', 'U', 'E', 0, 0), (40 , 'E', 'U', 'S', 'U', 0, 0), (41 , 'S', 'U', 'E', 'U', 0, 0), (42 , 'U', 'E', 'U', 'S', 0, 0), (43 , 'U', 'S', 'U', 'E', 0, 0), (44 , 'E', 'U', 'S', 'S', 0, 0), (45 , 'E', 'U', 'E', 'S', 0, 0), (46 , 'E', 'U', 'S', 'E', 0, 0), (47 , 'S', 'U', 'E', 'E', 0, 0), (48 , 'S', 'U', 'E', 'S', 0, 0), (49 , 'S', 'U', 'S', 'E', 0, 0), (50 , 'E', 'S', 'S', 'U', 0, 0), (51 , 'E', 'E', 'S', 'U', 0, 0), (52 , 'E', 'S', 'E', 'U', 0, 0), (53 , 'S', 'E', 'E', 'U', 0, 0), (54 , 'S', 'E', 'S', 'U', 0, 0), (55 , 'S', 'S', 'E', 'U', 0, 0), (56 , 'U', 'E', 'S', 'S', 0, 0), (57 , 'U', 'E', 'E', 'S', 0, 0), (58 , 'U', 'E', 'S', 'E', 0, 0), (59 , 'U', 'S', 'E', 'E', 0, 0), (60 , 'U', 'S', 'E', 'S', 0, 0), (61 , 'U', 'S', 'S', 'E', 0, 0), (62 , 'E', 'S', 'U', 'S', 0, 0), (63 , 'E', 'E', 'U', 'S', 0, 0), (64 , 'E', 'S', 'U', 'E', 0, 0), (65 , 'S', 'E', 'U', 'E', 0, 0), (66 , 'S', 'E', 'U', 'S', 0, 0), (67 , 'S', 'S', 'U', 'E', 0, 0), (68 , 'E', 'E', 'E', 'S', 0, 0), (69 , 'E', 'E', 'S', 'E', 0, 0), (69 , 'E', 'S', 'E', 'E', 0, 0), (70 , 'S', 'E', 'E', 'E', 0, 0), (71 , 'E', 'E', 'S', 'S', 0, 0), (72 , 'E', 'S', 'S', 'E', 0, 0), (73 , 'E', 'S', 'S', 'S', 0, 0), (74 , 'S', 'S', 'E', 'E', 0, 0), (75 , 'S', 'E', 'E', 'S', 0, 0), (76 , 'S', 'S', 'S', 'E', 0, 0), (77 , 'S', 'S', 'E', 'S', 0, 0), (78 , 'S', 'E', 'S', 'S', 0, 0), (79 , 'E', 'S', 'E', 'S', 0, 0), (80 , 'S', 'E', 'S', 'E', 0, 0), (81 , 'S', 'E', 'S', 'E', 0, 0) ON DUPLICATE KEY UPDATE dLeft=VALUES(dLeft), dUp=VALUES(dUp), dRight=VALUES(dRight), dDown=VALUES(dDown), dSuccessful=VALUES(dSuccessful), dTotal=VALUES(dTotal);", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err});
      else 
        writeResult(res, {'success' : 'Success'});
    })
  } else if (req.query.level == 2) {
    connection.query("INSERT INTO PossibleMoves(Id, dLeft, dUp, dRight, dDown, dSuccessful, dTotal) VALUES   (1, 'U', 'U', 'U', 'U', 166, 1117), (2, 'U', 'U', 'U', 'E', 0, 4), (3, 'U', 'U', 'U', 'S', 56, 130), (4, 'U', 'U', 'E', 'U', 32, 219), (5, 'U', 'U', 'S', 'U', 52, 104), (6, 'U', 'E', 'U', 'U', 0, 4), (7, 'U', 'S', 'U', 'U', 0, 1), (8, 'E', 'U', 'U', 'U', 29, 197), (9, 'S', 'U', 'U', 'U', 0, 2), (10, 'U', 'U', 'E', 'E', 3, 55), (11, 'U', 'U', 'S', 'S', 0, 0), (12, 'U', 'E', 'E', 'U', 0, 7), (13, 'U', 'S', 'S', 'U', 0, 0), (14 , 'E', 'E', 'U', 'U', 9, 132), (15 , 'S', 'S', 'U', 'U', 0, 0), (16 , 'U', 'E', 'E', 'E', 6, 79), (17 , 'U', 'S', 'S', 'S', 0, 0), (18 , 'E', 'E', 'E', 'U', 0, 11), (19 , 'S', 'S', 'S', 'U', 0, 0), (20 , 'E', 'E', 'E', 'E', 0, 737), (21 , 'S', 'S', 'S', 'S', 0, 0), (22 , 'U', 'E', 'U', 'E', 17, 709), (23 , 'U', 'S', 'U', 'S', 0, 0), (24 , 'E', 'U', 'E', 'U', 5, 44), (25 , 'S', 'U', 'S', 'U', 7, 11), (26 , 'E', 'U', 'U', 'E', 8, 118), (27 , 'S', 'U', 'U', 'S', 4, 9), (28 , 'E', 'E', 'U', 'E', 11, 134), (29 , 'S', 'S', 'U', 'S', 0, 0), (30 , 'E', 'U', 'E', 'E', 2, 59), (31 , 'S', 'U', 'S', 'S', 0, 0), (32 , 'U', 'U', 'E', 'S', 0, 0), (33 , 'U', 'U', 'S', 'E', 20, 49), (34 , 'U', 'E', 'S', 'U', 0, 0), (35 , 'U', 'S', 'E', 'U', 0, 0), (36 , 'E', 'S', 'U', 'U', 19, 53), (37 , 'S', 'E', 'U', 'U', 29, 63), (38 , 'E', 'U', 'U', 'S', 0, 1), (39 , 'S', 'U', 'U', 'E', 38, 94), (40 , 'E', 'U', 'S', 'U', 0, 1), (41 , 'S', 'U', 'E', 'U', 0, 0), (42 , 'U', 'E', 'U', 'S', 0, 2), (43 , 'U', 'S', 'U', 'E', 1, 20), (44 , 'E', 'U', 'S', 'S', 3, 4), (45 , 'E', 'U', 'E', 'S', 26, 61), (46 , 'E', 'U', 'S', 'E', 11, 32), (47 , 'S', 'U', 'E', 'E', 11, 87), (48 , 'S', 'U', 'E', 'S', 6, 10), (49 , 'S', 'U', 'S', 'E', 0, 0), (50 , 'E', 'S', 'S', 'U', 0, 0), (51 , 'E', 'E', 'S', 'U', 5, 28), (52 , 'E', 'S', 'E', 'U', 26, 62), (53 , 'S', 'E', 'E', 'U', 0, 1), (54 , 'S', 'E', 'S', 'U', 0, 0), (55 , 'S', 'S', 'E', 'U', 0, 0), (56 , 'U', 'E', 'S', 'S', 0, 0), (57 , 'U', 'E', 'E', 'S', 12, 39), (58 , 'U', 'E', 'S', 'E', 0, 2), (59 , 'U', 'S', 'E', 'E', 8, 43), (60 , 'U', 'S', 'E', 'S', 9, 9), (61 , 'U', 'S', 'S', 'E', 0, 0), (62 , 'E', 'S', 'U', 'S', 9, 9), (63 , 'E', 'E', 'U', 'S', 5, 26), (64 , 'E', 'S', 'U', 'E', 17, 34), (65 , 'S', 'E', 'U', 'E', 17, 30), (66 , 'S', 'E', 'U', 'S', 0, 0), (67 , 'S', 'S', 'U', 'E', 0, 0), (68 , 'E', 'E', 'E', 'S', 6, 56), (69 , 'E', 'E', 'S', 'E', 3, 42), (70 , 'E', 'S', 'E', 'E', 8, 35), (71 , 'S', 'E', 'E', 'E', 11, 94), (72 , 'E', 'E', 'S', 'S', 0, 1), (73 , 'E', 'S', 'S', 'E', 0, 1), (74 , 'E', 'S', 'S', 'S', 2, 2), (75 , 'S', 'S', 'E', 'E', 0, 0), (76 , 'S', 'E', 'E', 'S', 2, 4), (77 , 'S', 'S', 'S', 'E', 0, 0), (78 , 'S', 'S', 'E', 'S', 0, 0), (79 , 'S', 'E', 'S', 'S', 0, 0), (80 , 'E', 'S', 'E', 'S', 7, 8), (81 , 'S', 'E', 'S', 'E', 78, 79) ON DUPLICATE KEY UPDATE dLeft=VALUES(dLeft), dUp=VALUES(dUp), dRight=VALUES(dRight), dDown=VALUES(dDown), dSuccessful=VALUES(dSuccessful), dTotal=VALUES(dTotal);", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err});
      else 
        writeResult(res, {'success' : 'Success'});
    })
  } else if (req.query.level == 3) {
    connection.query("INSERT INTO PossibleMoves(Id, dLeft, dUp, dRight, dDown, dSuccessful, dTotal) VALUES   (1, 'U', 'U', 'U', 'U', 316, 2776), (2, 'U', 'U', 'U', 'E', 33, 296), (3, 'U', 'U', 'U', 'S', 149, 339), (4, 'U', 'U', 'E', 'U', 71, 627), (5, 'U', 'U', 'S', 'U', 183, 348), (6, 'U', 'E', 'U', 'U', 75, 602), (7, 'U', 'S', 'U', 'U', 40, 77), (8, 'E', 'U', 'U', 'U', 105, 926), (9, 'S', 'U', 'U', 'U', 73, 123), (10, 'U', 'U', 'E', 'E', 12, 136), (11, 'U', 'U', 'S', 'S', 0, 0), (12, 'U', 'E', 'E', 'U', 0, 7), (13, 'U', 'S', 'S', 'U', 0, 0), (14 , 'E', 'E', 'U', 'U', 27, 323), (15 , 'S', 'S', 'U', 'U', 6, 6), (16 , 'U', 'E', 'E', 'E', 10, 152), (17 , 'U', 'S', 'S', 'S', 2, 2), (18 , 'E', 'E', 'E', 'U', 0, 12), (19 , 'S', 'S', 'S', 'U', 0, 0), (20 , 'E', 'E', 'E', 'E', 0, 818), (21 , 'S', 'S', 'S', 'S', 10, 10), (22 , 'U', 'E', 'U', 'E', 17, 709), (23 , 'U', 'S', 'U', 'S', 0, 0), (24 , 'E', 'U', 'E', 'U', 17, 204), (25 , 'S', 'U', 'S', 'U', 20, 24), (26 , 'E', 'U', 'U', 'E', 25, 343), (27 , 'S', 'U', 'U', 'S', 30, 40), (28 , 'E', 'E', 'U', 'E', 73, 787), (29 , 'S', 'S', 'U', 'S', 0, 0), (30 , 'E', 'U', 'E', 'E', 4, 127), (31 , 'S', 'U', 'S', 'S', 0, 0), (32 , 'U', 'U', 'E', 'S', 0, 0), (33 , 'U', 'U', 'S', 'E', 38, 101), (34 , 'U', 'E', 'S', 'U', 0, 0), (35 , 'U', 'S', 'E', 'U', 0, 0), (36 , 'E', 'S', 'U', 'U', 74, 201), (37 , 'S', 'E', 'U', 'U', 111, 221), (38 , 'E', 'U', 'U', 'S', 4, 14), (39 , 'S', 'U', 'U', 'E', 144, 275), (40 , 'E', 'U', 'S', 'U', 3, 10), (41 , 'S', 'U', 'E', 'U', 10, 29), (42 , 'U', 'E', 'U', 'S', 0, 2), (43 , 'U', 'S', 'U', 'E', 23, 98), (44 , 'E', 'U', 'S', 'S', 15, 25), (45 , 'E', 'U', 'E', 'S', 67, 221), (46 , 'E', 'U', 'S', 'E', 22, 87), (47 , 'S', 'U', 'E', 'E', 44, 175), (48 , 'S', 'U', 'E', 'S', 20, 28), (49 , 'S', 'U', 'S', 'E', 0, 0), (50 , 'E', 'S', 'S', 'U', 0, 0), (51 , 'E', 'E', 'S', 'U', 27, 82), (52 , 'E', 'S', 'E', 'U', 96, 207), (53 , 'S', 'E', 'E', 'U', 0, 1), (54 , 'S', 'E', 'S', 'U', 0, 0), (55 , 'S', 'S', 'E', 'U', 2, 4), (56 , 'U', 'E', 'S', 'S', 0, 0), (57 , 'U', 'E', 'E', 'S', 31, 109), (58 , 'U', 'E', 'S', 'E', 0, 2), (59 , 'U', 'S', 'E', 'E', 21, 95), (60 , 'U', 'S', 'E', 'S', 28, 42), (61 , 'U', 'S', 'S', 'E', 11, 16), (62 , 'E', 'S', 'U', 'S', 21, 30), (63 , 'E', 'E', 'U', 'S', 33, 114), (64 , 'E', 'S', 'U', 'E', 35, 109), (65 , 'S', 'E', 'U', 'E', 171, 252), (66 , 'S', 'E', 'U', 'S', 13, 17), (67 , 'S', 'S', 'U', 'E', 0, 0), (68 , 'E', 'E', 'E', 'S', 24, 141), (69 , 'E', 'E', 'S', 'E', 15, 110), (70 , 'E', 'S', 'E', 'E', 23, 123), (71 , 'S', 'E', 'E', 'E', 45, 190), (72 , 'E', 'E', 'S', 'S', 0, 1), (73 , 'E', 'S', 'S', 'E', 3, 8), (74 , 'E', 'S', 'S', 'S', 5, 6), (75 , 'S', 'S', 'E', 'E', 10, 15), (76 , 'S', 'E', 'E', 'S', 5, 11), (77 , 'S', 'S', 'S', 'E', 7, 7), (78 , 'S', 'S', 'E', 'S', 6, 8), (79 , 'S', 'E', 'S', 'S', 4, 4), (80 , 'E', 'S', 'E', 'S', 7, 9), (81 , 'S', 'E', 'S', 'E', 95, 98) ON DUPLICATE KEY UPDATE dLeft=VALUES(dLeft), dUp=VALUES(dUp), dRight=VALUES(dRight), dDown=VALUES(dDown), dSuccessful=VALUES(dSuccessful), dTotal=VALUES(dTotal);", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err});
      else 
        writeResult(res, {'success' : 'Success'});
    })
  }
}

// Handle a socket connection request from web client
const connections = [null, null];

io.on('connection', socket => {
    // Alert that a new socket connection has been innitiated
    console.log('New WebSocket Connection')

    // Find an available player number
    let playerIndex = -1;
    for (const i in connections) {
        if (connections[i] === null) {
            playerIndex = i;
            break;
        }
    }

    // Tell the connecting client what player number they are
    socket.emit('player-number', playerIndex);

    console.log(`Player ${playerIndex} has connected`);

    // If more than 2 people join the server ->
    if (playerIndex === -1) return;

    connections[playerIndex] = false;

    // Tell everyone what player number just connected
    socket.broadcast.emit('player-connection', playerIndex)

    // If someone disconnects ->
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected.`)
        connections[playerIndex] = null;

        // Tell everyone what player just disconnected
        socket.broadcast.emit('player-connection', playerIndex);
    })

    // When a player is ready ->
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex);
        connections[playerIndex] = true;
    })

    // When a player checks player connections ->
    socket.on('check-players', () => {
        const players = [];
        for (const i in connections) {
            connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]});
        }
        // Forward the reply to the other player
        socket.emit('check-players', players);
    })

    // When a player fires ->
    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id);

        // Emit the move to the other player
        socket.broadcast.emit('fire', id);
    })

    // When a player responds to being fire upon ->
    socket.on('fire-reply', square => {
        console.log(square);

        // Forward the reply to the other player
        socket.broadcast.emit('fire-reply', square);
    })

    // Timeout connection
    setTimeout(() => {
        connections[playerIndex] = null;
        socket.emit('timeout');
        socket.disconnect();
    }, 600000); // 10 minute limit per player
})