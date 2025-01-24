export default function Player({ username, profile_path, isWhite, isConnected }) {
    return (
        <div className={`player ${isWhite ? "white" : "black"}`}>
            <img src={profile_path}/>
            <div className="player-info">
                <p className="player-username">{username}</p>
                <p className="player-status">{isConnected ? "Connected" : "Disconnected"}</p>
            </div>
        </div>
    );
}