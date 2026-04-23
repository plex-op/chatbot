import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

// ─────────────────────────────────────────────────────────
//  FORMSPREE SETUP
//  1. Go to https://formspree.io → New Form → give it a name
//  2. Copy your form endpoint — it looks like:
//     https://formspree.io/f/xxxxxxxo
//  3. Paste it below
// ─────────────────────────────────────────────────────────
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xlgaoyro";

type Step = "name" | "phone" | "email" | "location" | "services" | "summary" | "done";

interface FormData {
  name: string;
  phone: string;
  email: string;
  location: string;
  services: string[];
}

const SERVICES = [
  "Digital Marketing",
  "Website Development",
  "App Development",
  "Photography & Videography",
  "Performance Marketing",
  "Social Media Management",
  "Video Editing",
  "Personal Branding",
];

const PROMPTS: Record<Exclude<Step, "summary" | "done">, string> = {
  name: "May we begin with your full name?",
  phone: "Your phone number, please?",
  email: "And your email address?",
  location: "Where in the world are you based?",
  services: "Which of our ateliers interest you?",
};

const STEP_ORDER: Step[] = ["name", "phone", "email", "location", "services", "summary"];

const ATELIER_LEFT = ["Strategy", "Development", "Performance"];
const ATELIER_RIGHT = ["Design", "Cinematography", "Storytelling"];

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
}

// ── Formspree submission ──────────────────────────────────
async function submitToFormspree(formData: FormData): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        services: formData.services.join(", "),
        // Formspree uses _replyto to set the reply-to address in email notifications
        _replyto: formData.email,
        // Custom subject line in the notification email
        _subject: `New Strategy Call Enquiry — ${formData.name}`,
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

export function HakaConsultation() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("name");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [data, setData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    location: "",
    services: [],
  });

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);
  const didInit = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const pushBot = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      idRef.current++;
      setMessages((m) => [...m, { id: idRef.current, type: "bot", text }]);
    }, 900);
  };

  const pushUser = (text: string) => {
    idRef.current++;
    setMessages((m) => [...m, { id: idRef.current, type: "user", text }]);
  };

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    setTimeout(() => pushBot(PROMPTS.name), 400);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, submitting]);

  useEffect(() => {
    if (step !== "services" && step !== "summary") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [step]);

  const advance = (value: string) => {
    pushUser(value);
    const next: Partial<Record<Step, Step>> = {
      name: "phone",
      phone: "email",
      email: "location",
      location: "services",
    };
    const nextStep = next[step];
    if (nextStep) {
      setData((d) => ({ ...d, [step]: value }));
      setStep(nextStep);
      pushBot(PROMPTS[nextStep as Exclude<Step, "summary" | "done">]);
    }
  };

  const confirmServices = () => {
    if (!selected.length) return;
    pushUser(selected.join(" · "));
    setData((d) => ({ ...d, services: selected }));
    setTimeout(() => {
      pushBot("A perfect brief. Allow us to present your summary.");
      setStep("summary");
    }, 400);
  };

  // ── Submit to Formspree, then navigate ──────────────────
  const finish = async (finalData: FormData) => {
    setSubmitting(true);
    setSubmitError(false);

    const { ok } = await submitToFormspree(finalData);

    setSubmitting(false);

    if (!ok) {
      setSubmitError(true);
      return;
    }

    const firstName = finalData.name.split(" ")[0] || "";
    navigate({ to: "/thank-you", search: { firstName, email: finalData.email } });
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const chapterNum = String(stepIndex + 1).padStart(2, "0");
  const totalNum = String(STEP_ORDER.length).padStart(2, "0");

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        background: "#0a0906",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
        color: "#c4c4c4",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        .no-scroll::-webkit-scrollbar { display: none; }
        .no-scroll { scrollbar-width: none; }

        @keyframes msgRise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-rise { animation: msgRise 0.5s ease forwards; }

        @keyframes dotPulse {
          0%,80%,100% { opacity: 0.25; transform: scale(1); }
          40%          { opacity: 1; transform: scale(1.4); }
        }
        .tdot { animation: dotPulse 1.4s infinite ease-in-out; }
        .tdot:nth-child(2) { animation-delay: 0.2s; }
        .tdot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 12px; height: 12px;
          border: 1px solid #3a3020;
          border-top-color: #b89c6e;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }

        .svc-btn {
          background: transparent;
          border: 1px solid #1e1b17;
          color: #4a4640;
          padding: 8px 12px;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .svc-btn:hover { border-color: #3a3630; color: #888; }
        .svc-btn.on { border-color: #b89c6e; color: #b89c6e; background: rgba(184,156,110,0.04); }

        .confirm-btn {
          background: none;
          border: none;
          border-bottom: 1px solid #b89c6e;
          color: #b89c6e;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 3px 0;
          transition: opacity 0.2s;
        }
        .confirm-btn:hover { opacity: 0.65; }
        .confirm-btn:disabled { opacity: 0.18; cursor: default; }

        .finish-btn {
          background: #b89c6e;
          border: none;
          color: #0a0906;
          font-family: 'Jost', sans-serif;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 4px;
          text-transform: uppercase;
          padding: 14px 0;
          cursor: pointer;
          width: 100%;
          margin-top: 10px;
          transition: opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .finish-btn:hover:not(:disabled) { opacity: 0.82; }
        .finish-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .input-field {
          background: transparent;
          border: none;
          outline: none;
          color: #c8c0b4;
          font-family: 'Cormorant Garamond', serif;
          font-size: max(16px, 18px);
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.5px;
          flex: 1;
          padding: 0;
          width: 100%;
        }
        .input-field::placeholder { color: #2a2620; font-style: italic; }

        .send-btn {
          background: transparent;
          border: none;
          color: #2a2620;
          font-family: 'Jost', sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 3.5px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .send-btn:hover { color: #b89c6e; }

        .atelier-item {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #2a2620;
          line-height: 2.4;
          transition: color 0.2s;
        }
        .atelier-item:hover { color: #5a5040; }
      `}</style>

      {/* ═══════════════════════════════
          LEFT / MOBILE HEADER
      ═══════════════════════════════ */}
      {isMobile ? (
        <div
          style={{
            borderBottom: "1px solid #131008",
            padding: "20px 24px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "24px",
                fontWeight: 400,
                color: "#ede5d8",
                letterSpacing: "1px",
                lineHeight: 1,
              }}
            >
              Haka<span style={{ color: "#b89c6e" }}>.</span>media
            </div>
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#2a2418",
                marginTop: "4px",
              }}
            >
              Private Consultation
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#2a2418",
                marginBottom: "3px",
              }}
            >
              Chapter
            </div>
            <div
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px",
                fontWeight: 300,
                color: "#4a4030",
                lineHeight: 1,
              }}
            >
              {chapterNum}
              <span style={{ fontSize: "13px", color: "#2a2018", margin: "0 4px" }}>/</span>
              <span style={{ fontSize: "13px", color: "#2a2018" }}>{totalNum}</span>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            width: "38%",
            minHeight: "100vh",
            borderRight: "1px solid #131008",
            display: "flex",
            flexDirection: "column",
            padding: "36px 40px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#3a3428",
              marginBottom: "10px",
            }}
          >
            Maison
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(32px, 3.5vw, 48px)",
              fontWeight: 400,
              color: "#ede5d8",
              lineHeight: 1.05,
              letterSpacing: "1px",
            }}
          >
            Haka<span style={{ color: "#b89c6e" }}>.</span>media
          </div>
          <div
            style={{ width: "36px", height: "1px", background: "#2a2418", margin: "18px 0 0" }}
          />
          <div style={{ marginTop: "auto", paddingBottom: "28px" }}>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(20px, 2vw, 26px)",
                fontWeight: 300,
                fontStyle: "italic",
                color: "#6a6050",
                lineHeight: 1.45,
                maxWidth: "300px",
              }}
            >
              "We don't build campaigns.
              <br />
              We compose <span style={{ color: "#b89c6e" }}>legacies.</span>"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "24px" }}>
              <div style={{ width: "40px", height: "1px", background: "#2a2418" }} />
              <span
                style={{
                  fontSize: "8px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#2a2418",
                }}
              >
                The House of Haka
              </span>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #131008", paddingTop: "22px" }}>
            <div
              style={{
                fontSize: "8px",
                letterSpacing: "4px",
                textTransform: "uppercase",
                color: "#1e1a14",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              Atelier
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1 }}>
                {ATELIER_LEFT.map((a) => (
                  <div key={a} className="atelier-item">
                    {a}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                {ATELIER_RIGHT.map((a) => (
                  <div key={a} className="atelier-item">
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
              paddingTop: "14px",
              borderTop: "1px solid #131008",
            }}
          >
            <span
              style={{
                fontSize: "8px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                color: "#1a1610",
              }}
            >
              Established Excellence
            </span>
            <span style={{ fontSize: "8px", letterSpacing: "2px", color: "#1a1610" }}>MMXXIV</span>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════
          RIGHT PANEL — conversation
      ═══════════════════════════════ */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: isMobile ? 0 : "100vh",
          overflow: isMobile ? "hidden" : undefined,
        }}
      >
        {/* Desktop right header */}
        {!isMobile && (
          <div
            style={{
              borderBottom: "1px solid #131008",
              padding: "36px 48px 28px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#b89c6e",
                  marginBottom: "6px",
                }}
              >
                Private Consultation
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "13px",
                  fontStyle: "italic",
                  color: "#3a3020",
                }}
              >
                By invitation · In confidence
              </div>
              <div
                style={{ width: "40px", height: "1px", background: "#1a1610", marginTop: "14px" }}
              />
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: "8px",
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  color: "#2a2418",
                  marginBottom: "5px",
                }}
              >
                Chapter
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "30px",
                  fontWeight: 300,
                  color: "#4a4030",
                  lineHeight: 1,
                }}
              >
                {chapterNum}
                <span style={{ fontSize: "16px", color: "#2a2018", margin: "0 6px" }}>/</span>
                <span style={{ fontSize: "16px", color: "#2a2018" }}>{totalNum}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step pips */}
        <div
          style={{
            display: "flex",
            padding: isMobile ? "0 24px" : "0 48px",
            gap: "3px",
            borderBottom: "1px solid #0e0c08",
            flexShrink: 0,
          }}
        >
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: "2px",
                background: i < stepIndex ? "#2e2820" : i === stepIndex ? "#b89c6e" : "#131008",
                transition: "background 0.5s ease",
                marginBottom: "-1px",
              }}
            />
          ))}
        </div>

        {/* Chat area */}
        <div
          ref={chatRef}
          className="no-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "28px 24px 16px" : "44px 48px 24px",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? "24px" : "32px",
          }}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className="msg-rise"
              style={{ textAlign: m.type === "user" ? "right" : "left" }}
            >
              {m.type === "bot" ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        background: "#b89c6e",
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "8px",
                        letterSpacing: "3.5px",
                        textTransform: "uppercase",
                        color: "#3a3020",
                      }}
                    >
                      Haka
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: isMobile ? "24px" : "clamp(22px, 2.4vw, 30px)",
                      fontWeight: 300,
                      color: "#d0c8bc",
                      lineHeight: 1.35,
                      maxWidth: isMobile ? "100%" : "500px",
                    }}
                  >
                    {m.text}
                  </p>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      fontSize: "8px",
                      letterSpacing: "3.5px",
                      textTransform: "uppercase",
                      color: "#2a2418",
                      marginBottom: "7px",
                    }}
                  >
                    You
                  </div>
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "16px",
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: "#5a5040",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.text}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="msg-rise">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "#b89c6e",
                  }}
                />
                <span
                  style={{
                    fontSize: "8px",
                    letterSpacing: "3.5px",
                    textTransform: "uppercase",
                    color: "#3a3020",
                  }}
                >
                  Haka
                </span>
              </div>
              <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="tdot"
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#3a3020",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Service selector */}
          {step === "services" && (
            <div
              className="msg-rise"
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {SERVICES.map((s) => (
                  <button
                    key={s}
                    className={`svc-btn${selected.includes(s) ? " on" : ""}`}
                    onClick={() =>
                      setSelected((prev) =>
                        prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                      )
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button
                className="confirm-btn"
                onClick={confirmServices}
                disabled={!selected.length}
                style={{ alignSelf: "flex-start" }}
              >
                Confirm Selection &rarr;
              </button>
            </div>
          )}

          {/* Summary */}
          {step === "summary" && (
            <div
              className="msg-rise"
              style={{
                border: "1px solid #181410",
                padding: isMobile ? "22px 20px" : "28px 32px",
                maxWidth: isMobile ? "100%" : "460px",
                position: "relative",
              }}
            >
              {/* Corner brackets */}
              {(
                [
                  {
                    top: -1,
                    left: -1,
                    borderTop: "1px solid #3a3020",
                    borderLeft: "1px solid #3a3020",
                  },
                  {
                    top: -1,
                    right: -1,
                    borderTop: "1px solid #3a3020",
                    borderRight: "1px solid #3a3020",
                  },
                  {
                    bottom: -1,
                    left: -1,
                    borderBottom: "1px solid #3a3020",
                    borderLeft: "1px solid #3a3020",
                  },
                  {
                    bottom: -1,
                    right: -1,
                    borderBottom: "1px solid #3a3020",
                    borderRight: "1px solid #3a3020",
                  },
                ] as React.CSSProperties[]
              ).map((s, i) => (
                <div key={i} style={{ position: "absolute", width: 14, height: 14, ...s }} />
              ))}

              <div
                style={{
                  fontSize: "8px",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  color: "#b89c6e",
                  marginBottom: "20px",
                }}
              >
                Enquiry Summary
              </div>

              {[
                { label: "Name", value: data.name },
                { label: "Phone", value: data.phone },
                { label: "Email", value: data.email },
                { label: "Location", value: data.location },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "12px",
                    padding: "9px 0",
                    borderBottom: "1px solid #0e0c08",
                  }}
                >
                  <span
                    style={{
                      fontSize: "8px",
                      letterSpacing: "2.5px",
                      textTransform: "uppercase",
                      color: "#2e2820",
                      minWidth: "58px",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "15px",
                      fontWeight: 300,
                      color: "#9a9080",
                      wordBreak: "break-all",
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}

              <div style={{ padding: "10px 0", borderBottom: "1px solid #0e0c08" }}>
                <div
                  style={{
                    fontSize: "8px",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "#2e2820",
                    marginBottom: "10px",
                  }}
                >
                  Services
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {data.services.map((s) => (
                    <span
                      key={s}
                      style={{
                        border: "1px solid #1e1a14",
                        color: "#4a4030",
                        fontSize: "8px",
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        padding: "4px 10px",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Error message */}
              {submitError && (
                <div
                  style={{
                    marginTop: "12px",
                    fontSize: "10px",
                    letterSpacing: "1.5px",
                    color: "#8a4a3a",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  Submission failed — please try again or email us directly.
                </div>
              )}

              {/* Confirm & Connect button */}
              <button className="finish-btn" onClick={() => finish(data)} disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      className="spinner"
                      style={{ borderColor: "#3a2e1e", borderTopColor: "#0a0906" }}
                    />
                    Sending...
                  </>
                ) : submitError ? (
                  "Retry →"
                ) : (
                  "Confirm & Connect"
                )}
              </button>
            </div>
          )}

          <div style={{ height: "8px", flexShrink: 0 }} />
        </div>

        {/* Input bar */}
        {step !== "services" && step !== "summary" && (
          <div
            style={{
              borderTop: "1px solid #0e0c08",
              padding: isMobile ? "0 24px" : "0 48px",
              flexShrink: 0,
              background: "#0a0906",
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!input.trim()) return;
                advance(input);
                setInput("");
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "18px 0 16px",
                  borderBottom: "1px solid #131008",
                }}
              >
                <span
                  style={{
                    color: "#2e2820",
                    fontSize: "16px",
                    fontFamily: "'Cormorant Garamond', serif",
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  ›
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Compose your reply..."
                  className="input-field"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <button type="submit" className="send-btn">
                  Send &rarr;
                </button>
              </div>
              {!isMobile && (
                <div style={{ padding: "8px 0 12px" }}>
                  <span
                    style={{
                      fontSize: "8px",
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#1a1610",
                    }}
                  >
                    Press Enter to Continue
                  </span>
                </div>
              )}
            </form>
          </div>
        )}

        {isMobile && (
          <div
            style={{
              height: "env(safe-area-inset-bottom, 0px)",
              background: "#0a0906",
              flexShrink: 0,
            }}
          />
        )}
      </div>
    </div>
  );
}
