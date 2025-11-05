import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/minigame.css";


const startMiniGame = () => {
    return(
        <div>
          <button onClick={() => alert('Button clicked!')}>
              Start
          </button>
        </div>
    );
}

export default startMiniGame;