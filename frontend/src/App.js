import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";

import Auth from "./Auth";

import "./App.css";

const LANGUAGE_CONFIG = {
  JavaScript: {
    icon: "⚡",
    ext: "js",
    color: "#f7df1e",
  },

  Python: {
    icon: "🐍",
    ext: "py",
    color: "#4db6ac",
  },

  Java: {
    icon: "☕",
    ext: "java",
    color: "#ff8a65",
  },

  "C++": {
    icon: "⚙️",
    ext: "cpp",
    color: "#64b5f6",
  },
};


function Toast({
  message,
  type,
  onClose,
}) {

  useEffect(() => {

    const t = setTimeout(
      onClose,
      3000
    );

    return () => clearTimeout(t);

  }, [onClose]);

  return (

    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}


export default function App() {

  const [loggedInUser,
    setLoggedInUser] = useState(

    localStorage.getItem(
      "username"
    ) || ""
  );

  const [sidebarOpen,
    setSidebarOpen] = useState(false);

  const [code, setCode] = useState(

`print("Hello Monaco")

for i in range(5):
    print(i)
`
  );

  const [language,
    setLanguage] = useState(
      "Python"
    );

  const [review,
    setReview] = useState("");

  const [output,
    setOutput] = useState("");

  const [history,
    setHistory] = useState([]);

  const [loading,
    setLoading] = useState(false);

  const [executing,
    setExecuting] = useState(false);

  const [toast,
    setToast] = useState(null);


  const apiBase = useMemo(() => {

    return "http://127.0.0.1:8000";

  }, []);


  useEffect(() => {

    if (loggedInUser) {

      fetchHistory();
    }

  }, [loggedInUser]);


  const lang =
    LANGUAGE_CONFIG[language];

  const lines =
    code.split("\n").length;

  const chars =
    code.length;


  const notify = (
    message,
    type = "success"
  ) => {

    setToast({
      message,
      type,
    });
  };


  const logout = () => {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "username"
    );

    setLoggedInUser("");
  };


  const fetchHistory = async () => {

    try {

      const res = await fetch(

        `${apiBase}/history`,

        {
          headers: {

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!data.error) {

        setHistory(data);
      }

    } catch (err) {

      console.error(err);
    }
  };


  const reviewCode = async () => {

    if (!code.trim()) {

      notify(
        "Paste some code first.",
        "error"
      );

      return;
    }

    setLoading(true);

    try {

      const res = await fetch(

        `${apiBase}/review`,

        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({

            code,
            language,
          }),
        }
      );

      const data = await res.json();

      setReview(

        data.review ||
        data.response ||
        data.result ||
        data.message ||
        "No review returned."
      );

      notify(
        "Review generated!"
      );

    } catch (err) {

      console.error(err);

      setReview(
        "Backend connection failed."
      );

      notify(
        "Review failed.",
        "error"
      );

    } finally {

      setLoading(false);
    }
  };


  const executeCode = async () => {

    if (!code.trim()) {

      notify(
        "Paste some code first.",
        "error"
      );

      return;
    }

    setExecuting(true);

    try {

      const res = await fetch(

        `${apiBase}/execute`,

        {
          method: "POST",

          headers: {

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${localStorage.getItem("token")}`,
          },

          body: JSON.stringify({

            code,
            language,
          }),
        }
      );

      const data = await res.json();

      setOutput(

        data.output ||
        data.error ||
        "No output"
      );

      notify(
        "Execution completed!"
      );

      fetchHistory();

    } catch (err) {

      console.error(err);

      setOutput(
        "Execution failed."
      );

      notify(
        "Execution failed.",
        "error"
      );

    } finally {

      setExecuting(false);
    }
  };


  const clearAll = () => {

    setCode("");
    setReview("");
    setOutput("");

    notify("Cleared.");
  };


  if (!loggedInUser) {

    return (

      <Auth
        onLogin={
          setLoggedInUser
        }
      />
    );
  }


  return (

    <div className="app">

      {toast && (

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}


      {/* SIDEBAR */}

      <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>

        <div className="sidebar-header">

          <h2>History</h2>

          <button
            className="close-btn"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            ✕
          </button>

        </div>


        <div className="history-body">

          {
            history.length === 0 ? (

              <div className="state-empty">

                <p>No history yet</p>

              </div>

            ) : (

              history.map((item) => (

                <div
                  key={item.id}
                  className="history-card"

                  onClick={() => {

                    setCode(item.code);

                    setLanguage(item.language);

                    setOutput(item.output);

                    setReview(item.review);

                    setSidebarOpen(false);
                  }}
                >

                  <h4>
                    {item.language}
                  </h4>

                  <pre>
                    {
                      item.code.slice(0, 80)
                    }
                  </pre>

                </div>
              ))
            )
          }

        </div>
      </div>


      {/* OVERLAY */}

      {
        sidebarOpen && (

          <div
            className="overlay"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )
      }


      <div className="main-content">

        <header className="hdr">

          <div className="hdr-left">

            <button
              className="menu-btn"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              ☰
            </button>

            <div className="hdr-brand">

              <span className="brand-glyph">
                ◈
              </span>

              <span className="brand-name">
                CodeSense
              </span>

              <span className="brand-tag">
                AI
              </span>

            </div>

          </div>

          <div className="user-bar">

            <span>
              Welcome,
              {" "}
              {loggedInUser}
            </span>

            <button onClick={logout}>
              Logout
            </button>

          </div>

        </header>


        <div className="workspace">

          {/* EDITOR */}

          <div className="panel">

            <div className="panel-chrome">

              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />

              <span className="panel-filename">

                {lang.icon}
                {" "}
                editor.{lang.ext}

              </span>

              <div className="chrome-actions">

                <select
                  className="lang-pick"
                  value={language}
                  onChange={(e) =>
                    setLanguage(
                      e.target.value
                    )
                  }
                >

                  {Object.entries(
                    LANGUAGE_CONFIG
                  ).map(([l, v]) => (

                    <option
                      key={l}
                      value={l}
                    >
                      {v.icon} {l}
                    </option>

                  ))}

                </select>

                <button
                  className="cta-ghost cta-red"
                  onClick={clearAll}
                >
                  ✕
                </button>

              </div>
            </div>


            <div className="editor-wrap">

              <Editor

                height="70vh"

                defaultLanguage="python"

                language={
                  language === "Python"
                    ? "python"
                    : language === "JavaScript"
                    ? "javascript"
                    : language === "Java"
                    ? "java"
                    : "cpp"
                }

                theme="vs-dark"

                value={code}

                onChange={(value) =>
                  setCode(value || "")
                }

                onMount={(editor) => {

                  editor.focus();

                }}

                options={{

                  fontSize: 14,

                  minimap: {
                    enabled: false,
                  },

                  automaticLayout: true,

                  scrollBeyondLastLine:
                    false,

                  wordWrap: "on",

                  tabSize: 2,

                  fontFamily:
                    "Fira Code, monospace",

                  cursorBlinking:
                    "smooth",

                  cursorStyle:
                    "line",

                  cursorWidth: 3,

                  smoothScrolling: true,
                }}
              />

            </div>


            <div className="editor-bar">

              <span className="stat">
                {lines} ln
              </span>

              <span className="stat">
                {chars} ch
              </span>

              <span
                className="stat"
                style={{
                  color: lang.color,
                }}
              >
                {lang.icon} {language}
              </span>

            </div>
          </div>


          {/* REVIEW */}

          <div className="panel panel-review-pane">

            <div className="panel-chrome">

              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />

              <span className="panel-filename">
                ◈ ai-review.md
              </span>

            </div>

            <div className="review-body">

              {loading ? (

                <div className="state-loading">
                  <p>Reviewing...</p>
                </div>

              ) : review ? (

                <pre className="output-box">
                  {review}
                </pre>

              ) : (

                <div className="state-empty">

                  <div className="empty-glyph">
                    ◈
                  </div>

                  <p>
                    AI review appears here
                  </p>

                </div>

              )}

            </div>
          </div>


          {/* OUTPUT */}

          <div className="panel panel-review-pane">

            <div className="panel-chrome">

              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />

              <span className="panel-filename">
                ⚡ output.txt
              </span>

            </div>

            <div className="review-body">

              {executing ? (

                <div className="state-loading">
                  <p>Executing...</p>
                </div>

              ) : output ? (

                <pre className="output-box">
                  {output}
                </pre>

              ) : (

                <div className="state-empty">

                  <div className="empty-glyph">
                    ⚡
                  </div>

                  <p>
                    Output appears here
                  </p>

                </div>

              )}

            </div>
          </div>

        </div>


        <div className="action-bar">

          <button
            className="review-btn"
            onClick={reviewCode}
            disabled={loading}
          >

            {
              loading
                ? "Reviewing..."
                : "Review Code"
            }

          </button>

          <button
            className="review-btn"
            onClick={executeCode}
            disabled={executing}
          >

            {
              executing
                ? "Running..."
                : "Run Code"
            }

          </button>

        </div>

      </div>

    </div>
  );
}