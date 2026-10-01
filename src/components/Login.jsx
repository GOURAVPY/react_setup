import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import { playSound } from "../store/sound";

const STORAGE_KEY = "loggedIn";
const USER_NAME = "Gourav";
const LEAVE_DURATION = 600;

const hasLoggedIn = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

// macOS-style login screen shown once per visit, after the startup screen.
// There is no real account: any password, or none, lets the visitor in.
const Login = () => {
  const [status, setStatus] = useState(() =>
    hasLoggedIn() ? "gone" : "locked",
  );
  const [now, setNow] = useState(() => dayjs());
  const input = useRef(null);

  useEffect(() => {
    if (status !== "locked") return;

    const timer = setInterval(() => setNow(dayjs()), 1000);

    // the startup screen covers this one at first; take focus once it is gone
    const focusInput = () => input.current?.focus();
    if (!document.getElementById("boot")) focusInput();
    window.addEventListener("boot:done", focusInput);

    return () => {
      clearInterval(timer);
      window.removeEventListener("boot:done", focusInput);
    };
  }, [status]);

  if (status === "gone") return null;

  const logIn = (e) => {
    e.preventDefault();
    playSound("unlock");
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage can be blocked; the login then shows again on reload
    }
    setStatus("leaving");
    setTimeout(() => setStatus("gone"), LEAVE_DURATION);
  };

  return (
    <section id="login" className={status === "leaving" ? "leaving" : ""}>
      <header>
        <p>{now.format("dddd, MMMM D")}</p>
        <time>{now.format("h:mm")}</time>
      </header>

      <form onSubmit={logIn}>
        <div className="avatar">{USER_NAME[0]}</div>
        <h1>{USER_NAME}</h1>

        <div className="password">
          <input
            ref={input}
            type="password"
            placeholder="Enter Password"
            aria-label="Password"
            autoComplete="off"
          />
          <button type="submit" aria-label="Log in">
            <ArrowRight size={14} />
          </button>
        </div>

        <p>Any password works. Press Enter to log in.</p>
      </form>
    </section>
  );
};

export default Login;
