import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import Chat from "./Chat";
import Player from "./Player";

export default function Game() {
    const [gameId] = useState(useParams().gameId);
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!gameId) return;
        
        console.log(gameId);
        const sock = io(process.env.REACT_APP_SERVER_URL, {
            query: {"game_id": gameId, "username": "username"}
        });

        sock.on('connect', () => {
            console.log('Connected to server');
        })

        // Listen for messages from the server
        sock.on('message', (newMessage) => {
            if (newMessage.message) newMessage = newMessage.message
            console.log(newMessage)
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        setSocket(sock);

        // Cleanup the listener when the component unmounts
        return () => {
            sock.off('message');
            sock.disconnect();
        };
    }, [ gameId ]);


    function leaveGame() {
        var confirm = window.confirm("Are you sure you want to leave the game?");
        if (!confirm) return;
        if (socket) socket.disconnect();
        window.location.href = "/"
    }
    function sendMessage() {
        const message = document.querySelector("#move-text-input").value;
        socket.emit('message', message);
        document.querySelector("#move-text-input").value = '';
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
                <button id="confirm-btn" onClick={() => sendMessage()}>Confirm Move</button>
            </div>
        </div>
    );
}