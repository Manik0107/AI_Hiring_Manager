import { useState, useEffect, useRef, useCallback } from "react";
import { endpoints } from "@/lib/api";

type Message = {
    id: string;
    role: "ai" | "user";
    content: string;
    timestamp?: string;
};

type UseVoiceInterviewProps = {
    onComplete?: () => void;
    candidateName?: string;
    jobRole?: string;
};

export function useVoiceInterview({ onComplete, candidateName, jobRole }: UseVoiceInterviewProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Initialize AudioContext
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    const playAudio = async (base64Audio: string) => {
        if (!audioContextRef.current) return;

        try {
            setIsAiSpeaking(true);
            const audioData = atob(base64Audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }

            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

            // Stop previous audio if playing
            if (activeSourceRef.current) {
                activeSourceRef.current.stop();
            }

            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setIsAiSpeaking(false);

            activeSourceRef.current = source;
            source.start(0);
        } catch (error) {
            console.error("Error playing audio:", error);
            setIsAiSpeaking(false);
        }
    };

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const ws = new WebSocket(endpoints.interviewWs);

        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);

            // Get auth token
            const token = localStorage.getItem("token");

            // Send init message
            ws.send(JSON.stringify({
                type: "init",
                session_id: `session_${Date.now()}`,
                job_role: jobRole || "Software Engineer",
                candidate_name: candidateName || "Candidate",
                token: token // Include token for user identification
            }));
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "interviewer_response":
                    // Add AI message
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "ai",
                        content: data.text,
                        timestamp: new Date().toLocaleTimeString()
                    }]);

                    // Play audio
                    if (data.audio) {
                        await playAudio(data.audio);
                    }
                    break;

                case "candidate_transcript":
                    // Add User transcript
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "user",
                        content: data.transcript,
                        timestamp: new Date().toLocaleTimeString()
                    }]);
                    setIsProcessing(false);
                    break;

                case "status":
                    // Could show a toast or status indicator
                    break;

                case "interview_complete":
                    if (onComplete) onComplete();
                    break;
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        wsRef.current = ws;
    }, [jobRole, candidateName, onComplete]);

    const disconnect = useCallback(() => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                // Send to WebSocket
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    setIsProcessing(true);
                    wsRef.current.send(audioBlob);
                }

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnect();
            if (activeSourceRef.current) {
                try { activeSourceRef.current.stop(); } catch (e) { }
            }
            audioContextRef.current?.close();
        };
    }, [disconnect]);

    return {
        connect,
        disconnect,
        startRecording,
        stopRecording,
        messages,
        isConnected,
        isRecording,
        isProcessing,
        isAiSpeaking
    };
}
