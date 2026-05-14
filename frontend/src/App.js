import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const LANGUAGE_CONFIG = {
  JavaScript: { icon: "⚡", ext: "js", color: "#f7df1e" },
  Python: { icon: "🐍", ext: "py", color: "#4db6ac" },
  Java: { icon: "☕", ext: "java", color: "#ff8a65" },
  "C++": { icon: "⚙️", ext: "cpp", color: "#64b5f6" },
};

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return <div className={`toast toast-${type}`}>{message}</div>;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMarkdown(raw) {
  if (!raw) return "";

  let safe = escapeHtml(raw);

  const blocks = [];

  safe = safe.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => {
    const idx = blocks.push(code) - 1;
    return `@@CODEBLOCK_${idx}@@`;
  });

  safe = safe
    .replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>')
    .replace(/^---$/gm, '<hr class="md-hr" />');

  safe = safe
    .replace(
      /^\s*\d+\.\s+(.+)$/gm,
      '<div class="md-item md-num"><span class="md-bullet">›</span><span>$1</span></div>'
    )
    .replace(
      /^\s*[-*]\s+(.+)$/gm,
      '<div class="md-item"><span class="md-bullet">•</span><span>$1</span></div>'
    );

  const chunks = safe.split(/\n{2,}/).filter(Boolean);

  const html = chunks
    .map((c) =>
      /^<h\d|^<hr|^<div class="md-item/.test(c.trim())
        ? c
        : `<p class="md-p">${c.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  return html.replace(/@@CODEBLOCK_(\d+)@@/g, (_, n) => {
    const code = blocks[Number(n)] ?? "";
    return `<div class="md-block"><pre><code>${code}</code></pre></div>`;
  });
}

export default function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const textareaRef = useRef(null);
  const lineNumsRef = useRef(null);

  const lines = code.split("\n").length;
  const chars = code.length;
  const lang = LANGUAGE_CONFIG[language];

  const notify = (message, type = "success") =>
    setToast({ message, type });

  const apiBase = useMemo(() => {
    return "http://127.0.0.1:8000";
  }, []);

  const reviewCode = async () => {
    if (!code.trim()) {
      notify("Paste some code first.", "error");
      return;
    }

    setLoading(true);
    setReview("");

    try {
      const res = await fetch(`${apiBase}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
        }),
      });

      const data = await res.json();

      console.log("SERVER RESPONSE:", data);

      if (!res.ok) {
        setReview(data.error || "Backend error occurred.");
        notify("Review failed.", "error");
        return;
      }

      // HANDLE MULTIPLE POSSIBLE RESPONSE KEYS
      const finalReview =
        data.review ||
        data.response ||
        data.result ||
        data.message ||
        "";

      if (!finalReview) {
        setReview(
          "Backend connected successfully but no review text was returned."
        );

        notify("Empty response from backend.", "error");
        return;
      }

      setReview(finalReview);

      notify("Review generated successfully!");
    } catch (err) {
      console.error(err);

      setReview(
        `Cannot connect to backend at ${apiBase}`
      );

      notify("Connection error.", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, label) => {
    if (!text) return;

    await navigator.clipboard.writeText(text);

    notify(`${label} copied!`);
  };

  const clearAll = () => {
    setCode("");
    setReview("");
    notify("Cleared.");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const s = e.target.selectionStart;
      const en = e.target.selectionEnd;

      const next =
        code.slice(0, s) +
        "  " +
        code.slice(en);

      setCode(next);

      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd =
            s + 2;
        }
      });
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      reviewCode();
    }
  };

  const handleEditorScroll = (e) => {
    if (!lineNumsRef.current) return;

    lineNumsRef.current.scrollTop =
      e.currentTarget.scrollTop;
  };

  return (
    <div className="app">

      {toast && (
        <Toast
          key={Date.now()}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="hdr">
        <div className="hdr-brand">
          <span className="brand-glyph">◈</span>
          <span className="brand-name">CodeSense</span>
          <span className="brand-tag">AI</span>
        </div>

        <span className="hdr-hint">
          Ctrl + Enter to review
        </span>
      </header>

      <div className="workspace">

        <div className="panel">

          <div className="panel-chrome">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />

            <span className="panel-filename">
              {lang.icon} editor.{lang.ext}
            </span>

            <div className="chrome-actions">

              <select
                className="lang-pick"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
              >
                {Object.entries(LANGUAGE_CONFIG).map(
                  ([l, v]) => (
                    <option key={l} value={l}>
                      {v.icon} {l}
                    </option>
                  )
                )}
              </select>

              <button
                className="cta-ghost"
                onClick={() =>
                  copyText(code, "Code")
                }
              >
                ⎘
              </button>

              <button
                className="cta-ghost cta-red"
                onClick={clearAll}
              >
                ✕
              </button>

            </div>
          </div>

          <div className="editor-wrap">

            <div
              className="line-nums"
              aria-hidden
              ref={lineNumsRef}
            >
              {Array.from(
                { length: lines },
                (_, i) => (
                  <span key={i}>{i + 1}</span>
                )
              )}
            </div>

            <textarea
              ref={textareaRef}
              className="code-area"
              spellCheck={false}
              placeholder={`// Paste your ${language} code here`}
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              onKeyDown={handleKeyDown}
              onScroll={handleEditorScroll}
            />

          </div>

          <div className="editor-bar">
            <span className="stat">{lines} ln</span>
            <span className="stat">{chars} ch</span>

            <span
              className="stat"
              style={{ color: lang.color }}
            >
              {lang.icon} {language}
            </span>
          </div>

        </div>

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
                <p>Analyzing code...</p>
              </div>
            ) : review ? (
              <div
                className="md-root"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(review),
                }}
              />
            ) : (
              <div className="state-empty">
                <div className="empty-glyph">◈</div>
                <p>AI review appears here</p>
              </div>
            )}

          </div>
        </div>

      </div>

      <div className="action-bar">

        <button
          className={`review-btn ${
            loading ? "is-loading" : ""
          }`}
          onClick={reviewCode}
          disabled={loading}
        >
          {loading ? "Reviewing..." : "Review Code"}
        </button>

      </div>

    </div>
  );
}