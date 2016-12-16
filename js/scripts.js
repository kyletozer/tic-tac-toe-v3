'use strict';

(function() {

	var game;

	var body = $('body');
	var box = $('.box');
	var players = $('.players');



	function Game() {
		this.turn = 0;
		this.players = [];
		this.winSets = [
      [0, 4, 8],
      [2, 4, 6],
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8]
    ];
	}

  // updates the game object's turn property and turn indicator html elements after successful move
	Game.prototype.updateBoard = function() {
		this.turn += 1;

		var playerIndicator = $('#player' + this.getPlayer());
		var activeClass = 'active';

		playerIndicator.siblings().removeClass(activeClass);
		playerIndicator.addClass(activeClass);
	};

  // handles the all the events bound to the box elements
	Game.prototype.spaceAction = function(event) {
    // checks if the space has been claimed by another player; after that, checks event type of handler
		if($(this).attr('class').indexOf('box-filled-') === -1) {

			if(event.type === 'mouseenter') {
        $(this).css('background-image', 'url("img/' + game.getPlayer(true) + '.svg")');

			}else if(event.type === 'mouseleave') {
        $(this).css('background-image', 'none');

      }else{  // else block is click event type

        // reference to the player's score array for win checking
        var playerScore = game.players[game.getPlayer() - 1].score;

        // add class for claimed space
        $(this).addClass('box-filled-' + game.getPlayer());

        // push index of claimed box into player's score array
        playerScore.push($(this).index());

        // check for win
        // loops through each win set
        for(var i = 0; i < game.winSets.length; i++) {
          var winSet = game.winSets[i];

          // loops through each space in a win set and checks if that space is located in the player's score
          for(var j = 0; j < winSet.length; j++) {
            var space = winSet[j];
            var inScore = playerScore.indexOf(space);

            if(inScore === -1){break;}

            // if the loop runs for the full length of a win set, a player possesses a win
            if(j === winSet.length - 1){
              return game.over();
            }
          }
        }
        game.updateBoard();

        // the turn count of a tied game will be 10, the value argument passed to the over method on the game object is irrelevant but used to determine a tie game
        if(game.turn > 9){
          game.over('tie');
        }

        // determines random computer move
        // checks that the second players name is null, that it is the second players turn
        if(!game.players[1].name && game.turn % 2 === 0){

          var availableSpaces = $('.box').not('.box-filled-1, .box-filled-2');
          var randomIndex = Math.round(Math.random() * ((availableSpaces.length - 1) - 0) + 0);
          var space = $(availableSpaces[randomIndex]);
          var clickBlocker = body.find('.click-blocker');

          setTimeout(function(){
            space.trigger('click');
            space.css('background-image', 'url("img/x.svg")');

            clickBlocker.hide();
          }, 3000);

          clickBlocker.show();
        }
      }
		}
	};

  // helper method for determining player turns
	Game.prototype.getPlayer = function(returnValueAsPlayerMarker) {
		var player;

		if (this.turn % 2 !== 0) {
			player = 1;

		} else {
			player = 2;
		}

		if (returnValueAsPlayerMarker) {
			return(player === 1) ? 'o' : 'x';
		}
		return player;
	};

  // updates the DOM with the appropriate end game message
  Game.prototype.over = function(isTie) {
    var finish = body.find('#finish');
    var messageDiv = finish.find('.message');
    var message;

    if(isTie){
      finish.addClass('screen-win-tie');
      messageDiv.text('It\'s a tie!');

    } else {
      var player = (this.getPlayer() === 1) ? 'one' : 'two';
      var playerName = this.players[this.getPlayer() - 1].name;

      finish.addClass('screen-win-' + player);

      message = (playerName) ? playerName + ' Wins!' : 'Winner!';
      messageDiv.text(message);
    }
    finish.show();
  };



	function Player(side) {
    this.name = null;
		this.side;
		this.score = [];
	}

  Player.prototype.setPlayerName = function(playerNumber) {
    playerNumber += 1;

    var playerName;
    var promptMessage = 'What is player ' + playerNumber + '\'s name?';
    var timesPrompted = 0;

    // makes sure that the game has at least one human player before starting
    while(playerNumber === 1 && !Boolean(playerName)){

      if(timesPrompted > 0){
        playerName = prompt('Player 1 must have a name!');

      }else{
        playerName = prompt(promptMessage);
      }

      timesPrompted += 1;
    }

    if(playerNumber === 2){
      playerName = prompt(promptMessage + ' To play against the computer, leave this prompt empty.');

      // prompts player 2 to choose a name other than what player 1 has chosen
      while(playerName === game.players[0].name){
        playerName = prompt('Player 1 already has the name ' + playerName + '! Choose something different.');
      }
    }
    this.name = playerName;
  };


  // append the start and finish screens html to the DOM
	body.append(function() {
		var html = '';

		html += '<div class="screen screen-start" id="start">';
		html += '<header>';
		html += '<h1>Tic Tac Toe</h1>';
		html += '<a href="#" class="button">Start game</a>';
		html += '</header>';
		html += '</div>';

    html += '<div class="screen screen-win" id="finish" style="display:none">';
    html += '<header>';
    html += '<h1>Tic Tac Toe</h1>';
    html += '<p class="message"></p>';
    html += '<a href="#" class="button">New game</a>';
    html += '</header>';
    html += '</div>';

    html += '<div class="click-blocker"></div>';

		return html;
	});


  // start new game
	body.on('click', 'a', function() {
		var parent = $(this).closest('div');
    var finish = body.find('#finish');

    // hides the screen div when clicking on either the start game or new game buttons
		parent.hide();

    // initializes board boxes
    box.each(function(){
      $(this).css('background-image', 'none');
      $(this).attr('class', 'box');
    });

    // resets result screen classes
    finish.attr('class', 'screen screen-win');

    // sets the game variable to a new Game object for each new game
		game = new Game;

		game.players.push(new Player('o'));
		game.players.push(new Player('x'));

    // add player names to turn indicators if supplied
    game.players.forEach(function(player, index){
      player.setPlayerName(index);

      var playerIndicator = $(players[index]);

      if(player.name){
        playerIndicator.html(player.name);

      }else{

        playerIndicator.html(function(){

          if(index === 1 && !Boolean(player.name)){
            return 'COMPUTER';
          }
        });
      }
    });

		game.updateBoard();

		box.mouseenter(game.spaceAction);
		box.mouseleave(game.spaceAction);
		box.click(game.spaceAction);
	});

})();
