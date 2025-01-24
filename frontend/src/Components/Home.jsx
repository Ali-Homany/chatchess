import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

export default function Home({ curr_username, setCurr_username }) {
    const navigate = useNavigate();
    // TODO: seperate error states for create and join
    const [error, setError] = useState(null);
    useEffect(() => {
        if (error) {
            setTimeout(() => setError(null), 3000);
        }
    }, [error]);
    const [newGameRoomId, setNewGameRoomId] = useState("");
    useEffect(() => {
        generateGameID();
    }, []);
    useEffect(() => {
        document.querySelector("#create-block input").setAttribute("data-full-id", newGameRoomId);
        document.querySelector("#create-block input").value = newGameRoomId.substring(0, 10) + "...";
        // hide error
        setError(null);
    }, [newGameRoomId]);
    const [existingGameRoomId, setExistingGameRoomId] = useState("");


    async function generateGameID() {
        var res = await fetch(process.env.REACT_APP_SERVER_URL + "/generate_game_room_id").then(res => res.json());
        setNewGameRoomId(res.gameRoomId);
        return newGameRoomId;
    }
    // TODO: add 'copied' message to user
    function copyIDToClipboard() {
        navigator.clipboard.writeText(document.querySelector("#create-block input").getAttribute("data-full-id"));
        setError("Copied to clipboard!");
    }
    async function startGame() {
        if (!curr_username) {
            setError("Please enter a username");
            return;
        }
        var res = await fetch(
            process.env.REACT_APP_SERVER_URL,
            {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({"game_room_id": newGameRoomId, "username": curr_username, "is_creator": true}),
            }
        ).then(res => res.json());
        if (res.error) {
            setError(res.error);
            return;
        }
        navigate(`/game/${newGameRoomId}`);
    }
    async function joinGame() {
        if (!curr_username) {
            setError("Please enter a username");
            return;
        }
        try {
            const res = await fetch(
                process.env.REACT_APP_SERVER_URL,
                {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({"game_room_id": existingGameRoomId, "username": curr_username, "is_creator": false}),
                }
            );
            
            const data = await res.json();
            
            if (res.ok) {
                // Successful join, navigate to game
                navigate(`/game/${existingGameRoomId}`);
            } else {
                // Show error
                setError(data.error);
            }
        } catch (error) {
            console.error("Join game error:", error);
        }
    }


    return (
        <div id="home">
            <div id="main">
                <input id="username-input" type="text" placeholder="username" onChange={(e) => setCurr_username(e.target.value)} />
                <details id="create-block">
                    <summary>
                        <p>Create Game</p>
                    </summary>
                    <div>
                        <svg id="refresh" onClick={() => generateGameID()} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M142.9 142.9c62.2-62.2 162.7-62.5 225.3-1L327 183c-6.9 6.9-8.9 17.2-5.2 26.2s12.5 14.8 22.2 14.8H463.5c0 0 0 0 0 0H472c13.3 0 24-10.7 24-24V72c0-9.7-5.8-18.5-14.8-22.2s-19.3-1.7-26.2 5.2L413.4 96.6c-87.6-86.5-228.7-86.2-315.8 1C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5c7.7-21.8 20.2-42.3 37.8-59.8zM16 312v7.6 .7V440c0 9.7 5.8 18.5 14.8 22.2s19.3 1.7 26.2-5.2l41.6-41.6c87.6 86.5 228.7 86.2 315.8-1c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.2 62.2-162.7 62.5-225.3 1L185 329c6.9-6.9 8.9-17.2 5.2-26.2s-12.5-14.8-22.2-14.8H48.4h-.7H40c-13.3 0-24 10.7-24 24z"/></svg>
                        {/* // TODO: add some info on this, this is game id to be shared */}
                        <input type="text" readOnly/>
                        <button id="copy-btn" onClick={copyIDToClipboard}>Copy</button>
                        <button id="start-btn" onClick={startGame}>Start</button>
                    </div>
                    <p className="error">{error || ""}</p>
                </details>
                <hr />
                <details id="join-block">
                    <summary>
                        <p>Join Game</p>
                    </summary>
                    <div>
                        <input type="text" placeholder="Paste Game ID" onChange={(e) => setExistingGameRoomId(e.target.value)} value={existingGameRoomId} />
                        <button id="join-btn" onClick={() => joinGame()}>Join</button>
                    </div>
                    <p className="error">{error || ""}</p>
                </details>
            </div>
        </div>
    );
}