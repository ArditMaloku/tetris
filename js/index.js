document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const bestScoreDisplay = document.querySelector('#bestScore')
  const width = 10
  let nextRandom = 0
  let bestScore = 0
  let timerId
  let gameInactive = true
  let score = 0
  let restartGame = false
  let loginModalActive = true
  const colors = [
    'orange',
    'red',
    'purple',
    'green',
    'blue'
  ]

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  var socket;

  //randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  //draw the Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
      squares[currentPosition + index].style.backgroundColor = colors[random]
    })
  }

  //undraw the Tetromino
  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
      squares[currentPosition + index].style.backgroundColor = ''

    })
  }

  //assign functions to keyCodes
  function control(e) {
    if(e.ctrlKey && (e.which == 83) && gameInactive && !loginModalActive) {
      e.preventDefault();
      startGame()
    }
    else if(e.ctrlKey && (e.which == 82) && gameInactive && !loginModalActive) {
      e.preventDefault();
      $(".tetromino").css({ 'background-color' : ''});
      $(".tetromino").removeClass('taken tetromino');
      newGame()
    }
    else if(e.keyCode === 37 && !gameInactive) {
      moveLeft()
    } else if (e.keyCode === 38 && !gameInactive) {
      rotate()
    } else if (e.keyCode === 39 && !gameInactive) {
      moveRight()
    } else if (e.keyCode === 40 && !gameInactive) {
      moveDown()
    } else if(e.ctrlKey && (e.which == 80) && !gameInactive) {
      e.preventDefault();
      pauseGame()
    }
  }

  $(document).bind('keydown', function(e) {
    control(e)
  });

  //move down function
  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  //freeze function
  function freeze() {
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino falling
      random = nextRandom
      nextRandom = Math.floor(Math.random() * theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move the tetromino left, unless is at the edge or there is a blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
    if(!isAtLeftEdge) currentPosition -=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition +=1
    }
    draw()
  }

  //move the tetromino right, unless is at the edge or there is a blockage
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
    if(!isAtRightEdge) currentPosition +=1
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -=1
    }
    draw()
  }

  
  ///FIX ROTATION OF TETROMINOS A THE EDGE 
  function isAtRight() {
    return current.some(index=> (currentPosition + index + 1) % width === 0)  
  }
  
  function isAtLeft() {
    return current.some(index=> (currentPosition + index) % width === 0)
  }
  
  function checkRotatedPosition(P){
    P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
    if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
      if (isAtRight()){            //use actual position to check if it's flipped over to right side
        currentPosition += 1    //if so, add one to wrap it back around
        checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
        }
    }
    else if (P % width > 5) {
      if (isAtLeft()){
        currentPosition -= 1
      checkRotatedPosition(P)
      }
    }
  }
  
  //rotate the tetromino
  function rotate() {
    undraw()
    currentRotation ++
    if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
      currentRotation = 0
    }
    current = theTetrominoes[random][currentRotation]
    checkRotatedPosition()
    draw()
  }
  /////////

  
  
  //show up-next tetromino in mini-grid display
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  const displayIndex = 0


  //the Tetrominos without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino form the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
      square.style.backgroundColor = ''
    })
    upNextTetrominoes[nextRandom].forEach( index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
      displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
    })
  }

  function startGame(){
    if (!timerId || restartGame) {
      gameInactive = false
      $('#startGameModal').modal('toggle');
      draw()
      timerId = setInterval(moveDown, 1000)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  }

  function pauseGame() {
    if(timerId){
      gameInactive = true
      $('#startGameModal').modal('toggle');
      $('.h4-start-game').text('Game Paused. Press Ctrl+S to continue')
      clearInterval(timerId)
      timerId = null 
    }
  }

  //add score
  function addScore() {
    var audio = new Audio('http://localhost/tetris/audios/fall.wav');
    audio.play();

    for (let i = 0; i < 199; i +=width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains('taken'))) {
        score +=10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
          squares[index].style.backgroundColor = ''
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))

        var audio = new Audio('http://localhost/tetris/audios/clear.wav');
        audio.play();
      }
    }
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      if(score > bestScore)
      {
        bestScore = score
        localStorage.setItem("bestScore",bestScore);

        if (localStorage.getItem('email') !== null) {
          var data = {
            email: localStorage.getItem('email'),
            bestScore: bestScore
          }
  
          $.ajax({
              type: 'POST',
              url: 'http://localhost/tetris/backend/index.php/bestScore',
              data: data,
              dataType: 'json',
              success: function (data) {
                console.log(data);
              }
          });
        }
      }

      socket.emit('best_score', score)

      gameInactive = true
      var audio = new Audio('http://localhost/tetris/audios/gameover.wav');
      audio.play();

      scoreDisplay.innerHTML = score
      bestScoreDisplay.innerHTML = bestScore
      clearInterval(timerId)
      $('.h4-start-game').text('Game over. Your score: '+score+". Press Ctrl+R for new game!")
      $('#startGameModal').modal('toggle')
      score = 0
    }
  }

  function newGame(){
    restartGame = true
    $('.grid div').css('background-color','')
    startGame()
  }

  document.addEventListener('visibilitychange', hidden, false);

  function hidden(){
    if (!document.hidden) {
      pauseGame()
    }
  }

  $('.closeBlinds').click(function(){
    if(!$(".blind").hasClass("blindOn"))
    {
      $(".blind").addClass("blindOn");
      $(".bg").addClass("bgOn");
      $(".string").addClass("stringOn");
      $(".string-end").addClass("string-endOn");
    }else{
      $(".blind").removeClass("blindOn");
      $(".bg").removeClass("bgOn");
      $(".string").removeClass("stringOn");
      $(".string-end").removeClass("string-endOn"); 
    }
  })

  if (localStorage.getItem('email') !== null) {
    socketInit(localStorage.getItem('email'))
    $('#userOnline').text(localStorage.getItem('email'))
    $('#bestScore').text(localStorage.getItem("bestScore"))
    if(localStorage.getItem('email').indexOf("Guest") >= 0){
      $('.h4-start-game').html('Welcome back '+localStorage.getItem('email')+' wanna play a game you can ? You can <a id="#loginModal" data-toggle="modal" data-target="#loginModal"><b class="bLogin">Login</b></a> anytime, check this to register <i class="fa fa-arrow-right"></i> <input type="checkbox" id="register" value="1">.<br>Press Ctrl+S to start')
    }else{
      $('.h4-start-game').text('Welcome back '+localStorage.getItem('email')+' wanna play a game? Press Ctrl+S to start')
    }
    loginModalActive = false
  }
  
  $('#startGameModal').modal({
    backdrop: 'static',
    keyboard: false
  })
  
  $('#loginForm').submit(function(e){
    e.preventDefault()
    var data = $(this).serialize()
    var email = $('#email').val()

    socketInit(email)

    $.ajax({
        type: 'POST',
        url: 'http://localhost/tetris/backend/index.php/login',
        data: data,
        dataType: 'json',
        success: function (data) {
          if(data.message=='success'){
            bestScore = data.user.best_score
            $('#bestScore').text(bestScore)
            localStorage.setItem("bestScore",bestScore);
            $('#userOnline').text(email)
            localStorage.setItem('email',email);
            $('#loginModal').toggle();
            $('#loginModal').removeClass('show');
            loginModalActive = false;
            $('.h4-start-game').text('Press Ctrl+S to start the game')
            if(data.user == null)
            {
              alert("User doesn't exists!")
            }
          }
        }
    });
  })
  
  $('#guest').click(function(){
    var guest = 'Guest_'+Math.floor(Math.random()*90000)
    localStorage.setItem('email', guest)

    socketInit(guest)

    $('#userOnline').text(guest);
    $('#loginModal').toggle();
    loginModalActive = false;
    $('.h4-start-game').text('Press Ctrl+S to start the game')
  })

  $('#loginModal').click(function(){
    loginModalActive = true
  });

  $('#chatForm').submit(function(e){
      e.preventDefault(); // prevents page reloading
      socket.emit('chat_message', $('#txt').val())
      $('#txt').val('');
      return false;
  });

  function socketInit(email){
    socket = io.connect('http://localhost:8080');
    socket.emit('email', email);

    socket.on('chat_message', function(msg){
      $('#messages').append($('<li>').html(msg));
      $('.col-3').scrollTop($('.col-3')[0].scrollHeight);
    });

    socket.on('is_online', function(email) {
      $('#messages').append($('<li>').html(email));
    });

    socket.on('best_score', function(data) {
      $('#bestestScore').html(data);
    });
  }

  $('#toggleChat').click(function(){
    if($('.messagesDiv').children().slice(0,2).css('display') == 'none')
    {
      $('.messagesDiv').children().slice(0,2).css('display','block');
      $(this).text('Hide Chat')
    }
    else
    {
      $('.messagesDiv').children().slice(0,2).css('display','none');
      $(this).text('Show Chat')
    }
  })
})
