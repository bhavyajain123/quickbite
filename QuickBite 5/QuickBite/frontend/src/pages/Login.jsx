
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { login,firebaseLogin, setToken } from "../api";
import{auth} from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

 
async function handleSubmit(event) {
  event.preventDefault();
  setError("");

  if (!form.email.trim() || !form.password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    const data = await login({
      
      email: form.email.trim(),
      password: form.password,
    });
     console.log("LOGIN USER DATA:", data.user);
     alert(JSON.stringify(data.user));
   

  
if (!data.token) {
  throw new Error("Login response mein token nahi mila.");
}

setToken(data.token);

console.log("LOGIN USER DATA:", data.user);

const storage = rememberMe ? localStorage : sessionStorage;

storage.setItem(
  "quickbite-demo-session",
  JSON.stringify({
    name: data.user?.name || data.user?.fullName || "",
    email: data.user?.email || form.email.trim().toLowerCase(),
    role: data.user?.role || "customer",
    loggedIn: true,
  })
);
setUserName?.(data.user?.name || data.user?.fullName || "");




    window.location.href = "/";
  } catch (err) {
    setError(err.message || "Login failed. Please try again.");
  }
}
async function handleSubmit(event){
  event.preventDefault();
  setError("");
  if(!form.email.trim() |form.password){
    setError("please enter your email and password");
    return;
  }
  try{const credential= await signInWithEmailAndPassword(
    auth,
    form.email.trim(),
    form.password
  );

  const idToken =await credential.user.getIdToken();
  const data= await firebaseLogin(idToken, credential.user.displayName);
  const storage= rememberMe? localStorage:sessionStorage;


storage.setItem(
  "quickbite-demo-session",
  JSON.stringify({
    name:
      data.user?.name ||
      credential.user.displayName ||
      form.email.trim().split("@")[0],
    fullName:
      data.user?.name ||
      credential.user.displayName ||
      form.email.trim().split("@")[0],
    email: data.user?.email || form.email.trim().toLowerCase(),
    role: data.user?.role || "customer",
    loggedIn: true,
  })
);

  window.location.href="/";
}catch(err){
  setError(
    err.code==="auth/invalid-credential"
    ?"Emial or pass is invorrect"
    :err.message|| "login failed.please try again"
  );
}
}

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🍔</span>
            <span>QuickBite</span>
          </div>

          <div style={styles.leftContent}>
            <span style={styles.pill}>GOOD FOOD, GOOD MOOD</span>

            <h1>
              Your favourites,
              <br />
              just a <span>click away.</span>
            </h1>

            <p>
              Sign in to discover amazing restaurants, reorder your
              favourite meals and enjoy a smoother food delivery
              experience.
            </p>

            <div style={styles.features}>
              <div style={styles.feature}>
                <span>🍕</span>
                <div>
                  <strong>Your favourite food</strong>
                  <small>Everything you love in one place.</small>
                </div>
              </div>

              <div style={styles.feature}>
                <span>🛵</span>
                <div>
                  <strong>Easy order tracking</strong>
                  <small>Keep an eye on your orders.</small>
                </div>
              </div>

              <div style={styles.feature}>
                <span>❤️</span>
                <div>
                  <strong>Personalised experience</strong>
                  <small>Save dishes you love.</small>
                </div>
              </div>
            </div>
          </div>

          <p style={styles.leftFooter}>
            Made with ❤️ for food lovers.
          </p>
        </div>

        <div style={styles.rightPanel}>
          <section style={styles.formCard}>
            <div style={styles.mobileBrand}>
              <span>🍔</span> QuickBite
            </div>

            <span style={styles.eyebrow}>WELCOME BACK</span>

            <h2>Sign in to QuickBite</h2>

            <p style={styles.subtitle}>
              Enter your details to continue.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={styles.label} htmlFor="login-email">
                Email address
              </label>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>✉</span>

                <input
                  id="login-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.passwordHeading}>
                <label style={styles.label} htmlFor="login-password">
                  Password
                </label>

                <button
                  type="button"
                  style={styles.textButton}
                  onClick={() => {
                    window.location.href = "/forgot-password";
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <div style={styles.inputWrapper}>
                <span style={styles.inputIcon}>🔒</span>

                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  style={styles.input}
                />

                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label style={styles.remember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me on this device</span>
              </label>

              {error && (
                <p role="alert" style={styles.error}>
                  {error}
                </p>
              )}

              <button type="submit" style={styles.submitButton}>
                Sign in <span>→</span>
              </button>
            </form>

            <div style={styles.divider}>
              <span />
              <p>NEW TO QUICKBITE?</p>
              <span />
            </div>

            <button
              type="button"
              style={styles.registerButton}
              onClick={() => {
                window.location.href = "/register";
              }}
            >
              Create an account
            </button>

            <p style={styles.terms}>
              By continuing, you agree to our{" "}
              <a href="/terms" style={styles.link}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" style={styles.link}>
                Privacy Policy
              </a>
              .
            </p>

            <p style={styles.demoNote}>
              Demo notice: This page creates a local demo session only.
              It does not verify credentials or provide secure
              authentication yet.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fffdfb",
    color: "#29231f",
    fontFamily: "'DM Sans', sans-serif",
  },
  main: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    minHeight: 690,
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "40px clamp(25px, 5vw, 75px)",
    background: "#fff0e6",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 23,
    fontWeight: 900,
    letterSpacing: -0.8,
  },
  brandIcon: {
    display: "grid",
    placeItems: "center",
    width: 43,
    height: 43,
    borderRadius: 13,
    background: "#ff6b35",
    fontSize: 23,
  },
  leftContent: {
    maxWidth: 480,
    margin: "55px auto",
  },
  pill: {
    display: "inline-block",
    padding: "9px 12px",
    borderRadius: 20,
    background: "#ffe0cc",
    color: "#bf4d1d",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.3,
  },
  features: {
    display: "grid",
    gap: 23,
    marginTop: 35,
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },
  leftFooter: {
    color: "#81766f",
    fontSize: 12,
  },
  rightPanel: {
    display: "grid",
    placeItems: "center",
    padding: "50px 25px",
  },
  formCard: {
    width: "100%",
    maxWidth: 420,
  },
  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: 8,
    fontSize: 21,
    fontWeight: 900,
    marginBottom: 30,
  },
  eyebrow: {
    color: "#ff6b35",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.8,
  },
  subtitle: {
    color: "#81766f",
    fontSize: 13,
    lineHeight: 1.7,
    marginBottom: 28,
  },
  label: {
    display: "block",
    marginBottom: 9,
    fontSize: 12,
    fontWeight: 800,
    color: "#554c46",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 13px",
    marginBottom: 22,
    border: "1px solid #e9ded5",
    borderRadius: 11,
    background: "#fff",
  },
  inputIcon: {
    fontSize: 15,
  },
  input: {
    width: "100%",
    minWidth: 0,
    padding: "15px 0",
    border: 0,
    outline: "none",
    background: "transparent",
    color: "#29231f",
    fontSize: 13,
  },
  passwordHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  textButton: {
    marginBottom: 9,
    padding: 0,
    border: 0,
    background: "transparent",
    color: "#e95220",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
  },
  showButton: {
    padding: 5,
    border: 0,
    background: "transparent",
    color: "#e95220",
    fontSize: 11,
    fontWeight: 800,
    cursor: "pointer",
  },
  remember: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    margin: "0 0 23px",
    color: "#756b65",
    fontSize: 12,
    cursor: "pointer",
  },
  error: {
    padding: 12,
    borderRadius: 9,
    background: "#fff0f0",
    color: "#bd3030",
    fontSize: 12,
    lineHeight: 1.6,
  },
  submitButton: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    width: "100%",
    padding: 15,
    border: 0,
    borderRadius: 11,
    background: "#ff6b35",
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    cursor: "pointer",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    margin: "27px 0",
    color: "#a0968f",
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: 1,
  },
  registerButton: {
    width: "100%",
    padding: 14,
    border: "1px solid #e9ded5",
    borderRadius: 11,
    background: "#fff",
    color: "#29231f",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
  terms: {
    marginTop: 25,
    color: "#81766f",
    fontSize: 10,
    lineHeight: 1.8,
    textAlign: "center",
  },
  link: {
    color: "#e95220",
    textDecoration: "none",
    fontWeight: 700,
  },
  demoNote: {
    marginTop: 15,
    color: "#8b817a",
    fontSize: 10,
    lineHeight: 1.7,
    textAlign: "center",
  },
};

