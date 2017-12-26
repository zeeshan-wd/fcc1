/**
* simon.js
* Author: Zeeshan
*/


var simon = { // Simon object to hold info about game status
  moveSequence: [], // Movements Simon performs every turn
  isStrict:     false // 'Strict' - Game resets if Users loses round
};

var gameButtons     = document.getElementsByClassName('simon-button-game'), // Game buttons
    playerMoveCount = 0; // Number of moves the User has performed in a turn


/*
* @desc - Sets up the functionality and behavior of in-game buttons,
* while pre-disabling the game initially.
*/
function gameSetup() {
  toggleGameButtons(); // pre-disable buttons on load
  gameButtonSetup();
  settingsButtonSetup();
}

/*
* @desc - Handles the main-game button (4) setup / function.
*/
function gameButtonSetup() {
  for (var i = 0; i < gameButtons.length; i++) {
    var currButton = gameButtons[i];
    currButton.onclick = function(btn) {
      return function() {
        checkSequence(btn); // Whether or not the choice made was the correct move
      };
    }(currButton);
  }
}

/*
* @desc - Handles the game-setting buttons ('Start' & 'Strict) setup.
*/
function settingsButtonSetup() {
  var startButton  = document.getElementById('simon-button-start'); // Start & Strict Buttons
  var strictButton = document.getElementById('simon-button-strictmode');
  
  startButton.onclick = function() {
    this.disabled = true;
    this.style.opacity = 0.5;
    playSimonGame(); // Start the game
  }
  
  strictButton.onclick = function() {
    simon.isStrict = !simon.isStrict; // Flip the 'Strict' Mode when clicked (T/F)
    if (simon.isStrict) { // Switched to 'Strict', update UI colors
      document.getElementById('strict-on').style.color = 'red';
      document.getElementById('strict-off').style.color = '#717171';
    } 
    else { // Switched from 'Strict', remove UI colors
      document.getElementById('strict-on').style.color = '#717171';
      document.getElementById('strict-off').style.color = 'black';
    }
  }
}

/*
* @desc - Determines if the recent User move was the correct choice
* in the sequence of Simon moves.
* @params - gameButton: The button recently clicked (User's move).
*/
function checkSequence(gameButton) {
  if (gameButton === simon.moveSequence[playerMoveCount]) { // Correct move
    if (playerMoveCount === simon.moveSequence.length-1) { // No more moves in Simon sequence to check
      playerMoveCount = 0; // Reset score for next round
      toggleGameButtons(); // Re-disable buttons
      setTimeout(function() {simonMove();}, 1000); // Perform the next Simon move
    } 
    else { // Continue current round
      playerMoveCount++; // Increase player move (click) count
    }
    gameButtonAudio(gameButton); // Play audio for the button's click
  } 
  else { // Wrong move, reset round or game
    if (simon.isStrict) { // Reset Game
       resetGame();
    } 
    else { // Reset turn only
       resetTurn();
    }
    playerMoveCount = 0; // Reset player's move count
  }
}

/*
* @desc - Handles the Start button click, kicks off the game (1st round)
*/
function playSimonGame() {
  setTimeout(function() {simonMove();}, 1000); // Perform first Simon move
}

/*
* @desc - Generates the move for Simon to make; done by randomizing a move and
* then assuring it is not the same as the previous.
*/
function generateNextSimonMove() {
  var randomSimonMove   = gameButtons[Math.floor(Math.random()*(gameButtons.length))]; // Random Simon move
  var previousSimonMove = simon.moveSequence[simon.moveSequence.length-1]; // Most recent Simon move
  if (randomSimonMove === previousSimonMove) { // Repeat move, re-generate
    generateNextSimonMove();
  } 
  else { // Not a repeat, add to sequence
    simon.moveSequence.push(randomSimonMove);
  }
}

/*
* @desc - Adds a new move to Simon's sequence, and then animates that sequence.
*/
function simonMove() {
  generateNextSimonMove(); // Generate move
  simonAnimateSequence(); // Animate the sequence
  setTimeout(function() { // Re-enable buttons, update turn count
    updateTurns();
    toggleGameButtons();
  }, 1000*(simon.moveSequence.length));
}

/*
* @desc - Performs the animations and audio affects for each of the buttons
* in the sequeunce animated by Simon.
*/
function simonAnimateSequence() {
  for (var i = 0; i < simon.moveSequence.length; i++) { // Animate each button in sequence
    var currButton = simon.moveSequence[i];
    setTimeout(function(btn) {
      return function(){
        $(btn).toggleClass('simon-sequence-animation', 300); // Transition scale / shadow
        $(btn).removeClass('simon-sequence-animation', 300); // Remove transition
        setTimeout(function() {gameButtonAudio(btn);}, 310); // Play associated audio
      };
    }(currButton), 650*i);
  }
}

/*
* @desc - Toggles the disabled boolean for each of the game main gaim buttons.
*/
function toggleGameButtons() {
  for (var i = 0; i < gameButtons.length; i++) {
    var currButton = gameButtons[i];
    currButton.disabled = !currButton.disabled; // Toggle
  }
}

/*
* @desc - Increase the turn count after each round accordingly.
*/
function updateTurns() {
  if (parseInt(document.getElementById('score-right').innerHTML) === 9) { // Need to update tens place
    var newTensPlaceScore = parseInt(document.getElementById('score-left').innerHTML)+1; // Increase tens place by 1
    document.getElementById('score-left').innerHTML  = newTensPlaceScore; // Set next tens place
    document.getElementById('score-right').innerHTML = 0;
  } 
  else {
    document.getElementById('score-right').innerHTML++; // Increase count in ones place
  }
}

/*
* @desc - Handles when user makes an incorrect move in the sequence; re-performs the 
* Simon animation of the sequence, player can play again.
*/
function resetTurn() {
  toggleGameButtons();
  resetTurnAudio(); // Play reset-game audio
  setTimeout(function() {simonAnimateSequence();}, 2000);
  setTimeout(function() {toggleGameButtons();}, 1000*(simon.moveSequence.length)); // Re-enable buttons
}

/*
* @desc - Handles when user makes an incorrect move while 'Strict' mode is enabled (instantly lose).
* Resets the turn count and replays the game.
*/
function resetGame() {
  toggleGameButtons();
  resetGameAudio();
  document.getElementById('score-left').innerHTML  = 0;
  document.getElementById('score-right').innerHTML = 0;
  simon.moveSequence = [];
  setTimeout(function() { // Re-enable start button for user to click
    document.getElementById('simon-button-start').disabled      = false;
    document.getElementById('simon-button-start').style.opacity = 1.0;}, 4000);
}

/*
* @desc - Plays the audio track for resetting the game ('simon-lose-round.mp3').
*/
function resetTurnAudio() {
  var soundFile  = '/sounds/simon-lose-round.mp3';
  var resetAudio = new Audio(soundFile);
  resetAudio.play(); // Play audio
}

/*
* @desc - Plays the audio for when a main game button (4) was clicked, according
* to the color of the button.
*/
function gameButtonAudio(button) {
  var soundFile   = '/sounds/simon-'+button.id.replace('simon-button-','') + '.mp3'; // Get audio
  var buttonAudio = new Audio(soundFile);
  buttonAudio.play();
}

/*
* @desc - Plays the audio for when the game was reset (User lost with 'Strict Mode on).
*/
function resetGameAudio() {
  var soundFile   = '/sounds/simon-lose-game.mp3'; // Single beep sound
  var soundFile2  = '/sounds/simon-lose-round.mp3'; // Drawn-out sound
  var resetAudio  = new Audio(soundFile);
  var resetAudio2 = new Audio(soundFile2);
  setTimeout(function() {resetAudio.play();}, 500); // Play 2 beeps first
  setTimeout(function() {resetAudio.play();}, 1500);
  setTimeout(function() {resetAudio2.play();}, 2500); // Play remaining drawn-out soundtrack
}

gameSetup(); // Provide setup to the game (UI Buttons).