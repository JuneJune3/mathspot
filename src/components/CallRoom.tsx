import React, { useEffect, useRef, useState } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff, Copy, Check } from 'lucide-react';

export default function CallRoom() {
  const [peerId, setPeerId] = useState<string>('');
  const [remotePeerId, setRemotePeerId] = useState<string>('');
  const [inCall, setInCall] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const peerInstance = useRef<Peer | null>(null);
  const currentCall = useRef<MediaConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // Initialize PeerJS with Google's free public STUN server
    const peer = new Peer({
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      },
    });

    peer.on('open', (id) => {
      setPeerId(id);
      setErrorMsg(null);
    });

    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setErrorMsg('Connection error occurred. Please refresh or try again.');
    });

    // Handle incoming call automatically
    peer.on('call', async (call) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        call.answer(stream);
        currentCall.current = call;
        setInCall(true);

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });

        call.on('close', () => {
          endCall();
        });
      } catch (err) {
        console.error('Failed to access camera/mic:', err);
        setErrorMsg('Camera or microphone access denied.');
      }
    });

    peerInstance.current = peer;

    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
      }
      peer.destroy();
    };
  }, []);

  const startCall = async () => {
    if (!remotePeerId.trim()) {
      setErrorMsg("Please enter a friend's Call ID.");
      return;
    }

    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const call = peerInstance.current?.call(remotePeerId.trim(), stream);
      if (call) {
        currentCall.current = call;
        setInCall(true);

        call.on('stream', (remoteStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
        });

        call.on('close', () => {
          endCall();
        });
      }
    } catch (err) {
      console.error('Failed to start call:', err);
      setErrorMsg('Could not start call. Please allow camera and mic permissions.');
    }
  };

  const endCall = () => {
    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setInCall(false);
  };

  const toggleMic = () => {
    if (localStream.current) {
      const audioTrack = localStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream.current) {
      const videoTrack = localStream.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const copyId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800">
      <h2 className="text-2xl font-bold mb-4 text-center tracking-wide">P2P Voice & Video Call</h2>

      {/* Error Banner */}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm text-center">
          {errorMsg}
        </div>
      )}

      {/* Your Peer ID Section */}
      <div className="mb-6 bg-slate-800/80 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-700/50">
        <div>
          <span className="text-xs text-slate-400 block uppercase font-semibold">Your Call ID</span>
          <span className="font-mono text-sm font-bold text-indigo-400 select-all">
            {peerId || 'Generating ID...'}
          </span>
        </div>
        <button
          onClick={copyId}
          disabled={!peerId}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm font-medium transition active:scale-95"
        >
          {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      {/* Join Call Input Bar */}
      {!inCall && (
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            placeholder="Enter Friend's Call ID"
            value={remotePeerId}
            onChange={(e) => setRemotePeerId(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            onClick={startCall}
            disabled={!peerId}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold rounded-xl text-sm transition active:scale-95"
          >
            <Phone size={16} /> Call
          </button>
        </div>
      )}

      {/* Video Streams Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Local Stream */}
        <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-3 bg-black/70 text-xs px-2.5 py-1 rounded-md font-medium backdrop-blur-sm">
            You {!cameraOn && '(Camera Off)'}
          </span>
        </div>

        {/* Remote Stream */}
        <div className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <span className="absolute bottom-3 left-3 bg-black/70 text-xs px-2.5 py-1 rounded-md font-medium backdrop-blur-sm">
            Peer
          </span>
        </div>
      </div>

      {/* Call Controls Bar */}
      {inCall && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition active:scale-95 ${
              micOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500'
            }`}
            title={micOn ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3.5 rounded-full transition active:scale-95 ${
              cameraOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-red-600 hover:bg-red-500'
            }`}
            title={cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={endCall}
            className="p-3.5 bg-red-600 hover:bg-red-500 rounded-full transition active:scale-95"
            title="End Call"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      )}
    </div>
  );
}