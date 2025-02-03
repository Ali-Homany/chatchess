BACKEND  
- ✅ chess game: manages the board and verifies moves  
- ✅ chat manager (flask socketio)  
- db manager (saves users, chats, games)  

FRONTEND  
- ✅ chat interface (2 players text messages)  
- ✅ open voice recorder
    - ✅ streaming on client-side, probably using native MediaRecorder API
    - ✅ end of curr msg automatically detected, [hark.js](https://www.npmjs.com/package/hark/v/0.0.1) may work
- ✅❌ stt to transcribe voice into a move (multimodal model; accepts prompt + finite audio file)
- tts to read aloud recieved moves (maybe [WebSpeechAPI SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API))