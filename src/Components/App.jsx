import Game from './Game';
import Home from './Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
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
                    <Route path="/" element={<Home />} />
                    <Route path="/game/:gameID" element={<Game />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
