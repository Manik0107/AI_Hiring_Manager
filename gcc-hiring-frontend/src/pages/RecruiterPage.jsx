import { useState } from "react";
import VideoBanner from "../components/VideoBanner";

function RecruiterPage() {
  // 🔹 Mock AI output (later comes from resume parser)
  const candidates = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@gmail.com",
      role: "Software Development",
      status: "Under Review",
      aiShortlisted: true, // AI selected
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@gmail.com",
      role: "Data Science",
      status: "Under Review",
      aiShortlisted: false,
    },
    {
      id: 3,
      name: "Alex Brown",
      email: "alex.brown@gmail.com",
      role: "Platform Engineering",
      status: "Under Review",
      aiShortlisted: true, // AI selected
    },
  ];

  const [showShortlisted, setShowShortlisted] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const shortlistedCandidates = candidates.filter(
    (c) => c.aiShortlisted
  );

  const handleSendEmail = () => {
    if (shortlistedCandidates.length === 0) return;
    setEmailSent(true);
  };

  return (
    <div>
      {/* Banner */}
      <VideoBanner />

      <div style={styles.container}>
        {/* ALL CANDIDATES */}
        <h2>ALL CANDIDATE APPLICATIONS</h2>

        <div style={styles.table}>
          <div style={styles.rowHeader}>
            <span>Name</span>
            <span>Role</span>
            <span>Status</span>
          </div>

          {candidates.map((c) => (
            <div key={c.id} style={styles.row}>
              <span>{c.name}</span>
              <span>{c.role}</span>
              <span>{c.status}</span>
            </div>
          ))}
        </div>

        {/* SHOW SHORTLISTED BUTTON */}
        <div style={{ marginTop: "30px" }}>
          <button
            style={styles.button}
            onClick={() => setShowShortlisted(true)}
          >
            Show Shortlisted Resumes
          </button>
        </div>

        {/* SHORTLISTED CANDIDATES */}
        {showShortlisted && (
          <>
            <h2 style={{ marginTop: "40px" }}>
              AI-SHORTLISTED CANDIDATES
            </h2>

            <div style={styles.table}>
              <div style={styles.rowHeader}>
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
              </div>

              {shortlistedCandidates.map((c) => (
                <div key={c.id} style={styles.row}>
                  <span>{c.name}</span>
                  <span>{c.email}</span>
                  <span>{c.role}</span>
                </div>
              ))}
            </div>

            {/* SEND EMAIL */}
            <div style={{ marginTop: "25px" }}>
              <button
                style={styles.button}
                onClick={handleSendEmail}
              >
                Send Assessment Email to Shortlisted Candidates
              </button>

              {emailSent && (
                <p style={styles.successText}>
                   Assessment emails sent to AI-shortlisted
                  candidates.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
  },
  table: {
    marginTop: "15px",
    border: "1px solid #00aaf3ff",
    borderRadius: "6px",
    overflow: "hidden",
  },
  rowHeader: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    background: "#00aaf396",
    padding: "12px",
    fontWeight: "600",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "12px",
    borderTop: "1px solid #00aaf3ff",
  },
  button: {
    padding: "10px 20px",
    background: "#00aaf396",
    border: "none",
    color: "white",
    borderRadius: "4px",
    cursor: "pointer",
  },
  successText: {
    marginTop: "15px",
    color: "white",
    fontWeight: "600",
  },
};

export default RecruiterPage;
