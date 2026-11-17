import { useState, useEffect, useRef } from "react";

const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export function CallModal({ isOpen, onClose, roomId = "MathSpot-Room-1" }) {
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([
    { id: "local", name: "You (Host)", isMuted: false },
  ]);
  const [audioError, setAudioError] = useState("");

  const localAudioRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsMuted(false);
      setCallDuration(0);
      setParticipants([{ id: "local", name: "You (Host)", isMuted: false }]);
      setAudioError("");
      return;
    }

    let cancelled = false;
    const cleanupResources = () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.close();
      }
      peerConnectionRef.current = null;
      if (localAudioRef.current) localAudioRef.current.srcObject = null;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.pause();
        remoteAudioRef.current.srcObject = null;
        remoteAudioRef.current = null;
      }
    };

    const startLocalAudio = async () => {
      setAudioError("");
      if (
        typeof navigator === "undefined" ||
        typeof navigator.mediaDevices?.getUserMedia !== "function"
      ) {
        setAudioError("Microphone access is not supported by this browser.");
        console.error("Microphone access is not supported by this browser.");
        return;
      }
      if (typeof RTCPeerConnection === "undefined") {
        setAudioError("Audio calls are not supported by this browser.");
        console.error("WebRTC is not supported by this browser.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        localStreamRef.current = stream;

        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(rtcConfig);
        peerConnectionRef.current = pc;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          if (cancelled) return;
          const remoteStream = event.streams[0];
          if (!remoteStream) return;
          setParticipants((prev) => [
            ...prev.filter((p) => p.id !== "remote-peer"),
            { id: "remote-peer", name: "Peer Connected", isMuted: false },
          ]);

          if (remoteAudioRef.current) {
            remoteAudioRef.current.pause();
            remoteAudioRef.current.srcObject = null;
          }
          const remoteAudio = new Audio();
          remoteAudio.srcObject = remoteStream;
          remoteAudioRef.current = remoteAudio;
          remoteAudio
            .play()
            .then(() => {
              if (cancelled) {
                remoteAudio.pause();
                remoteAudio.srcObject = null;
              }
            })
            .catch((err) => {
              if (!cancelled) console.error("Remote audio playback failed:", err);
            });
        };

        timerRef.current = setInterval(() => {
          if (!cancelled) setCallDuration((prev) => prev + 1);
        }, 1000);
      } catch (err) {
        if (!cancelled) {
          console.error("Microphone access failed:", err);
          setAudioError(
            "Could not access the microphone. Check browser permissions and try again.",
          );
          cleanupResources();
        }
      }
    };

    void startLocalAudio();
    return () => {
      cancelled = true;
      cleanupResources();
    };
  }, [isOpen]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setParticipants((prev) =>
          prev.map((p) => (p.id === "local" ? { ...p, isMuted: !audioTrack.enabled } : p)),
        );
      }
    }
  };

  if (!isOpen) return null;

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <audio ref={localAudioRef} autoPlay muted />

      <div className="w-full max-w-lg rounded-2xl bg-[#090A0F] border border-[#E5E5E5]/30 p-6 shadow-2xl space-y-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-semibold text-[#E5E5E5]">Audio Call Room</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{roomId}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono bg-black/60 px-3 py-1 rounded-lg border border-white/10 text-gray-300">
              ⏱ {formatDuration(callDuration)}
            </span>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Participants */}
        {audioError && (
          <p className="text-xs text-red-400" role="status">
            {audioError}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/5"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5E5E5]/20 border border-[#E5E5E5] flex items-center justify-center text-xs font-bold text-[#E5E5E5]">
                  {p.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{p.name}</p>
                  <p className="text-[10px] text-gray-400">{p.isMuted ? "Muted" : "Speaking"}</p>
                </div>
              </div>
              <span className="text-xs">{p.isMuted ? "🔇" : "🎙️"}</span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 pt-2 border-t border-white/10">
          <button
            onClick={toggleMute}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isMuted
                ? "bg-red-500/20 border-red-500 text-red-400"
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            }`}
          >
            {isMuted ? "Unmute Mic" : "Mute Mic"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
          >
            Leave Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallModal;
