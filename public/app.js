document.addEventListener('DOMContentLoaded', () => {
  // Initialize and set selectors
  const userGrid = document.querySelector('.grid-user');
  const computerGrid = document.querySelector('.grid-computer');
  const displayGrid = document.querySelector('.grid-display');
  const ships = document.querySelectorAll('.ship');
  const destroyer = document.querySelector('.destroyer-container');
  const submarine = document.querySelector('.submarine-container');
  const cruiser = document.querySelector('.cruiser-container');
  const battleship = document.querySelector('.battleship-container');
  const carrier = document.querySelector('.carrier-container');
  const startButton = document.querySelector('#start');
  const rotateButton = document.querySelector('#rotate');
  const setupButtons = document.getElementById('setup-buttons');
  const turnDisplay = document.querySelector('#whose-turn');
  const infoDisplay = document.querySelector('#info');
  // Initialize and set squares array
  const userSquares = [];
  const computerSquares = [];
  // Initialize and set board width
  const width = 10;
  // Initialize and set empty models
  let squaresModel = [];
  let possibleMovesModel = [];
  let possibleTargetsModel = [];
  let possibleHighTargetsModel = [];
  let mostSuccessfulClasses = [];
  // Intialize and set user and game states
  let isHorizontal = true;
  let isGameOver = false;
  let ready = false;
  let enemyReady = false;
  let allShipsPlaced = false;
  // Intialize and set current player
  let currentPlayer = 'user';
  // Initialize and set player number (for multiplayer)
  let playerNum = 0;
  // Initialize and set enhancement level for AI (single player) (0 = active learning on current database table)
  let enhancement = 0;
  // Initialize and set target of square to be shot at (-1 = non existing target)
  let shotFired = -1;

  /** 
   * INITIALIZE SHIP MODELS
  */
  const shipArray = [ {
      name: 'destroyer',
      directions: [
        [0, 1],
        [0, width]
      ]
    }, {
      name: 'submarine',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    }, {
      name: 'cruiser',
      directions: [
        [0, 1, 2],
        [0, width, width*2]
      ]
    }, {
      name: 'battleship',
      directions: [
        [0, 1, 2, 3],
        [0, width, width*2, width*3]
      ]
    }, {
      name: 'carrier',
      directions: [
        [0, 1, 2, 3, 4],
        [0, width, width*2, width*3, width*4]
      ]
    },
  ];
  // Initialize user and enemy game grids
  createBoard(userGrid, userSquares);
  createBoard(computerGrid, computerSquares);

  /**
   *  SELECT NUMBER OF PLAYERS
  */
  if (gameMode === 'singlePlayer') {
    startSinglePlayer();
  } else {
    startMultiPlayer();
  }

  /**
   *  START MULTIPLAYER FUNCTIONALITY
  */
  function startMultiPlayer() {
    const socket = io();

    // Get your player number from server
    socket.on('player-number', num => {
      if (num == -1) {
        infoDisplay.innerHTML = 'Sorry, the server is full.';
      } else {
        playerNum = parseInt(num);
        if(playerNum == 1) currentPlayer = 'enemy';

        console.log(playerNum);

        // Get status of opponent player
        socket.emit('check-players');
      }
    })

    // When another player has connected or disconnected ->
    socket.on('player-connection', num => {
      console.log(`Player number ${num} has connected or disconnected.`);
      playerConnectedOrDisconnected(num);
    })

    // When the enemy is ready ->
    socket.on('enemy-ready', num => {
      enemyReady = true;
      playerReady(num);
      if (ready) {
        playGameMulti(socket);
        setupButtons.style.display = 'none';
      }
    })

    // Check the status of the players ->
    socket.on('check-players', players => {
      players.forEach((p, i) => {
        if (p.connected) playerConnectedOrDisconnected(i);
        if(p.ready) {
          playerReady(i);
          if(i != playerNum) enemyReady = true;
        }
      })
    })

    // When timeout occurs ->
    socket.on('timeout', () => {
      infoDisplay.innerHTML = 'Your have reached the 10 minute limit';
    })

    // Initialize event listener for clicking the ready button
    startButton.addEventListener('click', () => {
      if (allShipsPlaced) playGameMulti(socket);
      else infoDisplay.innerHTML = 'Please place all ships.';
    })

    // Initialize event listeners for clicking on squares to fire on
    computerSquares.forEach(square => {
      square.addEventListener('click', () => {
        if (currentPlayer == 'user' && ready && enemyReady) {
          shotFired = square.dataset.id;
          socket.emit('fire', shotFired);
        }
      })
    })

    // When enemy fires ->
    socket.on('fire', id => {
      enemyGo(id);
      const square = userSquares[id];
      socket.emit('fire-reply', square.classList);
      playGameMulti(socket);
    })

    // Respond to enemy after they fire ->
    socket.on('fire-reply', classList => {
      revealSquare(classList);
      playGameMulti(socket);
    })

    // Evaluate if a player has connected or disconnected
    function playerConnectedOrDisconnected(num) {
      let player = `.p${parseInt(num) +1}`;
      document.querySelector(`${player} .connected`).classList.toggle('active');
      if(parseInt(num) == playerNum) document.querySelector(player).style.fontWeight = 'bold';
    }
  }

  /**
   *  START SINGLE PLAYER FUNCTIONALITY
  */
  function startSinglePlayer() {
    // Generate locations of computer's ships
    generate(shipArray[0]);
    generate(shipArray[1]);
    generate(shipArray[2]);
    generate(shipArray[3]);
    generate(shipArray[4]);

    // Initialize event listener for clicking the start button
    startButton.addEventListener('click', () => {
      setupButtons.style.display = 'none';
      playGameSingle();
    })
  }

  /**
   *  GENERATE GAME BOARDS
  */
  function createBoard(grid, squares) {
    // Calculate game board size and generate squares to fill
    for (let i = 0; i < width * width; i++) {
      // Generate
      const square = document.createElement('div');
      square.dataset.id = i;
      // Add to grid
      grid.appendChild(square);
      squares.push(square);
    }
  }

  /**
   *  RANDOMLY PLACE COMPUTER'S SHIPS ON ENEMY GAME BOARD
  */
  function generate(ship) {
    // Choose direction
    let randomDirection = Math.floor(Math.random() * ship.directions.length);
    let current = ship.directions[randomDirection];
    if (randomDirection == 0) direction = 1;
    if (randomDirection == 1) direction = 10;
    // Choose starting square
    let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)));
    // Check if area chosen is taken at all
    const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'));
    const isAtRightEdge = current.some(index => (randomStart + index) % width == width - 1);
    const isAtLeftEdge = current.some(index => (randomStart + index) % width == 0);
    // If none of the squares are taken, give the squares attribute of taken
    if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name));
    // If any of the squares are taken, re-generate
    else generate(ship);
  }

  /**
   *  ROTATE USER'S SHIPS THAT STILL NEED TO BE PLACED
  */
  function rotate() {
    // If ships are horizontal -> turn on vertical class
    if (isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical');
      submarine.classList.toggle('submarine-container-vertical');
      cruiser.classList.toggle('cruiser-container-vertical');
      battleship.classList.toggle('battleship-container-vertical');
      carrier.classList.toggle('carrier-container-vertical');
      isHorizontal = false;
      console.log(isHorizontal);
      return;
    }
    // If ships are not horizontal -> turn off vertical class
    if (!isHorizontal) {
      destroyer.classList.toggle('destroyer-container-vertical');
      submarine.classList.toggle('submarine-container-vertical');
      cruiser.classList.toggle('cruiser-container-vertical');
      battleship.classList.toggle('battleship-container-vertical');
      carrier.classList.toggle('carrier-container-vertical');
      isHorizontal = true;
      console.log(isHorizontal);
      return;
    }
  }
  // Add event listener for clicking the rotate ship button
  rotateButton.addEventListener('click', rotate);

  /**
   *  DRAGGING AND DROPPING USER'S SHIPS THAT STILL NEED TO BE PLACED ON THE BOARD
  */
  // Add event listeners for dragging and dropping
  ships.forEach(ship => ship.addEventListener('dragstart', dragStart));
  userSquares.forEach(square => square.addEventListener('dragStart', dragStart));
  userSquares.forEach(square => square.addEventListener('dragover', dragOver));
  userSquares.forEach(square => square.addEventListener('dragenter', dragEnter));
  userSquares.forEach(square => square.addEventListener('dragleave', dragLeave));
  userSquares.forEach(square => square.addEventListener('drop', dragDrop));
  userSquares.forEach(square => square.addEventListener('dragged', dragEnd));

  // Initialize dragged item info
  let selectedShipNameWithIndex;
  let draggedShip;
  let draggedShipLength;

  // Give each ship an event listener for holding down the mouse button to drag the item
  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
    selectedShipNameWithIndex = e.target.id;
    console.log(selectedShipNameWithIndex);
  }))

  //  Set dragged item info at the start of a drag
  function dragStart() {
    draggedShip = this;
    draggedShipLength = this.childNodes.length;
    console.log(draggedShip);
  }

  // Prevent default behavior of any object that a ship is dragged over
  function dragOver(e) {
    e.preventDefault();
  }

  // Prevent default behavior when dragging a ship onto an invalid target object
  function dragEnter(e) {
    e.preventDefault();
  }
  // Alert that dragged item has left its original position
  function dragLeave() {
    console.log('drag leave');
  }

  // When a ship has been dropped (mouse up) ->
  function dragDrop() {
    // Set the ship that was dragged
    let shipNameWithLastId = draggedShip.lastChild.id;
    let shipClass = shipNameWithLastId.slice(0, -2);
    console.log(shipClass);
    let lastShipIndex = parseInt(shipNameWithLastId.substr(-1));
    let shipLastId = lastShipIndex + parseInt(this.dataset.id);
    console.log(shipLastId);
    // Set which squares are not allowed to hold a horizontal or vertical ship
    const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93];
    const notAllowedVertical  = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60];
    // Add to the list of which squares are not allowed to hold a horizontal or vertical ship
    let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex);
    let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex);
    // Set the selected ships index and Id
    selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1));
    shipLastId = shipLastId - selectedShipIndex;
    console.log(shipLastId);
    // Check if the ship is horizontal and does not overlap with squares that do not allow horizontal ships
    if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass;
        if (i == 0) directionClass = 'start';
        if (i == draggedShipLength - 1) directionClass = 'end';
        // Add taken, horizontal, ship type, and ship direction attributes to squares that will be populated by a ship
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass);
      }
    }
    // Check if the ship is vertical and does not overlap with squares that do not allow vertical ships
    else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
      for (let i = 0; i < draggedShipLength; i++) {
        let directionClass;
        if (i == 0) directionClass = 'start';
        if (i == draggedShipLength - 1) directionClass = 'end';
        // Add taken, vertical, ship type, and ship direction attributes to squares that will be populated by a ship
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width * i].classList.add('taken', 'vertical', directionClass, shipClass);
      }
    } else return
    // Remove the dropped ship from the display grid for ships to be placed
    displayGrid.removeChild(draggedShip);
    // When there are no more objects in the display grid with class of 'ship' ->
    if(!displayGrid.querySelector('.ship')) allShipsPlaced = true;
  }
  // Alert that dragging is done.
  function dragEnd() {
    console.log('drag end');
  }

  /**
   *  GAME LOGIC FOR MULTIPLAYER
  */
  // Initialize multiplayer game using established WebSocket
  function playGameMulti(socket) {
    setupButtons.style.display = 'none';
    // If game is over do nothing.
    if (isGameOver) return
    // Check ready status and change status for you and opponenets screen
    if (!ready) {
      socket.emit('player-ready');
      ready = true;
      playerReady(playerNum);
    }
    // Change display based on whose turn it is ->
    if (enemyReady) {
      if(currentPlayer == 'user') {
        turnDisplay.innerHTML = 'Your turn.';
      }
      if (currentPlayer == 'enemy') {
        turnDisplay.innerHTML = 'Enemy\'s turn.';
      }
    }
  }
  // Check ready status for selected player, if ready, add active class to that user
  function playerReady(num) {
    let player = `.p${parseInt(num) + 1}`;
    document.querySelector(`${player} .ready`).classList.toggle('active');
  }

  /**
   *  POPULATE MODELS USED IN SINGLE PLAYER GAME MODE
  */

  // Populate Squares Model ->
  function initializeSquaresModel(_callback) {
    // Get IDs of each square and set their status to "Unknown" and set corrisponding square class from database
    userSquares.forEach(square => {
      let id = parseInt(square.dataset.id);
      let dbClassId = 0;
      let squareStatus = "U";
      // Set dbClasses of special case squares
      if (id == 0) {
        dbClassId = 14;
      } else if (id == 9) {
        dbClassId = 12;
      } else if (id == 90) {
        dbClassId = 26;
      } else if (id == 99) {
        dbClassId = 10;
      } else if (id == 1 || id == 2 || id == 3 || id == 4 || id == 5 || id == 6 || id == 7 || id == 8) {
        dbClassId = 6;
      } else if (id == 91 || id == 92 || id == 93 || id == 94 || id == 95 || id == 96 || id == 97 || id == 98) {
        dbClassId = 2;
      } else if (id == 10 || id == 20 || id == 30 || id == 40 || id == 50 || id == 60 || id == 70 || id == 80) {
        dbClassId = 8;
      } else if (id == 19  || id == 29 || id == 39 || id == 49 || id == 59 || id == 69 || id == 79 || id == 89) {
        dbClassId = 4;
      } else {
        dbClassId = 1;
      }
      squaresModel.push({id : id, dbClassId : dbClassId, squareStatus : squareStatus});
    })
    console.log("Squares Model: ");
    console.log(squaresModel);
    _callback();
  }

  // Populate possible moves model
  function populatePossibleMoves(_callback) {
    // Create new Array instance
    possibleMovesModel = new Array();
    // Query database for list of dbClasses and their success rates and totals
    $.getJSON('/getDBTable', function(data) {
      data.forEach(obj => {
        let id = obj.Id;
        let dLeft = obj.dLeft;
        let dUp = obj.dUp;
        let dRight = obj.dRight;
        let dDown = obj.dDown;
        let dSuccessful = obj.dSuccessful;
        let dTotal = obj.dTotal;
        // Add these classes to possible moves model
        possibleMovesModel.push({id : id, dLeft : dLeft, dUp : dUp, dRight : dRight, dDown : dDown, dSuccessful : dSuccessful, dTotal : dTotal});
      })
      console.log("possibleMoves: ");
      console.log(possibleMovesModel);
      _callback(data);
    })
  }

  // Populate possible targets model
  function populateTargets(_callback) {
    // Create new Array instance
    possibleTargetsModel = new Array();
    // Cycle through each square within the square model
    for (let i = 0; i < squaresModel.length; i++) {
      // If the squares status is "Unknown" ->
      if (squaresModel[i].squareStatus == "U") {
        let id = squaresModel[i].id;
        let dbClassId = squaresModel[i].dbClassId;
        let result = {id : id, dbClassId : dbClassId};
        // Add square to possible targets model
        possibleTargetsModel.push(result);
      }
    }
    console.log("PossibleTargets: ");
    console.log(possibleTargetsModel);
    _callback();
  }

  // Populate possible high targets model with classes with the best success rate
  function populateHighTargets() {
    // Create new Array instance
    possibleHighTargetsModel = new Array();
    let stack = [];
    let highestSuccess;
    // cycle through all dbClasses
    for (let i = 0; i < 81; i++) {
      let successRate = 0;
      // If Success and Total = 0 ... ( 0 / 0  does not work) ->
      if (possibleMovesModel[i].dSuccessful == 0 && possibleMovesModel[i].dTotal == 0) {
        // Set success rate to 0
        successRate = 0;
      } else {
        // Calculate success rate based on the dbClass's success count and total count attributes
        successRate = possibleMovesModel[i].dSuccessful / possibleMovesModel[i].dTotal;
      }
      // Add to stack of possible high targets
      stack.push(successRate);
    }
    console.log("successStack: ");
    console.log(stack);
    // Sort the stack of possible high targets
    stack.sort();
    console.log("sortedStack: ");
    console.log(stack);
    // Get the largets success rate from the stack
    highestSuccess = stack.pop();

    // Populate most successful classes from current possible targets
    do {
      // Create new Array instance
      mostSuccessfulClasses = new Array();
      // Cycle through each dbClass that could be represented in the sqaure's status of every squares on the grid
      for (let i = 0; i < 81; i++) {
        let successRate = 0;
        // If Success and Total = 0 ... ( 0 / 0  does not work) ->
        if (possibleMovesModel[i].dSuccessful == 0 && possibleMovesModel[i].dTotal == 0) {
          // Set success rate to 0
          successRate = 0;
        } else {
          // Calculate success rate based on the dbClass's success count and total count attributes
          successRate = possibleMovesModel[i].dSuccessful / possibleMovesModel[i].dTotal;
        }
        // If successRate == highestSuccess (in case there is more than one class with the same success rate) ->
        if (successRate == highestSuccess) {
          let id = possibleMovesModel[i].id;
          // Add square to most successful classes model
          mostSuccessfulClasses.push({id : id, successRate : successRate});
        }
      }
      // Cycle through each possible Target and compare it to each item in the model of most successful classes
      for (let i = 0; i < possibleTargetsModel.length; i++) {
        for (let j = 0; j < mostSuccessfulClasses.length; j++) {
          // If there is a match on the class id for the square ->
          if (possibleTargetsModel[i].dbClassId == mostSuccessfulClasses[j].id) {
            // Add square to possible High targets Model
            possibleHighTargetsModel.push(possibleTargetsModel[i]);
          }
        }
      }
      // Get the next highest success rate from stack
      highestSuccess = stack.pop();
      // Continue with this function untill possibleHighTargetsModel has at least 1 item.
    } while (possibleHighTargetsModel.length == 0)
    // Alert these models
    console.log("Most Successful Classes: ");
    console.log(mostSuccessfulClasses);
    console.log("Possible High Targets Model: ");
    console.log(possibleHighTargetsModel);
  }

  // Investigate surrounding squares and update their db class based on new outcome from firing on a target
  function lookAtSurrounding(targetId) {
    // Evaluate what square is selected and change the squares that will have a changed square status
    if (targetId == 9 || targetId == 19 || targetId == 29 || targetId == 39 || targetId == 49 || targetId == 59 || targetId == 69 || targetId == 79 || targetId == 89 || targetId == 99) {
      change(targetId - 1);
      if (targetId == 9) {
        change(targetId + 10);
      } else if (targetId == 99) {
        change(targetId - 10);
      } else {
        change(targetId - 10);
        change(targetId + 10);
      }
    } else if (targetId == 0 || targetId == 10 || targetId == 20 || targetId == 30 || targetId == 40 || targetId == 50 || targetId == 60 || targetId == 70 || targetId == 80 || targetId == 90) {
      change(targetId + 1);
      if (targetId == 0) {
        change(targetId + 10);
      } else if (targetId == 90) {
        change(targetId - 10);
      } else {
        change(targetId - 10);
        change(targetId + 10);
      }
    } else if (targetId == 1 || targetId == 2 || targetId == 3 || targetId == 4 || targetId == 5 || targetId == 6 || targetId == 7 || targetId == 8) {
      change(targetId - 1);
      change(targetId + 1);
      change(targetId + 10);
    } else if (targetId == 91 || targetId == 92 || targetId == 93 || targetId == 94 || targetId == 95 || targetId == 96 || targetId == 97 || targetId == 98) {
      change(targetId - 1);
      change(targetId + 1);
      change(targetId - 10);
    } else {
      change(targetId - 1);
      change(targetId + 1);
      change(targetId - 10);
      change(targetId + 10);
    }
    // Repopulate all models based on changed squares
    populatePossibleMoves(() => populateTargets(() => populateHighTargets()));
  }

  // Change dbClass of a selected square
  function change(targetId) {
    // Initialize surrounding square models
    let right;
    let up;
    let left;
    let down;
    // Evaluate which square is selected and get status for the surrounding squares that will have changed
    if (targetId == 9 || targetId == 19 || targetId == 29 || targetId == 39 || targetId == 49 || targetId == 59 || targetId == 69 || targetId == 79 || targetId == 89 || targetId == 99) {
      right = "E";
      if (targetId == 9) {
        up = "E";
        left = squaresModel[targetId - 1].squareStatus;
        down = squaresModel[targetId + 10].squareStatus;
      } else if (targetId == 99) {
        up = squaresModel[targetId - 10].squareStatus;
        left = squaresModel[targetId - 1].squareStatus;
        down = "E";
      } else {
        up = squaresModel[targetId - 10].squareStatus;
        left = squaresModel[targetId - 1].squareStatus;
        down = squaresModel[targetId + 10].squareStatus;
      }
    } else if (targetId == 0 || targetId == 10 || targetId == 20 || targetId == 30 || targetId == 40 || targetId == 50 || targetId == 60 || targetId == 70 || targetId == 80 || targetId == 90) {
      left = "E";
      if (targetId == 0) {
        up = "E";
        right = squaresModel[targetId + 1].squareStatus;
        down = squaresModel[targetId + 10].squareStatus;
      } else if (targetId == 90) {
        up = squaresModel[targetId - 10].squareStatus;
        right = squaresModel[targetId + 1].squareStatus;
        down = "E";
      } else {
        up = squaresModel[targetId - 10].squareStatus;
        right = squaresModel[targetId + 1].squareStatus;
        down = squaresModel[targetId + 10].squareStatus;
      }
    } else if (targetId == 1 || targetId == 2 || targetId == 3 || targetId == 4 || targetId == 5 || targetId == 6 || targetId == 7 || targetId == 8) {
      up = "E";
      left = squaresModel[targetId - 1].squareStatus;
      right = squaresModel[targetId + 1].squareStatus;
      down = squaresModel[targetId + 10].squareStatus;
    } else if (targetId == 91 || targetId == 92 || targetId == 93 || targetId == 94 || targetId == 95 || targetId == 96 || targetId == 97 || targetId == 98) {
      left = squaresModel[targetId - 1].squareStatus;
      right = squaresModel[targetId + 1].squareStatus;
      up = squaresModel[targetId - 10].squareStatus;
      down = "E";
    } else {
      left = squaresModel[targetId - 1].squareStatus;
      right = squaresModel[targetId + 1].squareStatus;
      up = squaresModel[targetId - 10].squareStatus;
      down = squaresModel[targetId + 10].squareStatus;
    }
    // Cycle through all possible db classes
    for (let i = 0; i < possibleMovesModel.length; i++) {
      // If the db class from possible moves model == this new square model
      if (possibleMovesModel[i].dLeft == left && possibleMovesModel[i].dUp == up && possibleMovesModel[i].dRight == right && possibleMovesModel[i].dDown == down) {
        // Alert the conditions of a changing square
        console.log("right: " + right + " up: " + up + " left: " + left + " down: " + down);
        console.log("changing square " + targetId + "'s class to " + possibleMovesModel[i].id);
        // Change this squares dbClass ID to reflect its new db Class
        squaresModel[targetId].dbClassId = possibleMovesModel[i].id;
      }
    }
  }

  /**
   *  GAME LOGIC FOR SINGLE PLAYER
  */
  // Start a single player game
  function playGameSingle() {
    // Check if game is over and do nothing if so
    if (isGameOver) return;
    // If it is the user's turn ->
    if (currentPlayer == 'user') {
      // Update the turn display
      turnDisplay.innerHTML = 'Your turn.';
      // Add event listeners for clicking on each square within the computer's grid
      computerSquares.forEach(square => square.addEventListener('click', function(e) {
        // Set which square is being targeted
        shotFired = square.dataset.id;
        // Reveal if the selected square contains a ship or not
        revealSquare(square.classList);
      }))
    }
    // If it is the enemy's turn ->
    if (currentPlayer == 'enemy') {
      // Update the turn display
      turnDisplay.innerHTML = 'Computers turn.';
      // Run the enemyGo function at a timeout of 2000 miliseconds
      setTimeout(enemyGo, 2000);
    }
  }

  // Initialize hit count for each enemy ship
  let destroyerCount = 0;
  let submarineCount = 0;
  let cruiserCount = 0;
  let battleshipCount = 0;
  let carrierCount = 0;

  // Reveal if the selected square contains a ship or not based on its list of html classes
  function revealSquare(classList) {
    // Set selected square
    const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`);
    const obj = Object.values(classList);
    // If selected square's class list contains "explosion" or "miss" and the game is not over already ->
    if (!enemySquare.classList.contains('explosion') && currentPlayer == 'user' && !isGameOver) {
      // See if the square's class includes any of the ship classes and add to the hit count of that ship class ->
      if (obj.includes('destroyer')) destroyerCount++;
      if (obj.includes('submarine')) submarineCount++;
      if (obj.includes('cruiser')) cruiserCount++;
      if (obj.includes('battleship')) battleshipCount++;
      if (obj.includes('carrier')) carrierCount++;
    }
    // If the sqaure's class includes "taken" ->
    if (obj.includes('taken')) {
      // Add class "explosion" to the class list of the square to designate you have hit a target at that location
      enemySquare.classList.add('explosion');
      // Change the info display to inform the user
      infoDisplay.innerHTML = `Confirmed Hit!`;
    } else {
      // Add class "miss" to the class list of the square to designate that you have missed at that location
      enemySquare.classList.add('miss');
      // Change the info display to inform the user
      infoDisplay.innerHTML = `Target Missed!`;
    }
    // Check to see if anyone has won yet
    checkForWins();
    // Set current player to "enemy" to inform client that it is the enemy's turn
    currentPlayer = 'enemy';
    if (gameMode == 'singlePlayer') playGameSingle();
  }
  
  // Initialize hit count for each of my ships
  let cpuDestroyerCount = 0;
  let cpuSubmarineCount = 0;
  let cpuCruiserCount = 0;
  let cpuBattleshipCount = 0;
  let cpuCarrierCount = 0;


                  /////////////////////////////
  ////////////////// Single Player Algorithm /////////////////
                  /////////////////////////////
  function enemyGo(square) {
    console.log("******** NEW COMPUTER TURN *********");
    // Select randomly from model of possible high targets
    let targetId = Math.floor(Math.random() * possibleHighTargetsModel.length);
    let target = possibleHighTargetsModel[targetId];
    if (gameMode == 'singlePlayer') {
      square = target.id;
    }
    // While it is the enemy's turn ->
    do {
      // If targeted square has not been fired upon (does not contain "explosion" or "miss" in it's class list) ->
      if (!userSquares[square].classList.contains('explosion') && !userSquares[square].classList.contains('miss')) {
        // Update if the square is taken (will be a hit)
        const hit = userSquares[square].classList.contains('taken');
        // If square is "taken" add "explosion" to the square's class list. If not, add "miss" to the square's class list
        userSquares[square].classList.add(hit ? 'explosion' : 'miss');
        // If the square now contains "explosion" ->
        if (userSquares[square].classList.contains('explosion')) {
          // if game mode is single player ->
          if (gameMode == 'singlePlayer') {
            // Send get request to the server which will update the success count and total of the db Class represented by the square that was fired upon
            $.getJSON('/updateSuccess?dbClassId=' + target.dbClassId, function() {
              console.log("MAKING UPDATSUCCESS REQUEST");
            })
            .done(function() {
              // Update the squares status to reflect that it has been hit
              squaresModel[target.id].squareStatus = "S";
              // Alert that updating is occurring
              console.log("updating squareStatus: " + squaresModel[target.id]);
              // Evaluate surrounding squares and update their classes
              lookAtSurrounding(target.id);
            })
          }
        }
        // If the square now contains "miss" ->
        else if (userSquares[square].classList.contains('miss')) {
          // if game mode is single player ->
          if (gameMode == 'singlePlayer') {
            // Send get request to the server which will update the total of the db Class represented by the square that was fired upon
            $.getJSON('/updateFail?dbClassId=' + target.dbClassId, function() {
              console.log("MAKING UPDATEFAIL REQUEST");
            })
            .done(function() {
              // Update the squares status to reflect that it is empty
              squaresModel[target.id].squareStatus = "E";
              // Alert that updating is occuring
              console.log("updating squareStatus: " + squaresModel[target.id]);
              // Evaluate surrounding squares and update their classes
              lookAtSurrounding(target.id);
            })
          }
        }
        // See if the square's class includes any of the ship classes and add to the hit count of that ship class ->
        if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++;
        if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++;
        if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++;
        if (userSquares[square].classList.contains('battleship')) cpuBattleshipCount++;
        if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++;
        // Check for wins using new ship counts
        checkForWins();
      } else if (gameMode == 'singlePlayer') enemyGo();
    } while (currentPlayer == 'enemy')
  }
  // Check for wins
  function checkForWins() {
    // Set enemy to computer or enemy based on single player or multiplayer
    let enemy = 'computer';
    if(gameMode == 'multiPlayer') enemy = 'enemy';
    // Check if any count is equal to the designated ship sizes represented by the comparing integer and update the info display accordingly
    // I then change the count to be 10 so i can check for a definite number which is 10 x 5 = 50 to see if someone has won the game
    if (destroyerCount == 2) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s destroyer!`;
      destroyerCount = 10;
    }
    if (submarineCount == 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s submarine!`;
      submarineCount = 10;
    }
    if (cruiserCount == 3) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s cruiser!`;
      cruiserCount = 10;
    }
    if (battleshipCount == 4) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s battleship!`;
      battleshipCount = 10;
    }
    if (carrierCount == 5) {
      infoDisplay.innerHTML = `You sunk the ${enemy}\'s carrier!`;
      carrierCount = 10;
    }
    if (cpuDestroyerCount == 2) {
      infoDisplay.innerHTML = `The ${enemy} sunk your destroyer!`;
      cpuDestroyerCount = 10;
    }
    if (cpuSubmarineCount == 3) {
      infoDisplay.innerHTML = `The ${enemy} sunk your submarine!`;
      cpuSubmarineCount = 10;
    }
    if (cpuCruiserCount == 3) {
      infoDisplay.innerHTML = `The ${enemy} sunk your cruiser!`;
      cpuCruiserCount = 10;
    }
    if (cpuBattleshipCount == 4) {
      infoDisplay.innerHTML = `The ${enemy} sunk your battleship!`;
      cpuBattleshipCount = 10;
    }
    if (cpuCarrierCount == 5) {
      infoDisplay.innerHTML = `The ${enemy} sunk your carrier!`;
      cpuCarrierCount = 10;
    }
    currentPlayer = 'user';
    // If count equals 50 ->
    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) == 50) {
      // Change info display to user wins
      infoDisplay.innerHTML = 'YOU WIN';
      // Set isGameOver = false
      gameOver();
    }
    // If count equals 50 ->
    if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) == 50) {
      // Change info display to enemy wins
      infoDisplay.innerHTML = `${enemy.toUpperCase()} WINS`;
      // Set isGameOver = false
      gameOver();
    }
    // After checking -> change display
    turnDisplay.innerHTML = 'Your turn.';
  }
  // Enhancement click function for increasing difficulty of AI
  $('#enhance').click(function() {
    // Notify change is occuring
    turnDisplay.innerHTML = 'Loading...';
    // If enhancement has not occured ->
    if (enhancement == 0) {
      enhancement++;
      enhancement++;
      // Send request to change level to 2
      $.getJSON('/enhance?level=' + enhancement, function() {
        // Update level display
        $('.nav-level').html('Level 2.0');
      })
    }
    // If enhancement level is 1 ->
    else if (enhancement == 1) {
      enhancement++;
      // Send request to change level to 2
      $.getJSON('/enhance?level=' + enhancement, function() {
        // Update level display
        $('.nav-level').html('Level 2.0');
      })
    }
    // If enhancement level is 2 ->
    else if (enhancement == 2) {
      enhancement++;
      // Send request to change level to 3
      $.getJSON('/enhance?level=' + enhancement, function() {
        // Update level display
        $('.nav-level').html('Level 3.0');
      })
    }
    // If enhancement level is 3 ->
    else if (enhancement == 3) {
      enhancement = 1;
      // Send request to change level to 1
      $.getJSON('/enhance?level=' + enhancement, function() {
        // Update level display
        $('.nav-level').html('Level 1.0');
      })
    }
    // Update turn display
    turnDisplay.innerHTML = 'Your turn.';
  })

  // Change isGameOver boolean to true
  function gameOver() {
    isGameOver = true;
    // Remove ability to continue playing
    startButton.removeEventListener('click', playGameSingle);
  }
  
  // Set level display to Training Mode upon initial load and run initialization of AI models
  if (gameMode == 'singlePlayer') $('.nav-level').html('Training Mode')
initializeSquaresModel(() => populatePossibleMoves(() => populateTargets(() => populateHighTargets())));
})