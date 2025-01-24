import { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Game from './Game';
import Home from './Home';

function App() {
    const [curr_username, setCurr_username] = useState(() => {
        return sessionStorage.getItem('username') || null;
    });
    useEffect(() => {
        if (curr_username) {
            sessionStorage.setItem('username', curr_username);
        }
    })
    

    return (
        <div className="App">
            <div id="app-header">
                <img id='logo' src="../../images/logo.png"/>
                <h1 id="app-title">
                    <span>C</span>
                    hatChess
                </h1>
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home curr_username={curr_username} setCurr_username={setCurr_username}/>} />
                    <Route path="/game/:gameRoomId" element={<Game curr_username={curr_username}/>} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
