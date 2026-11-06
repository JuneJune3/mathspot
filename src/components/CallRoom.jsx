import React, { useState, useEffect, useRef } from 'react';

export function CallRoom({ roomId = "MathSpot-Room-1", onLeave }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState([
    { id: 'local', name: 'You (Host)', isMuted: false },
  ]);

  const localAudioRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const timerRef = useRef(null);

  // WebRTC STUN Server configuration for peer discovery
  const rtcConfig = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    startLocalAudio();

    return () => {
      cleanupCall();
    };
  }, []);

  const startLocalAudio = async () => {
    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      // 2. Initialize WebRTC PeerConnection
      const pc = new RTCPeerConnection(rtcConfig);
      peerConnectionRef.current = pc;

      // Add audio tracks to connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle incoming remote audio stream
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        setParticipants((prev) => [
          ...prev.filter((p) => p.id !== 'remote-peer'),
          { id: 'remote-peer', name: 'Peer Connected', isMuted: false }
        ]);

        const remoteAudio = new Audio();
        remoteAudio.srcObject = remoteStream;
        remoteAudio.play();
      };

      setIsConnected(true);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to access microphone:', err);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        setParticipants((prev) =>
          prev.map((p) => (p.id === 'local' ? { ...p, isMuted: !audioTrack.enabled } : p))
        );
      }
    }
  };

  const cleanupCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setIsConnected(false);
  };

  const handleHangUp = () => {
    cleanupCall();
    if (onLeave) onLeave();
  };

  const formatDuration = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-6 rounded-2xl bg-[#090A0F]/90 border border-[#E5E5E5]/30 backdrop-blur-md text-white shadow-2xl space-y-6">
      {/* Hidden local audio element */}
      <audio ref={localAudioRef} autoPlay muted />

      {/* Room Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-md font-semibold text-[#E5E5E5]">Audio Call Room</h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Room ID: {roomId}</p>
        </div>
        <div className="text-xs font-mono bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-gray-300">
          ⏱ {formatDuration(callDuration)}
        </div>
      </div>

      {/* Participant List Grid */}
      <div className="grid grid-cols-2 gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between p-4 rounded-xl bg-black/50 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E5E5E5]/20 border border-[#E5E5E5] flex items-center justify-center font-bold text-[#E5E5E5]">
                {participant.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-medium text-white">{participant.name}</p>
                <p className="text-[10px] text-gray-400">
                  {participant.isMuted ? 'Muted' : 'Speaking'}
                </p>
              </div>
            </div>
            <span className="text-xs">{participant.isMuted ? '🔇' : '🎙️'}</span>
          </div>
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 pt-2 border-t border-white/10">
        <button
          onClick={toggleMute}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
            isMuted
              ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
              : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
          }`}
        >
          {isMuted ? 'Unmute Mic' : 'Mute Mic'}
        </button>

        <button
          onClick={handleHangUp}
          className="px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
}