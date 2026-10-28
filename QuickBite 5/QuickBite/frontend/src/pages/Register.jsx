
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import{auth} from "../firebase";
import {firebaseLogin} from "../api";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
  signOut,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

 
async function handleResendVerification() {
  setError("");

  const email = form.email.trim().toLowerCase();
  const password = form.password;

  if (!email || !password) {
    setError("Enter your existing account email and password first.");
    return;
  }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (credential.user.emailVerified) {
      setError("Your email is already verified. Please sign in.");
      await signOut(auth);
      return;
    }

    await sendEmailVerification(credential.user);
    await signOut(auth);

    setError("Verification email sent again. Check your inbox and Spam folder.");
  } catch (err) {
    console.error("Resend verification error:", err.code, err.message);

    setError(
      err.code === "auth/invalid-credential"
        ? "Email or password is incorrect."
        : err.message || "Could not resend verification email."
    );
  }
}

 
  async function handleSubmit(event){
    event.preventDefault();
    setError("");
    if(
      !form.fullName.trim()||
      !form.email.trim()||
      !form.phone.trim()||
      !form.password||
      !form.confirmPassword
    ){setError("please fill required fileds");
      return;

    }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())){
      setError("please enter valid email address");
      return;
     }
     if(!/^[6-9]\d{9}$/.test(form.phone.trim())){
      setError("enter a valid 10 digit mobile number");
      return;
     }
     if(form.password.length<8){
      setError("your must be 8 character long");
      return;
     }
     if(!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password)){
      setError("password must contain uppercase and lowercase");
      return;
     }
     if(!/\d/.test(form.password)){
      setError("password must conatain at least one number");
      return;
     }
     if(form.password!== form.confirmPassword){
      setError("password don nit match");
      return;
     }
     if(!agreeTerms){
      setError("please confirm terms of service to continue");
      return;
     }
     try{
      const credential= await createUserWithEmailAndPassword(
        auth,
        form.email.trim().toLocaleLowerCase(),
        form.password
      );
      await updateProfile(credential.user,{
        displayName:form.fullName.trim(),
      });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      setError("account crewdential! please verify email using link");
     }catch(err){
      console.error("registeration error:", err);
      if(err.code==="auth/email-already-in-use"){
        setError("this email already has ana account");
      }else if(err.code=== "auth/weak pass"){
        setError("please choose strong pass");
      }else{
        setError(err.message ||"registeration falied.please try again");
      }
     }
   
  }


  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <section style={styles.leftPanel}>
          <div style={styles.brand}>
            <span style={styles.brandIcon}>🍔</span>
            <span>QuickBite</span>
          </div>

          <div style={styles.leftContent}>
            <span style={styles.pill}>YOUR NEXT FAVOURITE MEAL</span>

            <h1>
              Good food.
              <br />
              Great moments.
              <br />
              <span>One account.</span>
            </h1>

            <p>
              Join QuickBite to discover delicious meals, save your
              favourites and keep all your orders in one place.
            </p>

            <div style={styles.benefits}>
              <div style={styles.benefit}>
                <span>🍽️</span>
                <div>
                  <strong>Explore local favourites</strong>
                  <small>Discover restaurants and delicious dishes.</small>
                </div>
              </div>

              <div style={styles.benefit}>
                <span>❤️</span>
                <div>
                  <strong>Save what you love</strong>
                  <small>Keep your favourite meals close.</small>
                </div>
              </div>

              <div style={styles.benefit}>
                <span>🛵</span>
                <div>
                  <strong>Stay in the loop</strong>
                  <small>View your orders and delivery progress.</small>
                </div>
              </div>
            </div>
          </div>

          <p style={styles.leftFooter}>
            Made with ❤️ for food lovers.
          </p>
        </section>

        <section style={styles.rightPanel}>
          <div style={styles.formCard}>
            <div style={styles.mobileBrand}>
              🍔 <span>QuickBite</span>
            </div>

            <span style={styles.eyebrow}>GET STARTED</span>
            <h2>Create your account</h2>

            <p style={styles.subtitle}>
              Join us for something delicious.
            </p>

            <form onSubmit={handleSubmit}>
              <label style={styles.label} htmlFor="register-name">
                Full name *
              </label>

              <input
                id="register-name"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
                maxLength={100}
                required
                style={styles.input}
              />

              <label style={styles.label} htmlFor="register-email">
                Email address *
              </label>

              <input
                id="register-email"
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

              <label style={styles.label} htmlFor="register-phone">
                Mobile number *
              </label>

              <div style={styles.phoneWrapper}>
                <span style={styles.countryCode}>🇮🇳 +91</span>

                <input
                  id="register-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  autoComplete="tel-national"
                  inputMode="numeric"
                  maxLength={10}
                  required
                  style={styles.phoneInput}
                />
              </div>

              <label style={styles.label} htmlFor="register-password">
                Password *
              </label>

              <div style={styles.passwordWrapper}>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p style={styles.passwordHint}>
                At least 8 characters, including uppercase, lowercase
                and a number.
              </p>

              <label
                style={styles.label}
                htmlFor="register-confirm-password"
              >
                Confirm password *
              </label>

              <div style={styles.passwordWrapper}>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                  style={styles.passwordInput}
                />

                <button
                  type="button"
                  style={styles.showButton}
                  onClick={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              <label style={styles.termsCheckbox}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />

                <span>
                  I agree to the{" "}
                  <a href="/terms" style={styles.link}>
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" style={styles.link}>
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              {error && (
                <p role="alert" style={styles.error}>
                  {error}
                </p>
              )}
              
<button
  type="button"
  onClick={handleResendVerification}
  style={{
    ...styles.submitButton,
    marginBottom: 12,
    background: "#fff",
    color: "#e95220",
    border: "1px solid #e9ded5",
  }}
>
  Resend verification email
</button>


              <button type="submit" style={styles.submitButton}>
                Create account <span>→</span>
              </button>
            </form>

            <p style={styles.loginText}>
              Already have an account?{" "}
              <a href="/login" style={styles.loginLink}>
                Sign in
              </a>
            </p>

            <p style={styles.demoNote}>
              Demo only: Account details are stored in this browser.
              Real registration and secure authentication will be added
              with the backend.
            </p>
          </div>
        </section>
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
    gridTemplateColumns: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
    minHeight: 800,
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "40px clamp(25px, 5vw, 70px)",
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
    maxWidth: 460,
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
    letterSpacing: 1.1,
  },
  benefits: {
    display: "grid",
    gap: 22,
    marginTop: 35,
  },
  benefit: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  leftFooter: {
    color: "#81766f",
    fontSize: 12,
  },
  rightPanel: {
    display: "grid",
    placeItems: "center",
    padding: "45px 25px",
  },
  formCard: {
    width: "100%",
    maxWidth: 440,
  },
  mobileBrand: {
    display: "none",
    alignItems: "center",
    gap: 8,
    marginBottom: 25,
    fontSize: 21,
    fontWeight: 900,
  },
  eyebrow: {
    color: "#ff6b35",
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: 1.8,
  },
  subtitle: {
    marginBottom: 24,
    color: "#81766f",
    fontSize: 13,
    lineHeight: 1.7,
  },
  label: {
    display: "block",
    marginBottom: 8,
    color: "#554c46",
    fontSize: 12,
    fontWeight: 800,
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: 13,
    marginBottom: 17,
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
    color: "#29231f",
    fontSize: 12,
    outlineColor: "#ff6b35",
  },
  phoneWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    boxSizing: "border-box",
    width: "100%",
    padding: "0 12px",
    marginBottom: 17,
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
  },
  countryCode: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: 700,
  },
  phoneInput: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    padding: 13,
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: 12,
  },
  passwordWrapper: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    boxSizing: "border-box",
    width: "100%",
    padding: "0 12px",
    marginBottom: 7,
    border: "1px solid #e9ded5",
    borderRadius: 10,
    background: "#fff",
  },
  passwordInput: {
    boxSizing: "border-box",
    width: "100%",
    minWidth: 0,
    padding: 13,
    border: 0,
    outline: "none",
    background: "transparent",
    fontSize: 12,
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
  passwordHint: {
    margin: "7px 0 18px",
    color: "#81766f",
    fontSize: 10,
    lineHeight: 1.6,
  },
  termsCheckbox: {
    display: "flex",
    alignItems: "start",
    gap: 9,
    margin: "20px 0",
    color: "#756b65",
    fontSize: 11,
    lineHeight: 1.7,
  },
  link: {
    color: "#e95220",
    fontWeight: 700,
    textDecoration: "none",
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
  loginText: {
    marginTop: 24,
    color: "#756b65",
    fontSize: 12,
    textAlign: "center",
  },
  loginLink: {
    color: "#e95220",
    fontWeight: 900,
    textDecoration: "none",
  },
  demoNote: {
    marginTop: 17,
    color: "#8b817a",
    fontSize: 10,
    lineHeight: 1.7,
    textAlign: "center",
  },
};
