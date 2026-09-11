import { useEffect, useRef, useState } from "react";

// The Web Speech API's SpeechRecognition interface does not work on iOS
// (Safari or Chrome, since both use WebKit there) despite some docs
// claiming otherwise — Apple exposes the API surface but it's
// non-functional on iPhone/iPad. On iOS, people should use the keyboard's
// own built-in dictation mic instead, which works in any text field with
// zero code from us. This component only renders where the API actually
// works: desktop Chrome/Edge/Safari and Android Chrome.
function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const s = {
  button: (listening) => ({
    flexShrink: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    border: "1px solid " + (listening ? "#e05b5b" : "#2a2a2a"),
    background: listening ? "#2a1010" : "transparent",
    color: listening ? "#e05b5b" : "#aaa",
    cursor: "pointer",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }),
};

export default function VoiceInputButton({ onResult }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    setSupported(!!SpeechRecognition);
  }, []);

  const handleClick = () => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  if (!supported) return null; // silently absent on iOS — keyboard dictation covers it there

  return (
    <button type="button" style={s.button(listening)} onClick={handleClick} title="Voice input">
      {listening ? "●" : "🎤"}
    </button>
  );
}
