import { useEffect } from 'react';
import { chessMovesToEnglish } from '../utils/chessUtils';

export default function AudioPlayer({ text, shouldPlay }) {
    useEffect(() => {
        if (shouldPlay && text) {
            // convert chess notation to natural language if it looks like a chess move
            const isChessMove = /^([KQRBN][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x?[a-h][1-8]|O-O(-O)?)[+#]?$/.test(text);
            const speechText = isChessMove ? chessMovesToEnglish(text) : text;

            const utterance = new SpeechSynthesisUtterance(speechText);

            // customize these properties for chess move announcements
            // slightly slower rate for better clarity
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            utterance.lang = 'en-US';
            
            // speak the utterance
            window.speechSynthesis.speak(utterance);
            shouldPlay = false;
        }
    }, []);

    // this component doesn't render anything
    return null;
}
