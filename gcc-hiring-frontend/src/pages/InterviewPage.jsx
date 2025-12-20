import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function InterviewPage() {
    const navigate = useNavigate();
    const [websocket, setWebsocket] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [interviewComplete, setInterviewComplete] = useState(false);
    const [waitingForSummary, setWaitingForSummary] = useState(false);
    const [showOffer, setShowOffer] = useState(false);

    const [statusIcon, setStatusIcon] = useState("🎤");
    const [statusText, setStatusText] = useState("Ready to Start");
    const [stageText, setStageText] = useState('Click "Start Interview" to begin');
    const [statusColor, setStatusColor] = useState(null);

    const [transcripts, setTranscripts] = useState([]);
    const [buttonsEnabled, setButtonsEnabled] = useState({
        start: true,
        speak: false,
        end: false,
    });

    const [scores, setScores] = useState(null);

    const updateStatus = (icon, text, stage, color = null) => {
        setStatusIcon(icon);
        setStatusText(text);
        setStageText(stage);
        setStatusColor(color);
    };

    const addTranscript = (role, text) => {
        setTranscripts((prev) => [...prev, { role, text }]);
    };

    const startInterview = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
            const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";
            const wsUrl = `${wsBaseUrl}/interview/ws`;
            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connected");

                ws.send(
                    JSON.stringify({
                        type: "init",
                        session_id: "session_" + Date.now(),
                        job_role: localStorage.getItem("candidate")
                            ? JSON.parse(localStorage.getItem("candidate")).role || "Software Engineer"
                            : "Software Engineer",
                    })
                );

                updateStatus("🔄", "Connecting...", "Initializing interview");
                setButtonsEnabled({ start: false, speak: false, end: true });
            };

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                console.log("Received:", data.type);

                if (data.type === "candidate_transcript") {
                    addTranscript("candidate", data.transcript);
                } else if (data.type === "interviewer_response") {
                    addTranscript("interviewer", data.text);

                    if (data.audio) {
                        updateStatus("🔊", "AI Speaking...", `Stage: ${data.stage}`);
                        await playAudio(data.audio);
                        updateStatus("👂", "Your Turn", 'Click "Answer" button to respond');
                        setButtonsEnabled((prev) => ({ ...prev, speak: true }));
                    }
                } else if (data.type === "status") {
                    updateStatus("⏳", data.message, "Processing...");
                    setButtonsEnabled((prev) => ({ ...prev, speak: false }));
                } else if (data.type === "interview_complete") {
                    setInterviewComplete(true);
                    updateStatus(
                        "✅",
                        "Interview Complete!",
                        "Thank you for your time",
                        "#4caf50"
                    );
                    setButtonsEnabled({ start: false, speak: false, end: false });
                    setScores(data.summary.scores);

                    // Notify backend to advance to next round
                    const stored = JSON.parse(localStorage.getItem("candidate")) || {};
                    if (stored.email) {
                        const formData = new FormData();
                        formData.append("email", stored.email);
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
                        fetch(`${baseUrl}/candidates/complete-round`, {
                            method: "POST",
                            body: formData
                        }).then(() => {
                            console.log("Candidate advanced in backend");
                        }).catch(err => console.error("Error advancing candidate:", err));
                    }
                } else if (data.type === "error") {
                    updateStatus("❌", "Error", data.message, "#f44336");
                    console.error("Error:", data.message);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                updateStatus(
                    "❌",
                    "Connection Error",
                    "Please check if server is running",
                    "#f44336"
                );
            };

            ws.onclose = () => {
                console.log("WebSocket closed");
                // Only show disconnected if interview wasn't completed successfully
                if (!interviewComplete) {
                    if (waitingForSummary) {
                        updateStatus("⏳", "Finalizing...", "Generating your interview summary");
                    } else {
                        updateStatus("🔴", "Disconnected", "Connection closed");
                        setButtonsEnabled({ start: true, speak: false, end: false });
                    }
                }
            };

            setWebsocket(ws);
        } catch (error) {
            console.error("Error starting interview:", error);
            alert("Error: " + error.message);
        }
    };

    const startRecording = async () => {
        if (isRecording) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: "audio/webm" });

                if (websocket && websocket.readyState === WebSocket.OPEN) {
                    audioBlob.arrayBuffer().then((buffer) => {
                        websocket.send(buffer);
                    });
                }

                stream.getTracks().forEach((track) => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setAudioChunks(chunks);
            setIsRecording(true);
            updateStatus("🎤", "Recording...", "Speak now!", "#f44336");
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access denied. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        if (!isRecording || !mediaRecorder) return;

        mediaRecorder.stop();
        setIsRecording(false);
        setButtonsEnabled((prev) => ({ ...prev, speak: false }));
        updateStatus("⏳", "Processing...", "Transcribing your response...");
    };

    const playAudio = (base64Audio) => {
        return new Promise((resolve) => {
            const audio = new Audio("data:audio/mp3;base64," + base64Audio);
            setCurrentAudio(audio);

            audio.onended = () => {
                resolve();
            };

            audio.onerror = (error) => {
                console.error("Audio playback error:", error);
                resolve();
            };

            audio.play().catch((error) => {
                console.error("Play error:", error);
                resolve();
            });
        });
    };

    const endInterview = () => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.send(JSON.stringify({ type: "end_interview" }));
            setWaitingForSummary(true);
            updateStatus("⏳", "Concluding...", "Waiting for final evaluation");
        }
    };

    // Cleanup ONLY on component unmount (not on every re-render)
    useEffect(() => {
        return () => {
            // This cleanup only runs when component is unmounted
            if (websocket) {
                console.log("Component unmounting, closing WebSocket");
                websocket.close();
            }
            if (currentAudio) {
                currentAudio.pause();
            }
        };
    }, []); // Empty dependency array = only run on mount/unmount

    return (
        <div style={styles.page}>
            <div style={styles.overlay}></div>

            <div style={styles.container}>
                {!interviewComplete ? (
                    <>
                        <div style={styles.header}>
                            <button
                                onClick={() => navigate("/profile")}
                                style={styles.backButton}
                            >
                                ← Back to Profile
                            </button>
                            <h1 style={styles.title}>🎯 AI HR Interview</h1>
                            <p style={styles.subtitle}>Speech-to-Speech Interview System</p>
                        </div>

                        <div
                            style={{
                                ...styles.statusCard,
                                background: statusColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                        >
                            <span style={styles.statusIcon}>{statusIcon}</span>
                            <div style={styles.statusText}>{statusText}</div>
                            <div style={styles.stageText}>{stageText}</div>
                        </div>

                        <div style={styles.infoBox}>
                            <strong>How it works:</strong>
                            <br />
                            1. Click "Start Interview" to connect
                            <br />
                            2. The AI will introduce itself and ask questions
                            <br />
                            3. Click and hold "Click to Answer" button to respond
                            <br />
                            4. Release when done speaking
                            <br />
                            5. Get your final score at the end!
                        </div>

                        <div style={styles.transcriptBox}>
                            {transcripts.length === 0 ? (
                                <div style={{ textAlign: "center", color: "#999" }}>
                                    Conversation will appear here...
                                </div>
                            ) : (
                                transcripts.map((item, idx) => (
                                    <div
                                        key={idx}
                                        style={
                                            item.role === "interviewer"
                                                ? styles.transcriptItemInterviewer
                                                : styles.transcriptItemCandidate
                                        }
                                    >
                                        <div style={styles.transcriptLabel}>{item.role}</div>
                                        <div>{item.text}</div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div style={styles.controls}>
                            {buttonsEnabled.start && (
                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.btnStart,
                                    }}
                                    onClick={startInterview}
                                >
                                    Start Interview
                                </button>
                            )}
                            {!buttonsEnabled.start && (
                                <>
                                    <button
                                        style={{
                                            ...styles.button,
                                            ...styles.btnSpeak,
                                            opacity: buttonsEnabled.speak ? 1 : 0.5,
                                            cursor: buttonsEnabled.speak ? "pointer" : "not-allowed",
                                        }}
                                        disabled={!buttonsEnabled.speak}
                                        onMouseDown={startRecording}
                                        onMouseUp={stopRecording}
                                        onTouchStart={startRecording}
                                        onTouchEnd={stopRecording}
                                    >
                                        {isRecording ? (
                                            <>
                                                <span style={styles.recordingIndicator}></span>
                                                Recording...
                                            </>
                                        ) : (
                                            "Click to Answer"
                                        )}
                                    </button>
                                    <button
                                        style={{
                                            ...styles.button,
                                            ...styles.btnEnd,
                                            opacity: buttonsEnabled.end ? 1 : 0.5,
                                            cursor: buttonsEnabled.end ? "pointer" : "not-allowed",
                                        }}
                                        disabled={!buttonsEnabled.end}
                                        onClick={endInterview}
                                    >
                                        End Interview
                                    </button>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={styles.summaryContainer}>
                        <div style={styles.summaryIcon}>🏆</div>
                        <h2 style={styles.summaryTitle}>Interview Completed!</h2>
                        <p style={styles.summarySubtitle}>
                            Great job! Your performance has been evaluated by our AI recruiter.
                        </p>

                        {scores && (
                            <div style={styles.scoreList}>
                                <div style={styles.scoreCard}>
                                    <div style={styles.scoreValue}>{(scores?.total_score ?? 0).toFixed(0)}%</div>
                                    <div style={styles.scoreLabel}>Overall Score</div>
                                </div>
                                <div style={styles.scoreRow}>
                                    <div style={styles.scoreDetail}>
                                        <span>Technical Proficiency</span>
                                        <span>{(scores?.technical_avg ?? 0).toFixed(0)}%</span>
                                    </div>
                                    <div style={styles.scoreBar}><div style={{ ...styles.scoreFill, width: `${scores?.technical_avg ?? 0}%`, background: '#4caf50' }}></div></div>
                                </div>
                                <div style={styles.scoreRow}>
                                    <div style={styles.scoreDetail}>
                                        <span>Behavioral & Communication</span>
                                        <span>{(scores?.behavioral_avg ?? 0).toFixed(0)}%</span>
                                    </div>
                                    <div style={styles.scoreBar}><div style={{ ...styles.scoreFill, width: `${scores?.behavioral_avg ?? 0}%`, background: '#2196f3' }}></div></div>
                                </div>
                            </div>
                        )}

                        <div style={styles.conclusion}>
                            Your results have been submitted. You will be notified of the next steps via email.
                        </div>

                        <button
                            style={styles.finishButton}
                            onClick={() => navigate("/profile")}
                        >
                            Finish & Return to Profile
                        </button>

                        {(scores?.total_score ?? 0) >= 80 && !showOffer && (
                            <button
                                style={{ ...styles.finishButton, marginTop: "15px", background: "#4caf50", color: "white" }}
                                onClick={() => setShowOffer(true)}
                            >
                                📜 View Offer Letter
                            </button>
                        )}

                        {showOffer && (
                            <div style={styles.offerLetter}>
                                <div style={styles.letterHeader}>
                                    <h2 style={styles.companyName}>GLOBAL CAPABILITY CENTER</h2>
                                    <p style={styles.letterDate}>Date: December 20, 2024</p>
                                </div>

                                <div style={styles.letterContent}>
                                    <p>Dear <strong>{JSON.parse(localStorage.getItem("candidate"))?.name || "Candidate"}</strong>,</p>

                                    <p>We are pleased to offer you the position of <strong>{JSON.parse(localStorage.getItem("candidate"))?.role || "Software Engineer"}</strong> at Global Capability Center.</p>

                                    <p>Your performance during the interview process was exceptional, particularly in the HR and technical assessments. We are confident that your skills and experience will be a valuable asset to our team.</p>

                                    <div style={styles.offerDetails}>
                                        <p><strong>Joining Date:</strong> January 12, 2025</p>
                                        <p><strong>Location:</strong> Hybrid / Bengaluru Office</p>
                                        <p><strong>Reporting To:</strong> Engineering Manager</p>
                                    </div>

                                    <p>Please review the details of this offer. We look forward to having you join our innovative team.</p>

                                    <div style={styles.letterSignature}>
                                        <p>Sincerely,</p>
                                        <p><strong>HR Department</strong></p>
                                        <p>Global Capability Center</p>
                                    </div>
                                </div>

                                <button
                                    style={styles.printButton}
                                    onClick={() => window.print()}
                                >
                                    Download as PDF
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        backgroundImage: "url('/interview-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
    },
    overlay: {
        position: "absolute",
        inset: 0,
        background: "rgba(7, 26, 44, 0.92)",
        zIndex: 1,
    },
    container: {
        position: "relative",
        zIndex: 2,
        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(18px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        boxShadow: "0 30px 80px rgba(0, 0, 0, 0.5)",
        maxWidth: "700px",
        width: "100%",
        padding: "40px",
        color: "white",
    },
    header: {
        marginBottom: "30px",
    },
    backButton: {
        background: "transparent",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        marginBottom: "20px",
        transition: "all 0.3s",
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "8px",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    subtitle: {
        fontSize: "14px",
        opacity: 0.8,
    },
    statusCard: {
        color: "white",
        padding: "25px",
        borderRadius: "12px",
        marginBottom: "20px",
        textAlign: "center",
        transition: "all 0.3s",
    },
    statusIcon: {
        fontSize: "48px",
        marginBottom: "10px",
        display: "block",
    },
    statusText: {
        fontSize: "18px",
        fontWeight: "600",
    },
    stageText: {
        fontSize: "12px",
        opacity: 0.9,
        marginTop: "5px",
    },
    infoBox: {
        background: "rgba(33, 150, 243, 0.15)",
        borderLeft: "4px solid #2196f3",
        padding: "15px",
        borderRadius: "8px",
        margin: "20px 0",
        fontSize: "14px",
        lineHeight: 1.6,
    },
    transcriptBox: {
        background: "rgba(0, 0, 0, 0.3)",
        borderRadius: "12px",
        padding: "20px",
        margin: "20px 0",
        minHeight: "180px",
        maxHeight: "320px",
        overflowY: "auto",
    },
    transcriptItemInterviewer: {
        marginBottom: "15px",
        padding: "12px",
        borderRadius: "8px",
        background: "rgba(102, 126, 234, 0.2)",
        borderLeft: "4px solid #667eea",
    },
    transcriptItemCandidate: {
        marginBottom: "15px",
        padding: "12px",
        borderRadius: "8px",
        background: "rgba(236, 64, 122, 0.2)",
        borderLeft: "4px solid #ec407a",
    },
    transcriptLabel: {
        fontWeight: "600",
        fontSize: "11px",
        marginBottom: "5px",
        textTransform: "uppercase",
        opacity: 0.8,
    },
    controls: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "25px",
    },
    button: {
        flex: 1,
        padding: "15px 20px",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s",
        minWidth: "140px",
    },
    btnStart: {
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "white",
    },
    btnSpeak: {
        background: "#4caf50",
        color: "white",
    },
    btnEnd: {
        background: "#f44336",
        color: "white",
    },
    recordingIndicator: {
        width: "12px",
        height: "12px",
        background: "white",
        borderRadius: "50%",
        display: "inline-block",
        marginRight: "8px",
        animation: "pulse 1.5s infinite",
    },
    scoreDisplay: {
        background: "rgba(255, 249, 196, 0.15)",
        borderRadius: "12px",
        padding: "20px",
        marginTop: "20px",
        border: "1px solid rgba(255, 249, 196, 0.3)",
    },
    scoreItem: {
        display: "flex",
        justifyContent: "space-between",
        margin: "10px 0",
        fontWeight: "600",
    },
    summaryContainer: {
        textAlign: "center",
        padding: "20px 0",
        animation: "fadeIn 0.5s ease-out",
    },
    summaryIcon: {
        fontSize: "80px",
        marginBottom: "20px",
    },
    summaryTitle: {
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "10px",
        color: "white",
    },
    summarySubtitle: {
        fontSize: "15px",
        opacity: 0.8,
        marginBottom: "40px",
    },
    scoreList: {
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "16px",
        padding: "30px",
        marginBottom: "30px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    scoreCard: {
        textAlign: "center",
        marginBottom: "10px",
    },
    scoreValue: {
        fontSize: "48px",
        fontWeight: "800",
        color: "#00aaf3ff",
    },
    scoreLabel: {
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "1px",
        opacity: 0.6,
    },
    scoreRow: {
        width: "100%",
    },
    scoreDetail: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
        marginBottom: "8px",
        fontWeight: "500",
    },
    scoreBar: {
        width: "100%",
        height: "6px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "3px",
        overflow: "hidden",
    },
    scoreFill: {
        height: "100%",
        borderRadius: "3px",
        transition: "width 1s ease-out",
    },
    conclusion: {
        fontSize: "14px",
        lineHeight: "1.6",
        opacity: 0.7,
        marginBottom: "40px",
        maxWidth: "400px",
        margin: "0 auto 40px auto",
    },
    finishButton: {
        width: "100%",
        maxWidth: "300px",
        padding: "16px",
        background: "#00aaf3ff",
        color: "#0b1c2d",
        border: "none",
        borderRadius: "30px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.3s",
        boxShadow: "0 10px 20px rgba(0, 170, 243, 0.2)",
    },
    offerLetter: {
        marginTop: "40px",
        background: "white",
        color: "#333",
        padding: "50px",
        borderRadius: "12px",
        textAlign: "left",
        boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        border: "1px solid #ddd",
        fontFamily: "'Times New Roman', Times, serif",
        animation: "slideUp 0.6s ease-out",
        "@media print": {
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 9999,
            margin: 0,
        }
    },
    letterHeader: {
        borderBottom: "2px solid #00aaf3ff",
        marginBottom: "30px",
        paddingBottom: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
    },
    companyName: {
        color: "#0b1c2d",
        fontSize: "24px",
        margin: 0,
        fontWeight: "800",
    },
    letterDate: {
        fontSize: "14px",
        margin: 0,
        color: "#666",
    },
    letterContent: {
        fontSize: "16px",
        lineHeight: "1.8",
        color: "#444",
    },
    offerDetails: {
        background: "#f9f9f9",
        padding: "20px",
        borderRadius: "8px",
        margin: "25px 0",
        borderLeft: "5px solid #00aaf3ff",
    },
    letterSignature: {
        marginTop: "40px",
        borderTop: "1px solid #eee",
        paddingTop: "20px",
    },
    printButton: {
        marginTop: "30px",
        padding: "12px 24px",
        background: "#0b1c2d",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        display: "block",
        marginLeft: "auto",
    }
};

export default InterviewPage;
