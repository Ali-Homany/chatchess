import { useEffect, useRef, useState } from "react";
import hark from "hark";

export default function AutoRecord({ isCurrTurn, sendAudioClip }) {
	const [isRecording, setIsRecording] = useState(false);
	// variables to save inputted audio stream
	const audioChunksRef = useRef([]);
	// object to input audio stream
	const mediaRecorderRef = useRef(null);
	const speechEventsRef = useRef(null);


	useEffect(() => {
		console.log('useEffect hook executed');
		const startAutoRecording = async () => {
			console.log('startAutoRecording function called');
			try {
				// request permission to use the user's microphone
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				// create a MediaRecorder instance
				mediaRecorderRef.current = new MediaRecorder(stream);
				// define event handler, when new chunk of the stream is available
				mediaRecorderRef.current.ondataavailable = (event) => {
					console.log('i am alive, i can hear you!');
					audioChunksRef.current.push(event.data);
				};
				// define event handler, when recording is stopped
				mediaRecorderRef.current.onstop = () => {
					if (audioChunksRef.current.length > 0) {
						const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
						sendAudioClip(audioBlob);
						// Clear after sending
						audioChunksRef.current = [];
						const url = window.URL.createObjectURL(audioBlob);
						const a = document.createElement('a');
						document.body.appendChild(a);
						a.style.display = 'none';
						a.href = url;
						a.download = 'transcription.wav';
						a.click();
						window.URL.revokeObjectURL(url);
					}
				};
				// define event handler, when recording is started
				mediaRecorderRef.current.onstart = () => {
					setIsRecording(true);
				};

				mediaRecorderRef.current.start();

				// create hark instance
				speechEventsRef.current = hark(stream, {});

				// define event handler, when speech is detected
				speechEventsRef.current.on("speaking", () => {
					console.log("Speaking");
					if (!isCurrTurn) {
						console.log("Not Your turn");
						return;
					}
					// start recording when speech is detected
					if (mediaRecorderRef.current.state !== "recording") {
						mediaRecorderRef.current.start();
					}
				});
				// define event handler, when speech is stopped
				speechEventsRef.current.on("stopped_speaking", () => {
					if (!isCurrTurn) {
						console.log("Not Your turn");
						return;
					}
					// cleanup
					if (mediaRecorderRef.current.state === "recording") {
						mediaRecorderRef.current.stop();
					}
					console.log("Stopped speaking");
					// restart recording when speech is stopped
					setTimeout(() => {
						if (mediaRecorderRef.current.state !== "recording")
							mediaRecorderRef.current.start();
					}, 1000);
				});
			}
			catch (error) {
				console.error("Error accessing microphone:", error);
			}
		};

		startAutoRecording();

		return () => {
			if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
				mediaRecorderRef.current.stop();
			}
			if (speechEventsRef.current) {
				speechEventsRef.current.stop();
			}
			setIsRecording(false);
			mediaRecorderRef.current = null;
			speechEventsRef.current = null;
		};
	}, []);

	return (
		<div>
			<p>{isRecording && isCurrTurn ? "Recording..." : "Not Recording"}</p>
		</div>
	);
};