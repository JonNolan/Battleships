document.addEventListener('DOMContentLoaded', () => {
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer-container')
  const submarine = document.querySelector('.submarine-container')
  const cruiser = document.querySelector('.cruiser-container')
  const battleship = document.querySelector('.battleship-container')
  const carrier = document.querySelector('.carrier-container')
  const startButton = document.querySelector('#start')
  const rotateButton = document.querySelector('#rotate')
  const turnDisplay = document.querySelector('#whose-go')
  const infoDisplay = document.querySelector('#info')
  const setupButtons = document.getElementById('setup-buttons')
  const userSquares = []
  const computerSquares = []
  const width = 10
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  let playerNum = 0
  let ready = false
  let enemyReady = false
  let allShipsPlaced = false
  let shotFired = -1
  let squaresModel = []
  let possibleMovesModel = []
  let possibleTargetsModel = []
  let possibleHighTargetsModel = []
  let mostSuccessfulClasses = []
  let enhancement = 0

  // Ships
  const shipArray = [
    {
      name: 'destroyer',
      directions: [
        [0, 1],
        [0, width]
      ]
    },
    {
      name: 'submarine',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'cruiser',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    },
    {
      name: 'battleship',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    },
    {
      name: 'carrier',
      directions: [
        [0, 1, 2, 3, 4],
        [0, width, width*2, width*3, width*4]
      ]
    },
  ]

  createBoard(userGrid, userSquares)
  createBoard(computerGrid, computerSquares)

  // Select Player Mode
  if (gameMode === 'singlePlayer') {
    startSinglePlayer()
  } else {
    startMultiPlayer()
  }

  // Multiplayer
  function startMultiPlayer() {
    const socket = io()

    // Get your player number
    socket.on('player-number', num => {
      if (num == -1) {
        infoDisplay.innerHTML = 'Sorry, the server is full.'
      } else {
        playerNum = parseInt(num)
        if(playerNum == 1) currentPlayer = 'enemy'

        console.log(playerNum)

        // Get other player's status
        socket.emit('check-players')
      }
    })

    // Another player has connected or disconnected
    socket.on('player-connection', num => {
      console.log(`Player number ${num} has connected or disconnected.`)
      playerConnectedOrDisconnected(num)
    })

    // On enemy ready
    socket.on('enemy-ready', num => {
      enemyReady = true
      playerReady(num)
      if (ready) {
        playGameMulti(socket)
        setupButtons.style.display = 'none'
      }
    })

    // Check player status
    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if (p.connected) playerConnectedOrDisconnected(i)
        if(p.ready) {
          playerReady(i)
          if(i != playerNum) enemyReady = true
        }
      })
    })

    // On Timeout
    socket.on('timeout', () => {
      infoDisplay.innerHTML = 'Your have reached the 10 minute limit'
    })

    // Ready button click
    startButton.addEventListener('click', () => {
      if (allShipsPlaced) playGameMulti(socket)
      else infoDisplay.innerHTML = 'Please place all ships.'
    })

    // Setup event listeners for firing
    computerSquares.forEach(square => {
      square.addEventListener('click', () => {
        if (currentPlayer == 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire', shotFired)
        }
      })
    })

    // On Fire Received
    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      playGameMulti(socket)
    })

    // On Fire reply recieved
    socket.on('fire-reply', classList => {
      revealSquare(classList)
      playGameMulti(socket)
    })

    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) +1}`
      document.querySelector(`${player} .connected`).classList.toggle('active')
      if(parseInt(num) == playerNum) document.querySelector(player).style.fontWeight = 'bold'
    }
  }

  // Single Player
  function startSinglePlayer() {
    generate(shipArray[0])
    generate(shipArray[1])
    generate(shipArray[2])
    generate(shipArray[3])
    generate(shipArray[4])

    startButton.addEventListener('click', () => {
      setupButtons.style.display = 'none'
      playGameSingle()
    })
  }

  // Create Board
  function createBoard(grid, squares) {
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement('div')
      square.dataset.id = i
      grid.appendChild(square)
      squares.push(square)
    }
  }

  // Draw the computers ships in random locations
  function generate(ship) {
    let randomDirection = Math.floor(Math.random() * ship.directions.length)
    let current = ship.directions[randomDirection]
    if (randomDirection == 0) direction = 1
    if (randomDirection == 1) direction = 10
    let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

    const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
    const isAtRightEdge = current.some(index => (randomStart + index) % width == width - 1)
    const isAtLeftEdge = current.some(index => (randomStart + index) % width == 0)

    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))
    else generate(ship)
  }



  // Rotate the ships
  function rotate() {
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = false
      console.log(isHorizontal)
      return
    }
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical')
      submarine.classList.toggle('submarine-container-vertical')
      cruiser.classList.toggle('cruiser-container-vertical')
      battleship.classList.toggle('battleship-container-vertical')
      carrier.classList.toggle('carrier-container-vertical')
      isHorizontal = true
      console.log(isHorizontal)
      return
    }
  }
  rotateButton.addEventListener('click', rotate)

  // Drag and Drop user ships
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragStart', dragStart))
  userSquares.forEach(square => square.addEventListener('dragover', dragOver))
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
  userSquares.forEach(square => square.addEventListener('drop', dragDrop))
  userSquares.forEach(square => square.addEventListener('dragged', dragEnd))

  let selectedShipNameWithIndex
  let draggedShip
  let draggedShipLength

  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id
    console.log(selectedShipNameWithIndex)
  }))

  function dragStart() {
    draggedShip = this
    draggedShipLength = this.childNodes.length
    console.log(draggedShip)
  }

  function dragOver(e) {
    e.preventDefault()
  }

  function dragEnter(e) {
    e.preventDefault()
  }

  function dragLeave() {
    console.log('drag leave')
  }

  function dragDrop() {
    let shipNameWithLastId = draggedShip.lastChild.id
    let shipClass = shipNameWithLastId.slice(0, -2)
    console.log(shipClass)
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
    let shipLastId = lastShipIndex + parseInt(this.dataset.id)
    console.log(shipLastId)
    const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
    const notAllowedVertical  = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
    let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)

    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

    shipLastId = shipLastId - selectedShipIndex
    console.log(shipLastId)

    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass
        if (i == 0) directionClass = 'start'
        if (i == draggedShipLength - 1) directionClass = 'end' 
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
      }
    } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass
        if (i == 0) directionClass = 'start'
        if (i == draggedShipLength - 1) directionClass = 'end' 
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width * i].classList.add('taken', 'vertical', directionClass, shipClass)
      }
    } else return
    displayGrid.removeChild(draggedShip)
    if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
  }

  function dragEnd() {
    console.log('dragend')
  }

  // Game Logic for Multi Player
  function playGameMulti(socket) {
    setupButtons.style.display = 'none'
    if (isGameOver) return
    if (!ready) {
      socket.emit('player-ready')
      ready = true
      playerReady(playerNum)
    }

    if (enemyReady) {
      if(currentPlayer == 'user') {
        turnDisplay.innerHTML = 'Your turn.'
      }
      if (currentPlayer == 'enemy') {
        turnDisplay.innerHTML = 'Enemy\'s turn.'
      }
    }
  }

  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`
    document.querySelector(`${player} .ready`).classList.toggle('active')
  }

  // populate model of squares
  function initializeSquaresModel(_callback) {
    userSquares.forEach(square => {
      let id = parseInt(square.dataset.id)
      let dbClassId = 0
      let squareStatus = "U"

      if (id == 0) {
        dbClassId = 14
      } else if (id == 9) {
        dbClassId = 12
      } else if (id == 90) {
        dbClassId = 26
      } else if (id == 99) {
        dbClassId = 10
      } else if (id == 1 || id == 2 || id == 3 || id == 4 || id == 5 || id == 6 || id == 7 || id == 8) {
        dbClassId = 6
      } else if (id == 91 || id == 92 || id == 93 || id == 94 || id == 95 || id == 96 || id == 97 || id == 98) {
        dbClassId = 2
      } else if (id == 10 || id == 20 || id == 30 || id == 40 || id == 50 || id == 60 || id == 70 || id == 80) {
        dbClassId = 8
      } else if (id == 19  || id == 29 || id == 39 || id == 49 || id == 59 || id == 69 || id == 79 || id == 89) {
        dbClassId = 4
      } else {
        dbClassId = 1
      }

      squaresModel.push({id : id, dbClassId : dbClassId, squareStatus : squareStatus})
    })
    console.log("Squares Model: ")
    console.log(squaresModel)
    _callback()
  }

  // populate model of possibleMoves
  function populatePossibleMoves(_callback) {
    possibleMovesModel = new Array()
    $.getJSON('/getDBTable', function(data) {
      data.forEach(obj => {
        let id = obj.Id
        let dLeft = obj.dLeft
        let dUp = obj.dUp
        let dRight = obj.dRight
        let dDown = obj.dDown
        let dSuccessful = obj.dSuccessful
        let dTotal = obj.dTotal
        possibleMovesModel.push({id : id, dLeft : dLeft, dUp : dUp, dRight : dRight, dDown : dDown, dSuccessful : dSuccessful, dTotal : dTotal})
      })
      console.log("possibleMoves: ")
      console.log(possibleMovesModel)
      _callback(data)
    })
  }

  // populate possibleTargets model
  function populateTargets(_callback) {
    possibleTargetsModel = new Array()
    for (let i = 0; i < squaresModel.length; i++) {
      if (squaresModel[i].squareStatus == "U") {
        let id = squaresModel[i].id
        let dbClassId = squaresModel[i].dbClassId
        let result = {id : id, dbClassId : dbClassId}
        possibleTargetsModel.push(result)
      }
    }
    console.log("PossibleTargets: ")
    console.log(possibleTargetsModel)
    _callback()
  }

  // populate possibleHighTargets model
  function populateHighTargets() {
    possibleHighTargetsModel = new Array()
    let stack = []
    let highestSuccess
    // cycle through to make stack of success and sort
    for (let i = 0; i < 81; i++) {
      let successRate = 0
      if (possibleMovesModel[i].dSuccessful == 0 && possibleMovesModel[i].dTotal == 0) {
        successRate = 0
      } else {
        successRate = possibleMovesModel[i].dSuccessful / possibleMovesModel[i].dTotal
      }
      stack.push(successRate)
    }
    console.log("successStack: ")
    console.log(stack)
    stack.sort()
    console.log("sortedStack: ")
    console.log(stack)
    highestSuccess = stack.pop()
    do {
      // cycle through to find the highest successRate of available targets
      mostSuccessfulClasses = new Array()
      for (let i = 0; i < 81; i++) {
        let successRate = 0
        if (possibleMovesModel[i].dSuccessful == 0 && possibleMovesModel[i].dTotal == 0) {
          successRate = 0
        } else {
          successRate = possibleMovesModel[i].dSuccessful / possibleMovesModel[i].dTotal
        }
        if (successRate == highestSuccess) {
          let id = possibleMovesModel[i].id
          mostSuccessfulClasses.push({id : id, successRate : successRate})
        }
      }
      for (let i = 0; i < possibleTargetsModel.length; i++) {
        for (let j = 0; j < mostSuccessfulClasses.length; j++) {
          if (possibleTargetsModel[i].dbClassId == mostSuccessfulClasses[j].id) {
            possibleHighTargetsModel.push(possibleTargetsModel[i])
          }
        }
      }
      highestSuccess = stack.pop()
    } while (possibleHighTargetsModel.length == 0)
    console.log("Most Successful Classes: ")
    console.log(mostSuccessfulClasses)
    console.log("Possible High Targets Model: ")
    console.log(possibleHighTargetsModel)
  }

  // investigate surroundig squares and update
  function lookAtSurrounding(targetId) {
    if (targetId == 9 || targetId == 19 || targetId == 29 || targetId == 39 || targetId == 49 || targetId == 59 || targetId == 69 || targetId == 79 || targetId == 89 || targetId == 99) {
      change(targetId - 1)
      if (targetId == 9) {
        change(targetId + 10)
      } else if (targetId == 99) {
        change(targetId - 10)
      } else {
        change(targetId - 10)
        change(targetId + 10)
      }
    } else if (targetId == 0 || targetId == 10 || targetId == 20 || targetId == 30 || targetId == 40 || targetId == 50 || targetId == 60 || targetId == 70 || targetId == 80 || targetId == 90) {
      change(targetId + 1)
      if (targetId == 0) {
        change(targetId + 10)
      } else if (targetId == 90) {
        change(targetId - 10)
      } else {
        change(targetId - 10)
        change(targetId + 10)
      }
    } else if (targetId == 1 || targetId == 2 || targetId == 3 || targetId == 4 || targetId == 5 || targetId == 6 || targetId == 7 || targetId == 8) {
      change(targetId - 1)
      change(targetId + 1)
      change(targetId + 10)
    } else if (targetId == 91 || targetId == 92 || targetId == 93 || targetId == 94 || targetId == 95 || targetId == 96 || targetId == 97 || targetId == 98) {
      change(targetId - 1)
      change(targetId + 1)
      change(targetId - 10)
    } else {
      change(targetId - 1)
      change(targetId + 1)
      change(targetId - 10)
      change(targetId + 10)
    }
    populatePossibleMoves(() => populateTargets(() => populateHighTargets()))
  }

  //change dbClasses of surrounding Squares
  function change(targetId) {
    let right
    let up
    let left
    let down
    if (targetId == 9 || targetId == 19 || targetId == 29 || targetId == 39 || targetId == 49 || targetId == 59 || targetId == 69 || targetId == 79 || targetId == 89 || targetId == 99) {
      right = "E"
      if (targetId == 9) {
        up = "E"
        left = squaresModel[targetId - 1].squareStatus
        down = squaresModel[targetId + 10].squareStatus
      } else if (targetId == 99) {
        up = squaresModel[targetId - 10].squareStatus
        left = squaresModel[targetId - 1].squareStatus
        down = "E"
      } else {
        up = squaresModel[targetId - 10].squareStatus
        left = squaresModel[targetId - 1].squareStatus
        down = squaresModel[targetId + 10].squareStatus
      }
    } else if (targetId == 0 || targetId == 10 || targetId == 20 || targetId == 30 || targetId == 40 || targetId == 50 || targetId == 60 || targetId == 70 || targetId == 80 || targetId == 90) {
      left = "E"
      if (targetId == 0) {
        up = "E"
        right = squaresModel[targetId + 1].squareStatus
        down = squaresModel[targetId + 10].squareStatus
      } else if (targetId == 90) {
        up = squaresModel[targetId - 10].squareStatus
        right = squaresModel[targetId + 1].squareStatus
        down = "E"
      } else {
        up = squaresModel[targetId - 10].squareStatus
        right = squaresModel[targetId + 1].squareStatus
        down = squaresModel[targetId + 10].squareStatus
      }
    } else if (targetId == 1 || targetId == 2 || targetId == 3 || targetId == 4 || targetId == 5 || targetId == 6 || targetId == 7 || targetId == 8) {
      up = "E"
      left = squaresModel[targetId - 1].squareStatus
      right = squaresModel[targetId + 1].squareStatus
      down = squaresModel[targetId + 10].squareStatus
    } else if (targetId == 91 || targetId == 92 || targetId == 93 || targetId == 94 || targetId == 95 || targetId == 96 || targetId == 97 || targetId == 98) {
      left = squaresModel[targetId - 1].squareStatus
      right = squaresModel[targetId + 1].squareStatus
      up = squaresModel[targetId - 10].squareStatus
      down = "E"
    } else {
      left = squaresModel[targetId - 1].squareStatus
      right = squaresModel[targetId + 1].squareStatus
      up = squaresModel[targetId - 10].squareStatus
      down = squaresModel[targetId + 10].squareStatus
    }
    for (let i = 0; i < possibleMovesModel.length; i++) {
      if (possibleMovesModel[i].dLeft == left && possibleMovesModel[i].dUp == up && possibleMovesModel[i].dRight == right && possibleMovesModel[i].dDown == down) {
        console.log("right: " + right + " up: " + up + " left: " + left + " down: " + down)
        console.log("changing square " + targetId + "'s class to " + possibleMovesModel[i].id)
        squaresModel[targetId].dbClassId = possibleMovesModel[i].id
      }
    }
  }

  // Game Logic For Single Player
  function playGameSingle() {
    if (isGameOver) return
    if (currentPlayer == 'user') {
      turnDisplay.innerHTML = 'Your turn.'
      computerSquares.forEach(square => square.addEventListener('click', function(e) {
        shotFired = square.dataset.id
        revealSquare(square.classList)
      }))
    }
   if (currentPlayer == 'enemy') {
      turnDisplay.innerHTML = 'Computers turn.'
      setTimeout(enemyGo, 2000)
    }
  }

  let destroyerCount = 0
  let submarineCount = 0
  let cruiserCount = 0
  let battleshipCount = 0
  let carrierCount = 0

  function revealSquare(classList) {
    const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer == 'user' && !isGameOver) {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battleship')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
      infoDisplay.innerHTML = `Confirmed Hit!`
    } else {
      enemySquare.classList.add('miss')
      infoDisplay.innerHTML = `Target Missed!`
    }
    checkForWins()
    currentPlayer = 'enemy'
    if (gameMode == 'singlePlayer') playGameSingle()
  }

  let cpuDestroyerCount = 0
  let cpuSubmarineCount = 0
  let cpuCruiserCount = 0
  let cpuBattleshipCount = 0
  let cpuCarrierCount = 0

                  /////////////////////////////
                  // Single Player Algorithm //
                  /////////////////////////////
  function enemyGo(square) {
    console.log("******** NEW ENEMY TURN *********")
    // select randomly from possible High targets
    let targetId = Math.floor(Math.random() * possibleHighTargetsModel.length)
    let target = possibleHighTargetsModel[targetId]
    if (gameMode == 'singlePlayer') {
      square = target.id
    }
    // Check win and transfer turn
    // if singlePlayer => send get request to update database
    do {
      if (!userSquares[square].classList.contains('boom') && !userSquares[square].classList.contains('miss')) {
        const hit = userSquares[square].classList.contains('taken')
        userSquares[square].classList.add(hit ? 'boom' : 'miss')
        if (userSquares[square].classList.contains('boom')) {
          if (gameMode == 'singlePlayer') {
            $.getJSON('/updateSuccess?dbClassId=' + target.dbClassId, function() {
              console.log("MAKING UPDATSUCCESS REQUEST")
            })
            .done(function() {
              squaresModel[target.id].squareStatus = "S"
              console.log("updating squareStatus: " + squaresModel[target.id])
              lookAtSurrounding(target.id)
            })
          }
        } else if (userSquares[square].classList.contains('miss')) {
          if (gameMode == 'singlePlayer') {
            $.getJSON('/updateFail?dbClassId=' + target.dbClassId, function() {
              console.log("MAKING UPDATEFAIL REQUEST")
            })
            .done(function() {
              squaresModel[target.id].squareStatus = "E"
              console.log("updating squareStatus: ")
              console.log(squaresModel[target.id])
              lookAtSurrounding(target.id)
            })
          }
        }
        if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++
        if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
        if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
        if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++
        if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
        checkForWins()
      } else if (gameMode == 'singlePlayer') enemyGo()
    } while (currentPlayer == 'enemy')
  }

  function checkForWins() {
    let enemy = 'computer'
    if(gameMode == 'multiPlayer') enemy = 'enemy'
    if (destroyerCount == 2) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s destroyer!`
      destroyerCount = 10
    }
    if (submarineCount == 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s submarine!`
      submarineCount = 10
    }
    if (cruiserCount == 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s cruiser!`
      cruiserCount = 10
    }
    if (battleshipCount == 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s battleship!`
      battleshipCount = 10
    }
    if (carrierCount == 5) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s carrier!`
      carrierCount = 10
    }
    if (cpuDestroyerCount == 2) {
      infoDisplay.innerHTML = `The ${enemy} sunk your destroyer!`
      cpuDestroyerCount = 10
    }
    if (cpuSubmarineCount == 3) {
      infoDisplay.innerHTML = `The ${enemy} sunk your submarine!`
      cpuSubmarineCount = 10
    }
    if (cpuCruiserCount == 3) {
      infoDisplay.innerHTML = `The ${enemy} sunk your cruiser!`
      cpuCruiserCount = 10
    }
    if (cpuBattleshipCount == 4) {
      infoDisplay.innerHTML = `The ${enemy} sunk your battleship!`
      cpuBattleshipCount = 10
    }
    if (cpuCarrierCount == 5) {
      infoDisplay.innerHTML = `The ${enemy} sunk your carrier!`
      cpuCarrierCount = 10
    }
    currentPlayer = 'user'
    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) == 50) {
      infoDisplay.innerHTML = 'YOU WIN'
      gameOver()
    }
    if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) == 50) {
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`
      gameOver()
    }
    turnDisplay.innerHTML = 'Your turn.'
  }

  $('#enhance').click(function() {
    turnDisplay.innerHTML = 'Loading...'
    if (enhancement == 0) {
      enhancement++
      enhancement++
      $.getJSON('/enhance?level=' + enhancement, function() {
        $('.nav-level').html('Level 2.0')
      })
    } else if (enhancement == 1) {
      enhancement++
      $.getJSON('/enhance?level=' + enhancement, function() {
        $('.nav-level').html('Level 2.0')
      })
    } else if (enhancement == 2) {
      enhancement++
      $.getJSON('/enhance?level=' + enhancement, function() {
        $('.nav-level').html('Level 3.0')
      })
    } else if (enhancement == 3) {
      enhancement = 1
      $.getJSON('/enhance?level=' + enhancement, function() {
        $('.nav-level').html('Level 1.0')
      })
    }
    turnDisplay.innerHTML = 'Your turn.'
  })

  function gameOver() {
    isGameOver = true
    startButton.removeEventListener('click', playGameSingle)
  }
if (gameMode == 'singlePlayer') $('.nav-level').html('Training Mode')
initializeSquaresModel(() => populatePossibleMoves(() => populateTargets(() => populateHighTargets())))
})