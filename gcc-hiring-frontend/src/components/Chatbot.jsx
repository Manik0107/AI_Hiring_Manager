import { useState } from "react";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hello 👋 I'm the GCC Hiring Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { from: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          session_id: "session_" + Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMsg = {
        from: "bot",
        text: data.formatted_response || data.response,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      const errorMsg = {
        from: "bot",
        text: "Sorry, I'm having trouble connecting to the server. Please make sure the backend is running and try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={styles.fab} onClick={() => setOpen(!open)}>
        <img
          src="\robot-assistant.png"
          alt="Chatbot"
          style={styles.botIcon}
        />
      </div>

      {open && (
        <div style={styles.chatbox}>
          <div style={styles.header}>GCC Hiring Assistant</div>

          <div style={styles.body}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={
                  msg.from === "bot"
                    ? styles.botMessage
                    : styles.userMessage
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={styles.botMessage}>
                <div style={styles.loadingDots}>
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <input
              style={styles.input}
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              style={{
                ...styles.sendBtn,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  fab: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "#00aaf3ff",
    color: "#0b1c2d",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "22px",
    fontWeight: "bold",
    zIndex: 999,
  },
  chatbox: {
    position: "fixed",
    bottom: "100px",
    right: "30px",
    width: "320px",
    height: "420px",
    background: "#0b1c2d",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
    zIndex: 999,
  },
  header: {
    padding: "14px",
    background: "#00aaf3ff",
    color: "#0b1c2d",
    fontWeight: "600",
    textAlign: "center",
  },
  body: {
    flex: 1,
    padding: "12px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  botIcon: {
    width: "32px",
    height: "32px",
    objectFit: "contain",
  },

  botMessage: {
    alignSelf: "flex-start",
    background: "rgba(255,255,255,0.1)",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    maxWidth: "85%",
  },
  fab: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "#00aaf3ff",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    zIndex: 999,
  },

  userMessage: {
    alignSelf: "flex-end",
    background: "#00aaf3ff",
    color: "#0b1c2d",
    padding: "10px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    maxWidth: "85%",
  },
  footer: {
    display: "flex",
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
    fontSize: "13px",
  },
  sendBtn: {
    padding: "10px 14px",
    background: "#00aaf3ff",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  loadingDots: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  "@keyframes blink": {
    "0%, 100%": { opacity: 0.3 },
    "50%": { opacity: 1 },
  },
};

export default Chatbot;
