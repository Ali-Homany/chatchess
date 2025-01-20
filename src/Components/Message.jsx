export default function Message({ message, isWhite }) {
    return (
        <div className={`message ${isWhite ? "white" : "black"}`}>
            {message}
        </div>
    );
}