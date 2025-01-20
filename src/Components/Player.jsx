export default function Player({ username, elo, profile_path, isWhite }) {
    return (
        <div className={`player ${isWhite ? "white" : "black"}`}>
            <img src={profile_path}/>
            <div className="player-info">
                <p className="player-username">{username}</p>
                <p className="player-elo">{elo}</p>
            </div>
        </div>
    );
}