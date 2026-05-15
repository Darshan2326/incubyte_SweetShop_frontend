import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../API/auth";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState("");

  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/homepage");
      }
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      setLoading(false);

      if (response.token) {
        login(response.token, response.user);
        setMessage(`✅ ${response.message}`);

        if (response.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/homepage");
        }
      } else {
        setMessage("❌ Something went wrong");
      }
    } catch (error) {
      setLoading(false);
      console.error("Authentication error:", error);
      if (error.name === 'TypeError' || error.message.includes('fetch') || error.message.includes('CORS')) {
        setMessage("❌ Network error. Please check your connection or try again later.");
      } else {
        setMessage(`❌ ${error.message || "Something went wrong"}`);
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.floatingCandy1}>🍭</div>
      <div style={styles.floatingCandy2}>🍩</div>
      <div style={styles.floatingCandy3}>🧁</div>
      <div style={styles.floatingCandy4}>🍪</div>
      <div style={styles.floatingCandy5}>🍫</div>
      <div style={styles.floatingCandy6}>🍬</div>

      <div style={styles.mainCard}>
        <div style={styles.brandingSide}>
          <div style={styles.brandingContent}>
            <div style={styles.logoContainer}>
              <span style={styles.logoIcon}>🍰</span>
            </div>
            <h1 style={styles.brandName}>Sweet Delights</h1>
            <p style={styles.brandTagline}>Management System</p>
            <div style={styles.dividerLine}></div>
            <p style={styles.brandDescription}>
              Manage your sweet shop with ease. Track inventory, orders, and delight your customers!
            </p>
            <div style={styles.sweetIcons}>
              <span style={styles.sweetIcon}>🍩</span>
              <span style={styles.sweetIcon}>🧁</span>
              <span style={styles.sweetIcon}>🍪</span>
              <span style={styles.sweetIcon}>🍫</span>
              <span style={styles.sweetIcon}>🍬</span>
            </div>
          </div>
          <div style={styles.waveDecoration}>
            <svg viewBox="0 0 500 150" preserveAspectRatio="none" style={styles.waveSvg}>
              <path
                d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"
                style={styles.wavePath}
              ></path>
            </svg>
          </div>
        </div>

        <div style={styles.formSide}>
          <div style={styles.formContainer}>
            <h2 style={styles.formTitle}>Welcome Back! 👋</h2>
            <p style={styles.formSubtitle}>
              Enter your credentials to access the dashboard
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>📧 Email Address</label>
                <div
                  style={{
                    ...styles.inputWrapper,
                    ...(focusedInput === "email" ? styles.inputWrapperFocused : {}),
                  }}
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("email")}
                    onBlur={() => setFocusedInput("")}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>🔒 Password</label>
                <div
                  style={{
                    ...styles.inputWrapper,
                    ...(focusedInput === "password" ? styles.inputWrapperFocused : {}),
                  }}
                >
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput("")}
                    style={styles.input}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.submitButtonDisabled : {}),
                }}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Please wait...
                  </span>
                ) : (
                  "🚀 Login to Dashboard"
                )}
              </button>
            </form>

            <div style={styles.demoCredentials}>
              <p style={styles.demoTitle}>🔑 Demo Credentials</p>
              <p style={styles.demoText}><strong>Admin:</strong> admin@demo.com / admin123</p>
              <p style={styles.demoText}><strong>User:</strong> user@demo.com / user123</p>
            </div>

            {message && (
              <div
                style={{
                  ...styles.messageBox,
                  ...(message.includes("✅")
                    ? styles.successMessage
                    : styles.errorMessage),
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(10deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4);
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    width: "100vw",
    flexDirection: "column",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ee9ca7 100%)",
    padding: "20px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  floatingCandy1: {
    position: "absolute",
    top: "10%",
    left: "5%",
    fontSize: "40px",
    animation: "float 3s ease-in-out infinite",
    opacity: "0.8",
  },
  floatingCandy2: {
    position: "absolute",
    top: "20%",
    right: "8%",
    fontSize: "35px",
    animation: "float 4s ease-in-out infinite 0.5s",
    opacity: "0.8",
  },
  floatingCandy3: {
    position: "absolute",
    bottom: "15%",
    left: "10%",
    fontSize: "45px",
    animation: "float 3.5s ease-in-out infinite 1s",
    opacity: "0.8",
  },
  floatingCandy4: {
    position: "absolute",
    bottom: "25%",
    right: "5%",
    fontSize: "38px",
    animation: "float 4.5s ease-in-out infinite 0.3s",
    opacity: "0.8",
  },
  floatingCandy5: {
    position: "absolute",
    top: "50%",
    left: "3%",
    fontSize: "30px",
    animation: "float 5s ease-in-out infinite 0.7s",
    opacity: "0.7",
  },
  floatingCandy6: {
    position: "absolute",
    top: "40%",
    right: "3%",
    fontSize: "32px",
    animation: "float 3.8s ease-in-out infinite 1.2s",
    opacity: "0.7",
  },
  mainCard: {
    display: "flex",
    width: "900px",
    maxWidth: "95%",
    minHeight: "600px",
    background: "#fff",
    borderRadius: "30px",
    overflow: "hidden",
    boxShadow: "0 25px 80px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: 10,
  },
  brandingSide: {
    flex: "1",
    background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #b8405e 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
    position: "relative",
    overflow: "hidden",
  },
  brandingContent: {
    textAlign: "center",
    color: "#fff",
    zIndex: 2,
  },
  logoContainer: {
    width: "100px",
    height: "100px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 20px",
    backdropFilter: "blur(10px)",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    animation: "pulse 2s ease-in-out infinite",
  },
  logoIcon: {
    fontSize: "50px",
  },
  brandName: {
    fontSize: "32px",
    fontWeight: "800",
    marginBottom: "5px",
    textShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
    letterSpacing: "1px",
  },
  brandTagline: {
    fontSize: "16px",
    opacity: "0.9",
    fontWeight: "500",
    letterSpacing: "3px",
    textTransform: "uppercase",
  },
  dividerLine: {
    width: "60px",
    height: "3px",
    background: "rgba(255, 255, 255, 0.5)",
    margin: "25px auto",
    borderRadius: "10px",
  },
  brandDescription: {
    fontSize: "14px",
    lineHeight: "1.8",
    opacity: "0.9",
    maxWidth: "280px",
    margin: "0 auto",
  },
  sweetIcons: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
    gap: "15px",
  },
  sweetIcon: {
    fontSize: "28px",
    animation: "float 3s ease-in-out infinite",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  waveDecoration: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    height: "100px",
    overflow: "hidden",
  },
  waveSvg: {
    width: "100%",
    height: "100%",
  },
  wavePath: {
    fill: "rgba(255, 255, 255, 0.1)",
  },
  formSide: {
    flex: "1.2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "50px",
    background: "linear-gradient(180deg, #ffffff 0%, #fff9f9 100%)",
  },
  formContainer: {
    maxWidth: "380px",
    margin: "0 auto",
    width: "100%",
  },
  formTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2d2d2d",
    marginBottom: "8px",
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "30px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  inputLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#555",
  },
  inputWrapper: {
    position: "relative",
    borderRadius: "12px",
    border: "2px solid #eee",
    background: "#fafafa",
    transition: "all 0.3s ease",
    overflow: "hidden",
  },
  inputWrapperFocused: {
    border: "2px solid #ff6b9d",
    background: "#fff",
    boxShadow: "0 5px 20px rgba(255, 107, 157, 0.15)",
  },
  input: {
    width: "100%",
    padding: "15px 18px",
    border: "none",
    background: "transparent",
    fontSize: "14px",
    color: "#333",
    outline: "none",
    boxSizing: "border-box",
  },
  submitButton: {
    padding: "16px 30px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 25px rgba(196, 69, 105, 0.35)",
    marginTop: "10px",
    position: "relative",
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: "0.7",
    cursor: "not-allowed",
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid #fff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },
  demoCredentials: {
    marginTop: "25px",
    padding: "15px 20px",
    background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
    borderRadius: "12px",
    border: "1px solid #ffeaa7",
  },
  demoTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#856404",
    marginBottom: "8px",
  },
  demoText: {
    fontSize: "12px",
    color: "#856404",
    margin: "4px 0",
    lineHeight: "1.5",
  },
  messageBox: {
    marginTop: "20px",
    padding: "15px 20px",
    borderRadius: "12px",
    textAlign: "center",
    fontSize: "14px",
    fontWeight: "500",
  },
  successMessage: {
    background: "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)",
    color: "#155724",
    border: "1px solid #c3e6cb",
  },
  errorMessage: {
    background: "linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)",
    color: "#721c24",
    border: "1px solid #f5c6cb",
  },
};

export default AuthPage;
