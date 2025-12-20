import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const QUESTION_BANK = {
  aptitude: [
    {
      question: "If a train travels 120 km in 2 hours, what is its speed in m/s?",
      options: ["16.67 m/s", "30 m/s", "60 m/s", "15 m/s"],
      correct: 0,
    },
    {
      question: "What is the next number in the series: 2, 6, 12, 20, 30, ...?",
      options: ["36", "40", "42", "44"],
      correct: 2,
    },
    {
      question: "A sum of money doubles itself in 5 years at simple interest. What is the rate of interest per annum?",
      options: ["10%", "20%", "25%", "15%"],
      correct: 1,
    },
    {
      question: "The average of five numbers is 20. If one number is removed, the average becomes 18. What is the removed number?",
      options: ["28", "25", "30", "32"],
      correct: 0,
    },
    {
      question: "A shopkeeper sells an item for $240 at a loss of 20%. At what price should he sell it to gain 20%?",
      options: ["$300", "$320", "$360", "$400"],
      correct: 2,
    },
  ],
  dsa: [
    {
      question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
      correct: 2,
    },
    {
      question: "Which data structure follows the Last-In-First-Out (LIFO) principle?",
      options: ["Queue", "Stack", "Linked List", "Tree"],
      correct: 1,
    },
    {
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n log n)", "O(n^2)", "O(n)", "O(log n)"],
      correct: 1,
    },
    {
      question: "Which of the following is NOT a stable sorting algorithm?",
      options: ["Merge Sort", "Insertion Sort", "Bubble Sort", "Quick Sort"],
      correct: 3,
    },
    {
      question: "Which data structure is typically used to implement Breadth-First Search (BFS) in a graph?",
      options: ["Stack", "Queue", "Priority Queue", "Heap"],
      correct: 1,
    },
  ],
};

function QuizGateway() {
  const navigate = useNavigate();
  const location = useLocation();
  const stored = JSON.parse(localStorage.getItem("candidate")) || {};

  // Determine round type from candidate data
  const isDsa = stored.rounds?.["Aptitude Round"]?.status === "Passed";
  const roundType = isDsa ? "dsa" : "aptitude";
  const roundName = isDsa ? "DSA Round" : "Aptitude Round";

  const [step, setStep] = useState("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [finishing, setFinishing] = useState(false);

  const questions = QUESTION_BANK[roundType];

  const handleNext = () => {
    if (selectedOption === null) {
      alert("Please select an option before proceeding.");
      return;
    }

    if (selectedOption === questions[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setStep("result");
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    if (stored.email) {
      try {
        const formData = new FormData();
        formData.append("email", stored.email);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(`${baseUrl}/candidates/complete-round`, {
          method: "POST",
          body: formData
        });

        if (response.ok) {
          alert(`Great job passing the ${roundName}! Your next round OTP will be sent shortly.`);
          navigate("/profile");
        }
      } catch (error) {
        console.error("Error advancing:", error);
        navigate("/profile");
      }
    } else {
      navigate("/profile");
    }
  };

  // Check if they passed (score >= 3 out of 5)
  // We need to calculate this properly in the result screen
  const isPassed = score >= 3;

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      {/* QUIZ STEP */}
      {step === "quiz" && (
        <div style={styles.quizPanel}>
          <div style={styles.quizHeader}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span style={styles.badge}>{roundName}</span>
          </div>

          <h2 style={styles.questionText}>{questions[currentQuestion].question}</h2>

          <div style={styles.optionsContainer}>
            {questions[currentQuestion].options.map((opt, idx) => (
              <label
                key={idx}
                style={{
                  ...styles.optionLabel,
                  border: selectedOption === idx ? "2px solid #00aaf3ff" : "1px solid rgba(255,255,255,0.15)",
                  background: selectedOption === idx ? "rgba(0,170,243,0.1)" : "rgba(255,255,255,0.05)"
                }}
              >
                <input
                  type="radio"
                  name="quiz-option"
                  checked={selectedOption === idx}
                  onChange={() => setSelectedOption(idx)}
                  style={styles.radioInput}
                />
                {opt}
              </label>
            ))}
          </div>

          <button style={styles.button} onClick={handleNext}>
            {currentQuestion === questions.length - 1 ? "Finish Assessment" : "Next Question"}
          </button>
        </div>
      )}

      {/* RESULT STEP */}
      {step === "result" && (
        <div style={styles.panel}>
          <div style={{ ...styles.centerContent, padding: "60px", textAlign: "center", width: "100%" }}>
            {isPassed ? (
              <>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎊</div>
                <h2 style={styles.heading}>Congratulations!</h2>
                <p style={styles.description}>
                  You scored <strong>{score} out of {questions.length}</strong>. You have successfully cleared the {roundName}.
                </p>
                <button
                  style={{ ...styles.button, maxWidth: "300px", margin: "30px auto 0" }}
                  onClick={handleFinish}
                  disabled={finishing}
                >
                  {finishing ? "Processing..." : "Continue to Next Steps"}
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: "60px", marginBottom: "20px" }}>🌟</div>
                <h2 style={styles.heading}>Thank You for Participating</h2>
                <p style={styles.description}>
                  You scored {score} out of {questions.length}. While you didn't reach the required score (3/5) this time,
                  we truly appreciate the effort and potential you demonstrated.
                </p>
                <p style={{ ...styles.description, marginTop: "15px" }}>
                  Every great journey has learning curves. We encourage you to keep sharpening your skills and apply for future opportunities.
                  You've got a bright path ahead of you!
                </p>
                <button
                  style={{ ...styles.button, maxWidth: "300px", margin: "30px auto 0", background: "rgba(255,255,255,0.2)", color: "white" }}
                  onClick={() => navigate("/profile")}
                >
                  Return to Profile
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: "url('/login-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "'Inter', sans-serif",
    padding: "20px",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(7, 26, 44, 0.9)",
  },
  panel: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "600px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  quizPanel: {
    position: "relative",
    zIndex: 2,
    width: "100%",
    maxWidth: "700px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(20px)",
    padding: "40px",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "white",
  },
  quizHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    fontSize: "14px",
    opacity: 0.7,
  },
  badge: {
    background: "#00aaf3ff",
    color: "#0b1c2d",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "700",
    fontSize: "12px",
  },
  questionText: {
    fontSize: "22px",
    lineHeight: "1.4",
    marginBottom: "30px",
    fontWeight: "600",
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "40px",
  },
  optionLabel: {
    padding: "16px 20px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "all 0.2s",
    fontSize: "16px",
  },
  radioInput: {
    marginRight: "15px",
    width: "18px",
    height: "18px",
    accentColor: "#00aaf3ff",
  },
  button: {
    width: "100%",
    padding: "16px",
    background: "#00aaf3ff",
    border: "none",
    borderRadius: "30px",
    color: "#0b1c2d",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "16px",
    transition: "all 0.3s",
  },
  loaderContainer: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    color: "white",
  },
  video: {
    width: "200px",
    borderRadius: "16px",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
    color: "white",
  },
  description: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "rgba(255,255,255,0.8)",
  },
  centerContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  }
};

export default QuizGateway;
