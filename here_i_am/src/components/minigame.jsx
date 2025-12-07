import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../css/minigame.css";

const StartMiniGame = () => {
    const canvasRef = useRef(null);
    const [showGame,setShowGame] = React.useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {

        //if the user didnt press start the game
        if(!showGame){
            setScore(0);
            return;
        }

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // the canvas width & height, snake x & y, and the apple x & y, all need to be a multiples of the grid size in order for collision detection to work
        // (e.g. 16 * 25 = 400)
        var grid = 16;
        var count = 0;

        var snake = {
          x: 160,
          y: 160,

          // snake velocity. moves one grid length every frame in either the x or y direction
          dx: grid,
          dy: 0,

          // keep track of all grids the snake body occupies
          cells: [],

          // length of the snake. grows when eating an apple
          maxCells: 4
        };
        var apple = {
          x: 320,
          y: 320
        };

        // get random whole numbers in a specific range
        // @see https://stackoverflow.com/a/1527820/2124254
        function getRandomInt(min, max) {
          return Math.floor(Math.random() * (max - min)) + min;
        }

        // game loop
        function loop() {
          requestAnimationFrame(loop);

          // slow game loop to 15 fps instead of 60 (60/15 = 4)
          if (++count < 4) {
            return;
          }

          count = 0;
          context.clearRect(0,0,canvas.width,canvas.height);

          // move snake by it's velocity
          snake.x += snake.dx;
          snake.y += snake.dy;

          // wrap snake position horizontally on edge of screen
          if (snake.x < 0) {
            snake.x = canvas.width - grid;
          }
          else if (snake.x >= canvas.width) {
            snake.x = 0;
          }

          // wrap snake position vertically on edge of screen
          if (snake.y < 0) {
            snake.y = canvas.height - grid;
          }
          else if (snake.y >= canvas.height) {
            snake.y = 0;
          }

          // keep track of where snake has been. front of the array is always the head
          snake.cells.unshift({x: snake.x, y: snake.y});

          // remove cells as we move away from them
          if (snake.cells.length > snake.maxCells) {
            snake.cells.pop();
          }

          // draw apple
          context.fillStyle = 'red';
          context.fillRect(apple.x, apple.y, grid-1, grid-1);

          // draw snake one cell at a time
          context.fillStyle = 'green';
          snake.cells.forEach(function(cell, index) {

            // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
            context.fillRect(cell.x, cell.y, grid-1, grid-1);

            // snake ate apple
            if (cell.x === apple.x && cell.y === apple.y) {
              snake.maxCells++;
              //get 100 points per apple
              setScore((prev) => prev + 100);

              // canvas is 400x400 which is 25x25 grids
              apple.x = getRandomInt(0, 25) * grid;
              apple.y = getRandomInt(0, 25) * grid;
            }

            // check collision with all cells after this one (modified bubble sort)
            for (var i = index + 1; i < snake.cells.length; i++) {

              // snake occupies same space as a body part. reset game
              if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                snake.x = 160;
                snake.y = 160;
                snake.cells = [];
                snake.maxCells = 4;
                snake.dx = grid;
                snake.dy = 0;

                apple.x = getRandomInt(0, 25) * grid;
                apple.y = getRandomInt(0, 25) * grid;

                //reset score
                setScore(0);
              }
            }
          });
        }

        // listen to keyboard events to move the snake
        function handleKey(e) {
          // prevent snake from backtracking on itself by checking that it's
          // not already moving on the same axis (pressing left while moving
          // left won't do anything, and pressing right while moving left
          // shouldn't let you collide with your own body)

          // left arrow key
          if (e.key === "a" && snake.dx === 0) {
            snake.dx = -grid;
            snake.dy = 0;
          }
          // up arrow key
          else if (e.key === "w" && snake.dy === 0) {
            snake.dy = -grid;
            snake.dx = 0;
          }
          // right arrow key
          else if (e.key === "d" && snake.dx === 0) {
            snake.dx = grid;
            snake.dy = 0;
          }
          // down arrow key
          else if (e.key === "s" && snake.dy === 0) {
            snake.dy = grid;
            snake.dx = 0;
          }
        }
        document.addEventListener('keydown', handleKey);

        // start the game
        requestAnimationFrame(loop);

        return () => {
            document.removeEventListener('keydown', handleKey);
        };

    },[showGame]);


    return(
        <div>
            {!showGame && (
            <button className="start" onClick={() => setShowGame(true)}>
              Start
            </button>)
            }
            {showGame &&
            (<div>
                <h1 className="score">
                    Score: {score}
                    <button className="start" onClick={() => setShowGame(false)}>
                        Stop
                    </button>
                </h1>
                <canvas showGame ref={canvasRef} className="gameCanvas" width="400" height="400" id="game"/>



            </div>)
            }

        </div>
    );
}

export default StartMiniGame;