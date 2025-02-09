import AudioPlayer from './AudioPlayer';

export default function Message({ message, isWhite, isOpponent }) {
    return (
        <div className={`message ${isWhite ? "white" : "black"}`}>
            {message}
            <AudioPlayer 
                text={message} 
                // play only for black messages (opponent)
                shouldPlay={isOpponent}
            />
        </div>
    );
}