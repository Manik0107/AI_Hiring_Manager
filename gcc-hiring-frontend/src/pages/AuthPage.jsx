import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signupSuccess, setSignupSuccess] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("candidate")) || {};
    if (stored.isAuthenticated) {
      navigate("/profile");
    }
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleLogin = () => {
    // Reset error
    setError("");

    // Validate fields
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Recruiter credentials
    if (email === "careers@company.com" && password === "gcchack12") {
      localStorage.setItem(
        "recruiter",
        JSON.stringify({
          email,
          isAuthenticated: true,
          role: "recruiter",
        })
      );
      navigate("/recruiter");
      return;
    }

    // Candidate login - check if user exists
    const storedCandidate = JSON.parse(localStorage.getItem("candidate")) || {};

    if (storedCandidate.email === email && storedCandidate.password === password) {
      // Valid login
      localStorage.setItem(
        "candidate",
        JSON.stringify({
          ...storedCandidate,
          isAuthenticated: true,
          sessionStart: new Date().toISOString(),
        })
      );
      navigate("/profile");
    } else if (storedCandidate.email === email) {
      setError("Incorrect password");
    } else {
      setError("Account not found. Please sign up first.");
    }
  };




  const handleSignup = () => {
    // Reset error
    setError("");

    // Validate fields
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    // Check if user already exists
    const existingCandidate = JSON.parse(localStorage.getItem("candidate")) || {};
    if (existingCandidate.email === email) {
      setError("Account already exists. Please login.");
      return;
    }

    // Save signup data
    localStorage.setItem(
      "candidate",
      JSON.stringify({
        name,
        email,
        password, // In production, this should be hashed
        isAuthenticated: false,
      })
    );

    resetForm();
    setSignupSuccess(true);
    setIsLogin(true);
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      <div style={styles.panel}>
        <div style={styles.left}>
          <h1 style={styles.title}>Global Capability Centers</h1>
          <p style={styles.tagline}>
            Access enterprise-grade hiring opportunities across global teams
          </p>
        </div>

        <div style={styles.right}>
          <h2 style={styles.heading}>
            {isLogin ? "Candidate Login" : "Create Your Profile"}
          </h2>

          {signupSuccess && isLogin && (
            <p style={styles.success}>
              Account created successfully. Please login.
            </p>
          )}

          {error && (
            <p style={styles.error}>
              {error}
            </p>
          )}

          {!isLogin && (
            <input
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {isLogin ? (
            <button style={styles.button} onClick={handleLogin}>
              Login
            </button>
          ) : (
            <button style={styles.button} onClick={handleSignup}>
              Sign Up
            </button>
          )}

          <p style={styles.switchText}>
            {isLogin ? "New user?" : "Already registered?"}{" "}
            <span
              style={styles.switchLink}
              onClick={() => {
                resetForm();
                setSignupSuccess(false);
                setIsLogin(!isLogin);
              }}
            >
              {isLogin ? "Create an account" : "Login"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* STYLES (UNCHANGED FROM YOUR LAST VERSION) */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/login-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(11,28,45,0.75)",
  },
  panel: {
    position: "relative",
    zIndex: 1,
    width: "85%",
    maxWidth: "1100px",
    minHeight: "420px",
    display: "flex",
    borderRadius: "18px",
    overflow: "hidden",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  left: {
    flex: 1,
    padding: "50px",
    color: "white",
  },
  title: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "34px",
    marginBottom: "15px",
  },
  tagline: {
    fontSize: "16px",
    opacity: 0.85,
    maxWidth: "400px",
  },
  right: {
    flex: 1,
    padding: "50px",
    background: "rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heading: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "26px",
    marginBottom: "15px",
  },
  success: {
    color: "#f3b200ff",
    fontSize: "14px",
    marginBottom: "15px",
  },
  error: {
    color: "#ff3b30",
    fontSize: "14px",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "14px",
    borderRadius: "6px",
    border: "1px solid rgba(255,255,255,0.25)",
    background: "rgba(0,0,0,0.35)",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    marginTop: "10px",
    padding: "14px",
    background: "#00aaf3ff",
    color: "#0b1c2d",
    fontWeight: "600",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "16px",
  },
  switchText: {
    marginTop: "20px",
    fontSize: "14px",
    opacity: 0.9,
  },
  switchLink: {
    color: "#00aaf3ff",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AuthPage;
