import { useState, useEffect } from "react";
import Chatbot from "../components/Chatbot";
import { useLocation, useNavigate } from "react-router-dom";


function ApplyPage() {
  const [experience, setExperience] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { name, email: initialEmail } = location.state || {};
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  // Form state for all fields
  const [formData, setFormData] = useState({
    email: initialEmail || "",
    contactNumber: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    linkedin: "",
    github: "",
    yearsOfExperience: "",
    currentRole: "",
    resume: null,
  });

  // Check if user is authenticated
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("candidate")) || {};
    if (!stored.isAuthenticated) {
      navigate("/login");
    }
  }, []);


  return (
    <>
      <div style={styles.page}>
        <div style={styles.panel}>
          <h1 style={styles.heading}>Candidate Application</h1>
          <p style={styles.subtext}>
            Please complete the application below. All fields are required
            unless stated otherwise.
          </p>

          {/* PERSONAL INFORMATION */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Personal Information</h2>

            <div style={styles.field}>
              <label>Full Name</label>
              <input
                style={styles.input}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label>Contact Number</label>
              <input
                type="tel"
                style={styles.input}
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label>Date of Birth</label>
              <input
                type="date"
                style={styles.input}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                required
              />
            </div>

            <div style={styles.field}>
              <label>Age</label>
              <input
                type="number"
                style={styles.input}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="Enter your age"
                min="18"
                max="100"
                required
              />
            </div>

            <div style={styles.field}>
              <label>Gender</label>
              <div style={styles.radioColumn}>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  /> Male
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  /> Female
                </label>
                <label>
                  <input
                    type="radio"
                    name="gender"
                    value="Prefer not to say"
                    checked={formData.gender === "Prefer not to say"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  /> Prefer not to say
                </label>
              </div>
            </div>
          </section>
          <div style={styles.field}>
            <label>LinkedIn Profile URL (Optional)</label>
            <input
              style={styles.input}
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://www.linkedin.com/in/username"
            />
          </div>

          <div style={styles.field}>
            <label>GitHub Profile URL (Optional)</label>
            <input
              style={styles.input}
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
            />
          </div>


          {/* EXPERIENCE */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Professional Experience</h2>

            <div style={styles.field}>
              <label>Do you have prior work experience?</label>
              <div style={styles.radioRow}>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="yes"
                    onChange={(e) => setExperience(e.target.value)}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="experience"
                    value="no"
                    onChange={(e) => setExperience(e.target.value)}
                  />{" "}
                  No
                </label>
              </div>
            </div>

            {experience === "yes" && (
              <>
                <div style={styles.field}>
                  <label>Total Years of Experience</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />
                </div>

                <div style={styles.field}>
                  <label>Current / Most Recent Role</label>
                  <input
                    style={styles.input}
                    value={formData.currentRole}
                    onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                  />
                </div>
              </>
            )}
          </section>

          {/* JOB PREFERENCE */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Preferred Job Role</h2>

            <div style={styles.radioColumn}>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Data Science"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Data Science
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Data Analytics"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Data Analytics
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Digital Innovation"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Digital Innovation
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Web Applications"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Web Applications
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Platform Engineering"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Platform Engineering
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Automation"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Automation
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="Software Development"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                Software Development
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="AI & Machine Learning"
                  onChange={(e) => setSelectedRole(e.target.value)}
                />{" "}
                AI & Machine Learning
              </label>
            </div>
          </section>

          {/* RESUME */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Resume Upload</h2>

            <div style={styles.field}>
              <label>Upload Resume (PDF / DOC)</label>
              <input
                type="file"
                style={styles.input}
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFormData({ ...formData, resume: e.target.files[0] })}
                required
              />
            </div>
          </section>

          <button
            style={styles.submitBtn}
            onClick={() => {
              const handleSubmit = async () => {
                // Validate required fields
                if (!formData.fullName || !formData.email || !formData.contactNumber ||
                  !formData.dateOfBirth || !formData.age || !formData.gender ||
                  !selectedRole || !formData.resume) {
                  alert("Please fill all required fields before submitting.");
                  return;
                }

                setLoading(true);

                try {
                  const submitData = new FormData();
                  submitData.append("fullName", formData.fullName);
                  submitData.append("email", formData.email);
                  submitData.append("role", selectedRole);
                  submitData.append("resume", formData.resume);

                  const response = await fetch("http://localhost:8000/candidates/apply", {
                    method: "POST",
                    body: submitData,
                  });

                  const result = await response.json();

                  if (result.status === "success") {
                    const stored = JSON.parse(localStorage.getItem("candidate")) || {};
                    localStorage.setItem(
                      "candidate",
                      JSON.stringify({
                        ...stored,
                        ...formData,
                        role: selectedRole,
                        profileCompleted: true,
                        resumeName: formData.resume?.name || "resume.pdf",
                        shortlisted: true,
                        nextRound: "Aptitude Round",
                        roundStatus: "pending_otp"
                      })
                    );
                    alert("Application submitted! Your resume matched the requirements. Please check your console (simulated email) for the OTP.");
                    navigate("/profile");
                  } else {
                    alert(result.message || "Your resume does not match the requirements for this role.");
                  }
                } catch (error) {
                  console.error("Submission error:", error);
                  alert("Error submitting application. Make sure the backend is running.");
                } finally {
                  setLoading(false);
                }
              };

              handleSubmit();
            }}
            disabled={loading}
          >
            {loading ? "Processing Application..." : "Submit Application"}
          </button>



        </div>
      </div >

      <Chatbot />
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('\apply-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    padding: "80px 20px",
    display: "flex",
    justifyContent: "center",
    position: "relative",
  },

  panel: {
    width: "100%",
    maxWidth: "800px",
    padding: "60px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(18px)",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.18)",
    color: "white",
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "32px",
    marginBottom: "10px",
  },
  subtext: {
    fontSize: "15px",
    opacity: 0.85,
    marginBottom: "50px",
  },
  section: {
    marginBottom: "50px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    marginBottom: "25px",
  },
  field: {
    marginBottom: "28px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontSize: "14px",
  },
  input: {
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.09)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    fontSize: "14px",
  },
  radioRow: {
    display: "flex",
    gap: "30px",
  },
  radioColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  submitBtn: {
    marginTop: "40px",
    padding: "18px",
    width: "100%",
    background: "#0e5395ff",
    color: "#c0c7ceff",
    fontSize: "17px",
    fontWeight: "600",
    border: "none",
    borderRadius: "40px",
    cursor: "pointer",
  },
};

export default ApplyPage;
