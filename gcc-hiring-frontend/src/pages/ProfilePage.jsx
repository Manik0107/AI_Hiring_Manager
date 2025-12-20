import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Chatbot from "../components/Chatbot";

function ProfilePage() {
  const navigate = useNavigate();
  const stored = JSON.parse(localStorage.getItem("candidate")) || {};

  // Check if user is authenticated
  useEffect(() => {
    if (!stored.isAuthenticated) {
      navigate("/login");
    }
  }, []);

  const name = stored.name || "Candidate Name";
  const email = stored.email || "email@example.com";
  const role = stored.role || "Selected Role";

  const handleLogout = () => {
    localStorage.removeItem("candidate");
    navigate("/login");
  };

  // Track completion status for each step
  const [stepStatus, setStepStatus] = useState({
    aptitude: stored.aptitudeCompleted ? "completed" : "pending",
    dsa: stored.dsaCompleted ? "completed" : "pending",
    interview: stored.interviewCompleted ? "completed" : "pending",
  });

  const [otpValue, setOtpValue] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [candidateData, setCandidateData] = useState(stored);

  // Sync with backend on mount
  useEffect(() => {
    const fetchStatus = async () => {
      if (stored.email) {
        try {
          const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
          const response = await fetch(`${baseUrl}/candidates/status/${stored.email}`);
          if (response.ok) {
            const data = await response.json();
            setCandidateData(data);

            // Update local storage and step status
            const updated = { ...stored, ...data };
            localStorage.setItem("candidate", JSON.stringify(updated));

            setStepStatus({
              aptitude: data.rounds["Aptitude Round"]?.status === "Passed" ? "completed" :
                data.rounds["Aptitude Round"]?.status === "Verified" ? "ready" : "pending",
              dsa: data.rounds["DSA Round"]?.status === "Passed" ? "completed" :
                data.rounds["DSA Round"]?.status === "Verified" ? "ready" : "pending",
              interview: data.rounds["HR Interview"]?.status === "Passed" ? "completed" :
                data.rounds["HR Interview"]?.status === "Verified" ? "ready" : "pending",
            });
          }
        } catch (error) {
          console.error("Error fetching status:", error);
        }
      }
    };
    fetchStatus();
  }, []);

  const handleVerifyOtp = async (roundName) => {
    if (!otpValue) return;
    setVerifying(true);
    try {
      const formData = new FormData();
      formData.append("email", stored.email);
      formData.append("otp", otpValue);

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/candidates/verify-otp`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        alert("OTP Verified! You can now proceed to the round.");
        setOtpValue("");
        // Refresh status
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.detail || "Invalid OTP");
      }
    } catch (error) {
      alert("Error verifying OTP");
    } finally {
      setVerifying(false);
    }
  };

  const journeySteps = [
    {
      id: "aptitude",
      stepNumber: "1",
      icon: "📝",
      title: "Aptitude Round",
      description: "Test your logical reasoning and analytical skills",
      action: "Start Aptitude Test",
      route: "/quiz",
      status: stepStatus.aptitude,
      backendName: "Aptitude Round"
    },
    {
      id: "dsa",
      stepNumber: "2",
      icon: "💻",
      title: "DSA Round",
      description: "Demonstrate your data structures and algorithms expertise",
      action: "Start DSA Round",
      route: "/quiz",
      status: stepStatus.dsa,
      backendName: "DSA Round"
    },
    {
      id: "interview",
      stepNumber: "3",
      icon: "🎤",
      title: "HR Interview",
      description: "Complete speech-to-speech interview with our AI recruiter",
      action: "Start Interview",
      route: "/interview",
      status: stepStatus.interview,
      backendName: "HR Interview"
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4caf50";
      case "ready":
        return "#00aaf3ff";
      case "in-progress":
        return "#ff9800";
      default:
        return "rgba(255, 255, 255, 0.5)";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "✓ Completed";
      case "ready":
        return "🔓 Ready to Start";
      case "in-progress":
        return "⏳ In Progress";
      case "pending":
        return "🔒 Waiting for OTP Review";
      default:
        return "○ Pending";
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        {/* Header Section */}
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div></div>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              Logout
            </button>
          </div>
          <div style={styles.avatar}>👤</div>
          <h2>{name}</h2>
          <p style={styles.email}>{email}</p>
          {stored.profileCompleted && (
            <div style={styles.profileInfo}>
              <p><strong>Role:</strong> {role}</p>
              <p><strong>Age:</strong> {stored.age || "N/A"} | <strong>Gender:</strong> {stored.gender || "N/A"}</p>
            </div>
          )}
          {stored.profileCompleted && (
            <button
              style={styles.editProfileBtn}
              onClick={() => navigate("/apply")}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Check if profile is completed */}
        {!stored.profileCompleted ? (
          <div style={styles.incompleteSection}>
            {/* Background Decorative Elements */}
            <div style={styles.bgBlob1}></div>
            <div style={styles.bgBlob2}></div>

            <div style={styles.warningCard}>
              <div style={styles.appBadge}>CANDIDATE APPLICATION</div>
              <h3 style={styles.warningTitle}>Complete Your Profile</h3>
              <p style={styles.warningText}>
                Please complete your candidate information before accessing the interview rounds.
              </p>
              <button
                style={styles.completeBtn}
                onClick={() => navigate("/apply")}
              >
                Complete Information
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Interview Process - Main Content */}
            <div style={styles.section}>
              <h3 style={styles.mainSectionTitle}>Interview Process</h3>
              <p style={styles.journeySubtext}>
                Complete all three rounds to finalize your application
              </p>

              <div style={styles.stepsGrid}>
                {journeySteps.map((step, index) => {
                  const isPending = candidateData.rounds?.[step.backendName]?.status === "Pending";
                  const isLocked = candidateData.rounds?.[step.backendName]?.status === "Locked";

                  return (
                    <div
                      key={step.id}
                      style={{
                        ...styles.stepCard,
                        opacity: step.status === "completed" || isLocked ? 0.7 : 1,
                        cursor: isLocked ? "not-allowed" : "pointer"
                      }}
                    >
                      {/* Step Number Badge */}
                      <div style={styles.stepBadge}>Step {step.stepNumber}</div>

                      {/* Icon */}
                      <div style={styles.stepIcon}>{step.icon}</div>

                      {/* Title */}
                      <h4 style={styles.stepTitle}>{step.title}</h4>

                      {/* Description */}
                      <p style={styles.stepDescription}>{step.description}</p>

                      {/* Status */}
                      <div
                        style={{
                          ...styles.stepStatus,
                          color: getStatusColor(step.status),
                        }}
                      >
                        {getStatusText(step.status)}
                      </div>

                      {/* OTP Input if Pending */}
                      {isPending && (
                        <div style={styles.otpContainer}>
                          <input
                            style={styles.otpInput}
                            placeholder="Enter Round OTP"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                          />
                          <button
                            style={styles.verifyBtn}
                            onClick={() => handleVerifyOtp(step.backendName)}
                            disabled={verifying}
                          >
                            {verifying ? "..." : "Verify"}
                          </button>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        style={{
                          ...styles.stepButton,
                          background: step.status === "ready" ? "#4caf50" : "#00aaf3ff",
                          opacity: step.status === "completed" || isPending || isLocked ? 0.6 : 1,
                          cursor:
                            step.status === "completed" || isPending || isLocked ? "not-allowed" : "pointer",
                        }}
                        onClick={() =>
                          step.status === "ready" && navigate(step.route)
                        }
                        disabled={step.status !== "ready"}
                      >
                        {step.status === "completed" ? "Completed ✓" :
                          isLocked ? "Locked" :
                            isPending ? "Verification Required" : step.action}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Indicator */}
            <div style={styles.progressSection}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${(Object.values(stepStatus).filter((s) => s === "completed")
                      .length /
                      3) *
                      100
                      }%`,
                  }}
                />
              </div>
              <p style={styles.progressText}>
                {Object.values(stepStatus).filter((s) => s === "completed").length}{" "}
                of 3 steps completed
              </p>
            </div>
          </>
        )}
      </div>
      <Chatbot />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b1c2d 0%, #1a2f42 100%)",
    display: "flex",
    justifyContent: "center",
    padding: "60px 20px",
  },
  panel: {
    width: "100%",
    maxWidth: "1200px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    borderRadius: "18px",
    padding: "50px",
    color: "white",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  logoutBtn: {
    background: "rgba(255, 59, 48, 0.8)",
    color: "white",
    border: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  avatar: {
    fontSize: "64px",
    marginBottom: "10px",
  },
  email: {
    opacity: 0.85,
    fontSize: "14px",
  },
  tabs: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    paddingBottom: "10px",
    marginBottom: "40px",
    fontSize: "14px",
  },
  activeTab: {
    color: "#00aaf3ff",
    borderBottom: "2px solid #00aaf3ff",
    paddingBottom: "6px",
    fontWeight: "600",
  },
  section: {
    marginTop: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "15px",
    fontWeight: "600",
  },
  mainSectionTitle: {
    fontSize: "28px",
    marginBottom: "15px",
    fontWeight: "700",
    textAlign: "center",
  },
  profileInfo: {
    marginTop: "15px",
    padding: "15px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "10px",
    fontSize: "14px",
    lineHeight: "1.8",
  },
  editProfileBtn: {
    marginTop: "15px",
    background: "rgba(0, 170, 243, 0.2)",
    color: "#00aaf3ff",
    border: "1px solid #00aaf3ff",
    padding: "8px 20px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  incompleteSection: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  bgBlob1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    top: "-100px",
    left: "-100px",
    background: "rgba(0, 170, 243, 0.15)",
    filter: "blur(80px)",
    borderRadius: "50%",
    zIndex: 0,
  },
  bgBlob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    bottom: "-150px",
    right: "-100px",
    background: "rgba(76, 175, 80, 0.1)",
    filter: "blur(100px)",
    borderRadius: "50%",
    zIndex: 0,
  },
  warningCard: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "50px 40px",
    textAlign: "center",
    maxWidth: "500px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  appBadge: {
    display: "inline-block",
    background: "rgba(0, 170, 243, 0.1)",
    color: "#00aaf3ff",
    padding: "8px 20px",
    borderRadius: "30px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "25px",
    border: "1px solid rgba(0, 170, 243, 0.3)",
  },
  warningTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "15px",
    color: "white",
  },
  warningText: {
    fontSize: "16px",
    opacity: 0.7,
    lineHeight: "1.6",
    marginBottom: "35px",
  },
  completeBtn: {
    background: "#00aaf3ff",
    color: "#0b1c2d",
    border: "none",
    padding: "14px 32px",
    borderRadius: "25px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  journeySubtext: {
    fontSize: "14px",
    opacity: 0.75,
    marginBottom: "30px",
  },
  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  status: {
    fontSize: "14px",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "20px",
  },
  stepCard: {
    position: "relative",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.12)",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    cursor: "pointer",
  },
  stepBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "rgba(0, 170, 243, 0.2)",
    color: "#00aaf3ff",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  stepIcon: {
    fontSize: "48px",
    marginBottom: "15px",
  },
  stepTitle: {
    fontSize: "18px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  stepDescription: {
    fontSize: "13px",
    opacity: 0.8,
    marginBottom: "15px",
    lineHeight: "1.5",
  },
  stepStatus: {
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "20px",
    textTransform: "uppercase",
  },
  stepButton: {
    width: "100%",
    background: "#00aaf3ff",
    color: "#0b1c2d",
    padding: "12px 24px",
    border: "none",
    borderRadius: "25px",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s",
  },
  progressSection: {
    marginTop: "50px",
    textAlign: "center",
  },
  progressBar: {
    width: "100%",
    height: "8px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "4px",
    overflow: "hidden",
    marginBottom: "10px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #00aaf3ff 0%, #4caf50 100%)",
    borderRadius: "4px",
    transition: "width 0.5s ease",
  },
  progressText: {
    fontSize: "13px",
    opacity: 0.75,
  },
  otpContainer: {
    display: "flex",
    gap: "10px",
    width: "100%",
    marginBottom: "20px",
  },
  otpInput: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.2)",
    color: "white",
    fontSize: "14px",
    textAlign: "center",
  },
  verifyBtn: {
    padding: "10px 15px",
    borderRadius: "10px",
    background: "#4caf50",
    color: "white",
    border: "none",
    fontWeight: "600",
    cursor: "pointer",
  }
};

export default ProfilePage;
