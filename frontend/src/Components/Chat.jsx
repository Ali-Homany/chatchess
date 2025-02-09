import Message from "./Message";

export default function Chat({ messages, isCurrPlayerWhite }) {
    return (
        <div id="chat">
            {
                messages.map((message, index) => {
                    return (
                        <Message
                            key={index}
                            message={message}
                            isWhite={index % 2 == 0}
                            isOpponent={isCurrPlayerWhite != (index % 2 == 0)}
                        />
                    );
                }).reverse()
            }
        </div>
    );
}