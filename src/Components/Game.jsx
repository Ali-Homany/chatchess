import { useState } from "react";
import Chat from "./Chat";
import Player from "./Player";

export default function Game() {
    const [messages, setMessages] = useState([
        'e4', 'e5', 'Nf3', 'Nc6', 'd4', 'exd4', 'Nxd4', 'Nxd4', 'Qxd4'
    ]);


    function leaveGame() {
        var confirm = window.confirm("Are you sure you want to leave the game?");
        if (!confirm) return;
        window.location.href = "/"
    }


    return (
        <div id="game">
            <div className="space"></div>
            <Player username="Whoever" elo="1254" profile_path="../../images/profile.png" isWhite={false}/>
            <Chat messages={messages}/>
            <Player username="ThiBest" elo="1326" profile_path="../../images/profile.png" isWhite={true}/>
            <div className="space"></div>
            <input id="move-text-input" type="text" placeholder="Type in your move.." maxLength={7}/>
            <div id="controls">
                <button id="leave-btn" onClick={() => leaveGame()}>Leave</button>
                <button id="confirm-btn">Confirm Move</button>
            </div>
        </div>
    );
}