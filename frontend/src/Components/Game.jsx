import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import Chat from "./Chat";
import Player from "./Player";

export default function Game({ curr_username }) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [secondPlayer, setSecondPlayer] = useState("Unknown");
    const [isSecondPlayerConnected, setIsSecondPlayerConnected] = useState(false);
    const [isCurrPlayerWhite, setIsCurrPlayerWhite] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        if (error) {
            // Clear error after 3 seconds
            setTimeout(() => setError(null), 3000);
        }
    }, [error]);

    const [socket, setSocket] = useState(null);
    const [gameRoomId] = useState(useParams().gameRoomId);
    useEffect(() => {
        if (!gameRoomId) return;

        const sock = io(process.env.REACT_APP_SERVER_URL, {
            query: {"game_room_id": gameRoomId, "username": curr_username},
        });
        sock.on('connect', () => {
            console.log('Connected to server');
        })
        // Listen for messages from the server
        sock.on('message', (newMessage) => {
                console.log('Received message:', newMessage);
                setMessages(prevMessages => [...prevMessages, newMessage]);
            }
        );
        sock.on('error', (error) => {
            console.error('Error:', error);
            // Store the error message
            setError(error.message);
        });
        sock.on('game_over', (result) => {
            console.log('Result: ', result);
            endGame(result);
            sock.disconnect();
        });
        setSocket(sock);

        // fetch game data
        updateGameData();

        // Cleanup the listener when the component unmounts
        return () => {
            sock.off('message');
            sock.off('error');
            sock.disconnect();
        };
    }, [ gameRoomId ]);


    async function updateGameData() {
        const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/game/${gameRoomId}`).then(res => res.json());
        if (res.error) {
            alert(res.error);
            navigate("/");
            return;
        }
        // fill second player data
        // case 1: no second player yet
        if (res.players.white === null || res.players.black === null) {
            setSecondPlayer('Unknown');
            setIsSecondPlayerConnected(false);
            setIsCurrPlayerWhite(res.players.black === null);
        }
        // case 2: curr player is not white
        else if (res.players.white.username !== curr_username) {
            setSecondPlayer(res.players.white.username);
            setIsSecondPlayerConnected(res.players.white.connected);
            setIsCurrPlayerWhite(false);
        }
        // case 3: curr player is white
        else {
            setSecondPlayer(res.players.black.username);
            setIsSecondPlayerConnected(res.players.black.connected);
            setIsCurrPlayerWhite(true);
        }
        // fill messages
        setMessages(res.messages);
        console.log("Messages: ", res.messages);
    }
    function leaveGame() {
        var confirm = window.confirm("Are you sure you want to leave the game?");
        if (!confirm) return;
        socket.disconnect();
        navigate("/");
    }
    function sendMessage() {
        const message = document.querySelector("#move-text-input").value;
        socket.emit('message', message);
        document.querySelector("#move-text-input").value = '';
    }
    function endGame(result) {
        if (result['is_draw']) {
            alert("Game Over! It is a draw.");
        }
        var outcome = result['termination_type']
        if (result['winner'] === curr_username) {
            alert(`Congrats! You won by ${outcome}!`);
        }
        else {
            alert(`Sorry, you lost by ${outcome}. Better luck next time!`);
        }
        navigate("/");
    }


    return (
        <div id="game">
            <div className="space"></div>
            <Player id="opponent" username={secondPlayer} profile_path="../../images/profile.png" isWhite={!isCurrPlayerWhite} isConnected={isSecondPlayerConnected}/>
            <Chat messages={messages}/>
            <Player id="me" username={curr_username} profile_path="../../images/profile.png" isWhite={isCurrPlayerWhite} isConnected={true}/>
            <div className="space"></div>
            {error && <div className="error-message">{error}</div>}
            <input id="move-text-input" type="text" placeholder="Type in your move.." maxLength={7}/>
            <div id="controls">
                <button id="leave-btn" onClick={() => leaveGame()}>Leave</button>
                <button id="confirm-btn" onClick={() => sendMessage()}>Confirm Move</button>
            </div>
        </div>
    );
}