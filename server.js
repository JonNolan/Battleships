const express = require('express')
const mysql = require('mysql')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Database info
const dbInfo = {
  host: "localhost",
  user: "root",
  password: "",
  database: "BattleshipsDB"
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

app.get("/getDBTable", getDBTable)
app.get("/updateSuccess", updateSuccess)
app.get("/updateFail", updateFail)
app.get("/enhance", enhance)

// create DB connection
const connection = mysql.createConnection(dbInfo);
connection.connect(function(err) {
  if(err) throw err;
})

// write DB results
function writeResult(res, object) {
  res.writeHead(200, {"Content-Type" : "application/json"});
  res.end(JSON.stringify(object));
}

function getDBTable(req, res) {
  connection.query("SELECT * FROM PossibleMoves", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err})
    else 
      writeResult(res, result)
  })
}

function updateSuccess(req, res) {
  connection.query("UPDATE PossibleMoves SET dSuccessful = dSuccessful + 1, dTotal = dTotal + 1 WHERE Id = " + req.query.dbClassId + ";", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err})
    else 
      writeResult(res, {'success' : 'Success'})
  })
}

function updateFail(req, res) {
  connection.query("UPDATE PossibleMoves SET dTotal = dTotal + 1 WHERE Id = " + req.query.dbClassId + ";", function (err, result, fields) {
    if (err)
      writeResult(res, {'error' : err})
    else 
      writeResult(res, {'success' : 'Success'})
  })
}

function enhance(req, res) {
  if (req.query.level == 1) {
    connection.query("INSERT INTO PossibleMoves(Id, dLeft, dUp, dRight, dDown, dSuccessful, dTotal) VALUES   (1, 'U', 'U', 'U', 'U', 0, 0), (2, 'U', 'U', 'U', 'E', 0, 0), (3, 'U', 'U', 'U', 'S', 0, 0), (4, 'U', 'U', 'E', 'U', 0, 0), (5, 'U', 'U', 'S', 'U', 0, 0), (6, 'U', 'E', 'U', 'U', 0, 0), (7, 'U', 'S', 'U', 'U', 0, 0), (8, 'E', 'U', 'U', 'U', 0, 0), (9, 'S', 'U', 'U', 'U', 0, 0), (10, 'U', 'U', 'E', 'E', 0, 0), (11, 'U', 'U', 'S', 'S', 0, 0), (12, 'U', 'E', 'E', 'U', 0, 0), (13, 'U', 'S', 'S', 'U', 0, 0), (14 , 'E', 'E', 'U', 'U', 0, 0), (15 , 'S', 'S', 'U', 'U', 0, 0), (16 , 'U', 'E', 'E', 'E', 0, 0), (17 , 'U', 'S', 'S', 'S', 0, 0), (18 , 'E', 'E', 'E', 'U', 0, 0), (19 , 'S', 'S', 'S', 'U', 0, 0), (20 , 'E', 'E', 'E', 'E', 0, 0), (21 , 'S', 'S', 'S', 'S', 0, 0), (22 , 'U', 'E', 'U', 'E', 0, 0), (23 , 'U', 'S', 'U', 'S', 0, 0), (24 , 'E', 'U', 'E', 'U', 0, 0), (25 , 'S', 'U', 'S', 'U', 0, 0), (26 , 'E', 'U', 'U', 'E', 0, 0), (27 , 'S', 'U', 'U', 'S', 0, 0), (28 , 'E', 'E', 'U', 'E', 0, 0), (29 , 'S', 'S', 'U', 'S', 0, 0), (30 , 'E', 'U', 'E', 'E', 0, 0), (31 , 'S', 'U', 'S', 'S', 0, 0), (32 , 'U', 'U', 'E', 'S', 0, 0), (33 , 'U', 'U', 'S', 'E', 0, 0), (34 , 'U', 'E', 'S', 'U', 0, 0), (35 , 'U', 'S', 'E', 'U', 0, 0), (36 , 'E', 'S', 'U', 'U', 0, 0), (37 , 'S', 'E', 'U', 'U', 0, 0), (38 , 'E', 'U', 'U', 'S', 0, 0), (39 , 'S', 'U', 'U', 'E', 0, 0), (40 , 'E', 'U', 'S', 'U', 0, 0), (41 , 'S', 'U', 'E', 'U', 0, 0), (42 , 'U', 'E', 'U', 'S', 0, 0), (43 , 'U', 'S', 'U', 'E', 0, 0), (44 , 'E', 'U', 'S', 'S', 0, 0), (45 , 'E', 'U', 'E', 'S', 0, 0), (46 , 'E', 'U', 'S', 'E', 0, 0), (47 , 'S', 'U', 'E', 'E', 0, 0), (48 , 'S', 'U', 'E', 'S', 0, 0), (49 , 'S', 'U', 'S', 'E', 0, 0), (50 , 'E', 'S', 'S', 'U', 0, 0), (51 , 'E', 'E', 'S', 'U', 0, 0), (52 , 'E', 'S', 'E', 'U', 0, 0), (53 , 'S', 'E', 'E', 'U', 0, 0), (54 , 'S', 'E', 'S', 'U', 0, 0), (55 , 'S', 'S', 'E', 'U', 0, 0), (56 , 'U', 'E', 'S', 'S', 0, 0), (57 , 'U', 'E', 'E', 'S', 0, 0), (58 , 'U', 'E', 'S', 'E', 0, 0), (59 , 'U', 'S', 'E', 'E', 0, 0), (60 , 'U', 'S', 'E', 'S', 0, 0), (61 , 'U', 'S', 'S', 'E', 0, 0), (62 , 'E', 'S', 'U', 'S', 0, 0), (63 , 'E', 'E', 'U', 'S', 0, 0), (64 , 'E', 'S', 'U', 'E', 0, 0), (65 , 'S', 'E', 'U', 'E', 0, 0), (66 , 'S', 'E', 'U', 'S', 0, 0), (67 , 'S', 'S', 'U', 'E', 0, 0), (68 , 'E', 'E', 'E', 'S', 0, 0), (69 , 'E', 'E', 'S', 'E', 0, 0), (69 , 'E', 'S', 'E', 'E', 0, 0), (70 , 'S', 'E', 'E', 'E', 0, 0), (71 , 'E', 'E', 'S', 'S', 0, 0), (72 , 'E', 'S', 'S', 'E', 0, 0), (73 , 'E', 'S', 'S', 'S', 0, 0), (74 , 'S', 'S', 'E', 'E', 0, 0), (75 , 'S', 'E', 'E', 'S', 0, 0), (76 , 'S', 'S', 'S', 'E', 0, 0), (77 , 'S', 'S', 'E', 'S', 0, 0), (78 , 'S', 'E', 'S', 'S', 0, 0), (79 , 'E', 'S', 'E', 'S', 0, 0), (80 , 'S', 'E', 'S', 'E', 0, 0), (81 , 'S', 'E', 'S', 'E', 0, 0) ON DUPLICATE KEY UPDATE dLeft=VALUES(dLeft), dUp=VALUES(dUp), dRight=VALUES(dRight), dDown=VALUES(dDown), dSuccessful=VALUES(dSuccessful), dTotal=VALUES(dTotal);", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err})
      else 
        writeResult(res, {'success' : 'Success'})
    })
  } else if (req.query.level == 2) {
    connection.query("INSERT INTO PossibleMoves(Id, dLeft, dUp, dRight, dDown, dSuccessful, dTotal) VALUES   (1, 'U', 'U', 'U', 'U', 114, 681), (2, 'U', 'U', 'U', 'E', 0, 4), (3, 'U', 'U', 'U', 'S', 27, 71), (4, 'U', 'U', 'E', 'U', 12, 96), (5, 'U', 'U', 'S', 'U', 35, 62), (6, 'U', 'E', 'U', 'U', 0, 4), (7, 'U', 'S', 'U', 'U', 0, 1), (8, 'E', 'U', 'U', 'U', 8, 52), (9, 'S', 'U', 'U', 'U', 0, 2), (10, 'U', 'U', 'E', 'E', 3, 45), (11, 'U', 'U', 'S', 'S', 0, 0), (12, 'U', 'E', 'E', 'U', 0, 7), (13, 'U', 'S', 'S', 'U', 0, 0), (14 , 'E', 'E', 'U', 'U', 8, 81), (15 , 'S', 'S', 'U', 'U', 0, 0), (16 , 'U', 'E', 'E', 'E', 1, 16), (17 , 'U', 'S', 'S', 'S', 0, 0), (18 , 'E', 'E', 'E', 'U', 0, 11), (19 , 'S', 'S', 'S', 'U', 0, 0), (20 , 'E', 'E', 'E', 'E', 0, 701), (21 , 'S', 'S', 'S', 'S', 0, 0), (22 , 'U', 'E', 'U', 'E', 15, 706), (23 , 'U', 'S', 'U', 'S', 0, 0), (24 , 'E', 'U', 'E', 'U', 1, 21), (25 , 'S', 'U', 'S', 'U', 3, 5), (26 , 'E', 'U', 'U', 'E', 5, 78), (27 , 'S', 'U', 'U', 'S', 1, 2), (28 , 'E', 'E', 'U', 'E', 0, 19), (29 , 'S', 'S', 'U', 'S', 0, 0), (30 , 'E', 'U', 'E', 'E', 2, 39), (31 , 'S', 'U', 'S', 'S', 0, 0), (32 , 'U', 'U', 'E', 'S', 0, 0), (33 , 'U', 'U', 'S', 'E', 14, 29), (34 , 'U', 'E', 'S', 'U', 0, 0), (35 , 'U', 'S', 'E', 'U', 0, 0), (36 , 'E', 'S', 'U', 'U', 9, 24), (37 , 'S', 'E', 'U', 'U', 16, 35), (38 , 'E', 'U', 'U', 'S', 0, 0), (39 , 'S', 'U', 'U', 'E', 15, 43), (40 , 'E', 'U', 'S', 'U', 0, 1), (41 , 'S', 'U', 'E', 'U', 0, 0), (42 , 'U', 'E', 'U', 'S', 0, 2), (43 , 'U', 'S', 'U', 'E', 1, 19), (44 , 'E', 'U', 'S', 'S', 2, 2), (45 , 'E', 'U', 'E', 'S', 6, 23), (46 , 'E', 'U', 'S', 'E', 8, 17), (47 , 'S', 'U', 'E', 'E', 6, 70), (48 , 'S', 'U', 'E', 'S', 2, 3), (49 , 'S', 'U', 'S', 'E', 0, 0), (50 , 'E', 'S', 'S', 'U', 0, 0), (51 , 'E', 'E', 'S', 'U', 4, 18), (52 , 'E', 'S', 'E', 'U', 16, 38), (53 , 'S', 'E', 'E', 'U', 0, 1), (54 , 'S', 'E', 'S', 'U', 0, 0), (55 , 'S', 'S', 'E', 'U', 0, 0), (56 , 'U', 'E', 'S', 'S', 0, 0), (57 , 'U', 'E', 'E', 'S', 4, 19), (58 , 'U', 'E', 'S', 'E', 0, 2), (59 , 'U', 'S', 'E', 'E', 3, 15), (60 , 'U', 'S', 'E', 'S', 2, 2), (61 , 'U', 'S', 'S', 'E', 0, 0), (62 , 'E', 'S', 'U', 'S', 4, 4), (63 , 'E', 'E', 'U', 'S', 1, 11), (64 , 'E', 'S', 'U', 'E', 6, 15), (65 , 'S', 'E', 'U', 'E', 0, 2), (66 , 'S', 'E', 'U', 'S', 0, 0), (67 , 'S', 'S', 'U', 'E', 0, 0), (68 , 'E', 'E', 'E', 'S', 3, 31), (69 , 'E', 'E', 'S', 'E', 3, 19), (70 , 'E', 'S', 'E', 'E', 4, 23), (71 , 'S', 'E', 'E', 'E', 6, 70), (72 , 'E', 'E', 'S', 'S', 0, 1), (73 , 'E', 'S', 'S', 'E', 0, 0), (74 , 'E', 'S', 'S', 'S', 1, 1), (75 , 'S', 'S', 'E', 'E', 0, 0), (76 , 'S', 'E', 'E', 'S', 0, 0), (77 , 'S', 'S', 'S', 'E', 0, 0), (78 , 'S', 'S', 'E', 'S', 0, 0), (79 , 'S', 'E', 'S', 'S', 0, 0), (80 , 'E', 'S', 'E', 'S', 7, 8), (81 , 'S', 'E', 'S', 'E', 70, 70) ON DUPLICATE KEY UPDATE dLeft=VALUES(dLeft), dUp=VALUES(dUp), dRight=VALUES(dRight), dDown=VALUES(dDown), dSuccessful=VALUES(dSuccessful), dTotal=VALUES(dTotal);", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err})
      else 
        writeResult(res, {'success' : 'Success'})
    })
  } else if (req.query.level == 3) {
    connection.query(";", function (err, result, fields) {
      if (err)
        writeResult(res, {'error' : err})
      else 
        writeResult(res, {'success' : 'Success'})
    })
  }
}

// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
    //console.log('New WS Connection')

    // Find an available player number
    let playerIndex = -1;
    for (const i in connections) {
        if (connections[i] === null) {
            playerIndex = i
            break
        }
    }

    // Tell the connecting client what player number they are
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    // Ignore player 3
    if (playerIndex === -1) return

    connections[playerIndex] = false

    // Tell everyone what player number just connected
    socket.broadcast.emit('player-connection', playerIndex)

    // Handle Disconnect
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected.`)
        connections[playerIndex] = null

        // Tell everyone what player just disconnected
        socket.broadcast.emit('player-connection', playerIndex)
    })

    // On ready
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    // Check Player connections
    socket.on('check-players', () => {
        const players = []
        for (const i in connections) {
            connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
        }
        socket.emit('check-players', players)
    })

    // On Fire Received
    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id)

        // Emit the move to the other player
        socket.broadcast.emit('fire', id)
    })

    // On Fire Reply
    socket.on('fire-reply', square => {
        console.log(square)

        //Forward the reply to the other player
        socket.broadcast.emit('fire-reply', square)
    })

    // Timeout connection
    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 600000) // 10 minute limit per player
})