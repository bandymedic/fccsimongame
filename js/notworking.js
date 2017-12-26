https://codepen.io/anjalim/pen/WOZNdZ?editors=0010
/*global $*/
/*global sendNumber */
/*global f1, s1, f2, s2, f3, s3, f4, s4*/

// listener for btn, plays tone
var currentAudio = new Audio("");
var alt = false;

//random number gen 1-4
function nextInSequence() {
    return Math.floor(Math.random() * 5);
}

//displays message on counter with by id
function displayMessage(message, id) {
    var location = "#" + (arguments.length === 2 ? id : "display");
    $(location).text(message);
}

//displays message on counter, blinks it 3 times
//then displays alt message if provided
function flashMessage(message, id, substitute) {
    var location = "#" + (arguments.length >= 2 ? id : "display");
    $(location).text(message);
    $(location).fadeOut(function() {
     $(location).fadeIn(function() {
      $(location).fadeOut(function() {
        $(location).fadeIn(function() {
          $(location).fadeOut(function() {
            $(location).fadeIn(function() {
              displayMessage(substitute, id);
            });
          });
        });
      });
    });
  });
}

//creates a flashMessage to be added to the queue
function createFlashMessage(message, id, substitute) {
    return function(next) {
        flashMessage(message, id, substitute);
        setTimeout (function() {
            next();
        }, 2800);
    };
}

//compares a full sequence with every element of a shorter sequence
function compare(full_sequence, short_sequence) {
    var result = true;
    for (var i = 0; i < short_sequence.length; i++) {
        if (short_sequence[i] != full_sequence[i]) {
            result = false;
            break;
        }
    }
    return result;
}

//takes an id and changes its color
function colorIt(id, time, isOn, next) {
    setTimeout(function() {
     if (isOn) {
         $("#btn" + id).addClass("btn" + id + "_on");
     } else {
         $("#btn" + id).removeClass("btn" + id + "_on");
     }
     next();
    }, time);
}

//creates a colorIt to be added to the queue
function createTask(arr, number, time, isOn) {
    return function(next) {
        colorIt(arr[number], time, isOn, next);
    };
}

//changes color based on id
function getColor(id) {
  switch (id) {
    case 0:
      return "#00ff00";
    case 1:
      return "#00ffff";
    case 2:
      return "#ff0000";
    case 3:
      return "#ffff00";
  }
}

//passes a function that changes css color
function makeColorChange(id) {
    $(this).css({
        "background-color": event.type === 'mousedown' ? getColor(id) : "",
        "box-shadow": "0 0 " + (event.type === 'mousedown' ? "10px " : "0px ") + getColor(id),
    });
}

//disables all buttons
function makeUnclickable() {
  var ids = [1, 2, 3, 4];
  ids.map(function(id) {
    document.getElementById("b" + id).removeEventListener("click", sendNumber);
    $("#btn" + id).css("cursor", "default");
    $("#btn" + id).removeClass("btn" + id + "_active");
  });
  document.getElementById("btn1").removeEventListener("mousedown", f1);
  document.getElementById("btn1").removeEventListener("mouseup", s1);
  document.getElementById("btn2").removeEventListener("mousedown", f2);
  document.getElementById("btn2").removeEventListener("mouseup", s2);
  document.getElementById("btn3").removeEventListener("mousedown", f3);
  document.getElementById("btn3").removeEventListener("mouseup", s3);
  document.getElementById("btn4").removeEventListener("mousedown", f4);
  document.getElementById("btn4").removeEventListener("mouseup", s4);
}

//enables all buttons
function makeClickable() {
  var ids = [1, 2, 3, 4];
  ids.map(function(id) {
    document.getElementById("btn" + id).addEventListener("click", sendNumber);
    $("#btn" + id).css("cursor", "pointer");
    $("#btn" + id).addClass("btn" + id + "_active");
  });
  document.getElementById("btn1").removeEventListener("mousedown", f1);
  document.getElementById("btn1").removeEventListener("mouseup", s1);
  document.getElementById("btn2").removeEventListener("mousedown", f2);
  document.getElementById("btn2").removeEventListener("mouseup", s2);
  document.getElementById("btn3").removeEventListener("mousedown", f3);
  document.getElementById("btn3").removeEventListener("mouseup", s3);
  document.getElementById("btn4").removeEventListener("mousedown", f4);
  document.getElementById("btn4").removeEventListener("mouseup", s4);
}

function createSound(id) {
    return function(next) {
        playAudioWithId(id); /*global playAudioWithId */
        next();
    };
}

function stopSound(id) {
    return function(next) {
        stopAudioWithId(id); /*global stopAudioWithId */
        next();
    };
}

// game object constructor
function Game(isStrict) {
  
      // expected sequence of clicks from the player
      this.expect = [nextInSequence()];
      this.strict = isStrict;
      // number of clicks in this turn, starts in zero
      this.clicks = 0;
      // number of turns, starts on 1
      this.turn = 1;
      // terminates all running tasks when true
      this.shutdown = false;
      
      // returns number of turns
      this.getTurn = function() {
        return this.expect.length;
      };
  
      // adds a new element to expect and updates turns and clicks
      this.addToSequence = function() {
        this.expect.push(nextInSequence());
        this.turn = this.getTurn();
        this.clicks = 0;
      };
  
      // plays sequence of button clicks for player
      this.play = function(sequence) {
        if(this.shutdown) {
          return;
        } else {
          // makes buttons unclickable
          $(document).queue('playing', function(next) {
            makeUnclickable();
            next();
          });
        
          // plays expected sequence
          for (var i = 0; i < sequence.length; i++) {
            var time_on = 1000;
            var time_off = 300;
            // change time as game progresses
            if(this.turn >= 5) {
              time_on = 700;
              if(this.turn >= 9) {
                time_on = 500;
                if(this.turn >= 13) {
                  time_on = 300;
                }
              }
            }
        
            // waits 300 ms and changes .square background-color 
            $(document).queue('playing', createTask(sequence, i, time_off, true));
            $(document).queue('playing', createSound(sequence[i]));
            // waits 700 ms and changes .square background-color back to original
            $(document).queue('playing', createTask(sequence, i, time_on, false));
            $(document).queue('playing', stopSound(sequence[i]));
          }
      
        // makes buttons clickable again
        $(document).queue('playing', function(next) {
          makeClickable();
          next();
        });
        // execute queue
        $(document).dequeue('playing');
      }
      };
    
      // repeats a play if player makes a mistake
      this.replay = function() {
        // displays message
        $(document).queue('playing', createFlashMessage("!!", "display", this.turn < 10 ? "0" + this.turn : this.turn));
        // reset correct clicks
        this.clicks = 0;
        // replays expected sequence
        this.play(this.expect);
      };
    
      // continues the game if player gets everything right
      this.continue = function() {
        // increments sequence
        this.addToSequence();
        // display the level
        var text = this.turn < 10 ? "0" + this.turn : this.turn;
        makeUnclickable();
        $(document).queue('playing', createFlashMessage(text, "display", text));
        // plays it all back to player
        this.play(this.expect);
      };
    
      // resets game
      this.reset = function() {
        this.expect = [nextInSequence()];
        this.strict = isStrict;
        this.clicks = 0;
        this.turn = 1;
        
        // starts the game
      this.start = function() {
        this.reset();
        //flashMessage("01","display");
        $(document).queue('playing', createFlashMessage("01", "display"));
        this.play(this.expect);
      };
      // ends game
      this.end = function(win) {
        makeUnclickable();
      if(!win) {
        $(document).queue('playing', createFlashMessage("!!", "display", "--"));
      } else {
        $(document).queue('playing', createFlashMessage("WIN", "display")); 
        this.play([1,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4]); 
        $(document).queue('playing',function(next){makeUnclickable();next();});
      }
      $(document).dequeue('playing');          
      };
      
      // compares current clicked button to expected
      this.isCorrect = function(number) {
      // if the number clicked is correct
      if (number === this.expect[this.clicks]) {
        // a correct button was clicked
        this.clicks += 1;
        // if it was the last button in the sequence
        if (this.clicks === this.turn) {
          if(this.turn === 20) {
            this.end(true);
          } else {
            this.continue();          
          }
        }
        } else {
        // if not strict, replay
        if (!this.strict) {
          this.replay();
        } else {
          // if strict, end game
          this.end();
        }
        }
      };
      };
    
      // starts the game
      var game = new Game(false);

      // event listener for the buttons, sends the id number to game.isCorrect
      function sendNumber() {
          var number = parseInt($(this).attr('id')[1], 10);
           game.isCorrect(number);
      }
    
      // loads all audios that will be used
      var g1 = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound1.mp3");
      var g2 = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound2.mp3");
      var g3 = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound3.mp3");
      var g4 = new Audio("https://s3.amazonaws.com/freecodecamp/simonSound4.mp3");
    
      // functions to play and stop audio associated with a number
      function playAudioWithId(number) {
        switch (number) {
          case 1:
            if (!alt) {
              g1.currentTime = 0;
              g1.play();
            }
            break;
          case 2:
            if (!alt) {
              g2.currentTime = 0;
              g2.play();
            }
            break;
          case 3:
            if (!alt) {
              g3.currentTime = 0;
              g3.play();
            }
            break;
          case 4:
            if (!alt) {
              g4.currentTime = 0;
              g4.play();
            }
            break;
        }
      }

      function stopAudioWithId(number) {
        switch (number) {
          case 1:
            if (!alt) {
              g1.pause();
            }
            break;
          case 2:
            if (!alt) {
              g2.pause();
            }
            break;
          case 3:
            if (!alt) {
              g3.pause();
            }
            break;
          case 4:
            if (!alt) {
              g4.pause();
            }
            break;
        }
      }
    
      // helper function to assign a number to the player/stopper functions
      function createPlayer(number) {
        return function() {
          playAudioWithId(number);
        };
      }
    
      function createStopper(number) {
        return function() {
          stopAudioWithId(number);
        };
      }
    
      // audio players and stoppers for each number (corresponds to each button)
      var f1 = createPlayer(1);
      var s1 = createStopper(1);
      var f2 = createPlayer(2);
      var s2 = createStopper(2);
      var f3 = createPlayer(3);
      var s3 = createStopper(3);
      var f4 = createPlayer(4);
      var s4 = createStopper(4);
    
      var game = new Game();
        
    $(document).ready(function() {
      $("#all").css({
        "min-height": $(window).height() + "px",
      });
    
      var off = true;
        

      $("#switch, #holder").click(function() {
        if(off) {
            $("#switch").css("left","55px");      
            off = false;
            $("#display").text("--");
            $("#display").css("color","red");
            $("#btn1-top,#btn2-top,#btn3-top,#btn4-top").css("z-index","-1");      
            $("#btn1-top,#btn2-top,#btn3-top,#btn4-top").css("visibility","hidden");            
        } else {
            $("#switch").css("left","25px"); 
            off = true;
            game.shutdown = true;
            makeUnclickable();
            $("#display").text("--");
            $("#display").css("color","rgba(215,0,0,0.2)");
            $("#btn1-top,#btn2-top,#btn3-top,#btn4-top").css("z-index","2");
          $("#btn1-top,#btn2-top,#btn3-top,#btn4-top").css("visibility","visible");           
        }
      }); 
    
      $("#start").click(function() {
        if(off) {
        
        } else {
            game.reset();
            game.shutdown = false;
            game.start();
        }
      });
    
      var indicator_state = false;
      $("#strict").click(function() {
        if(off) {
        
        } else {
            if(!indicator_state) {
              $("#indicator").css("background-color","red");
              game.strict = true;
              indicator_state = true;
            } else {
              $("#indicator").css("background-color","black");        
              game.strict = false;
              indicator_state = false;
            }
        }
      });
});
}