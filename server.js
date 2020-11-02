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