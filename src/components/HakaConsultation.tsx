import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

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
  name: "What is your full name?",
  phone: "Your phone number?",
  email: "Your email address?",
  location: "Where are you based?",
  services: "Which services are you exploring?",
};

const STEP_ORDER: Step[] = ["name", "phone", "email", "location", "services", "summary"];

interface Message {
  id: number;
  type: "bot" | "user";
  text: string;
}

export function HakaConsultation() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("name");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
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
    pushBot(PROMPTS.name);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (step !== "services" && step !== "summary") inputRef.current?.focus();
  }, [step]);

  const advance = (value: string) => {
    pushUser(value);
    if (step === "name") {
      setData({ ...data, name: value });
      setStep("phone");
      pushBot(PROMPTS.phone);
    } else if (step === "phone") {
      setData({ ...data, phone: value });
      setStep("email");
      pushBot(PROMPTS.email);
    } else if (step === "email") {
      setData({ ...data, email: value });
      setStep("location");
      pushBot(PROMPTS.location);
    } else if (step === "location") {
      setData({ ...data, location: value });
      setStep("services");
      pushBot(PROMPTS.services);
    }
  };

  const confirmServices = () => {
    if (!selected.length) return;
    pushUser(selected.join(" · "));
    setData((d) => ({ ...d, services: selected }));
    setTimeout(() => {
      pushBot("Here is a summary of your enquiry.");
      setStep("summary");
    }, 400);
  };

  const finish = () => {
    const firstName = data.name.split(" ")[0] || "";
    navigate({ to: "/thank-you", search: { firstName, email: data.email } });
  };

  const stepIndex = STEP_ORDER.indexOf(step);
  const progress = (stepIndex / (STEP_ORDER.length - 1)) * 100;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#070707",
        color: "#c4c4c4",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .haka-scrollbar::-webkit-scrollbar { width: 0px; }

        .haka-input::placeholder { color: #2e2e2e; letter-spacing: 0.5px; }
        .haka-input:focus { outline: none; }

        .haka-service-btn {
          background: transparent;
          border: 1px solid #1e1e1e;
          color: #606060;
          padding: 9px 16px;
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 300;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
        }
        .haka-service-btn:hover {
          border-color: #555;
          color: #b0b0b0;
        }
        .haka-service-btn.active {
          border-color: #b89c6e;
          color: #b89c6e;
          background: rgba(184,156,110,0.05);
        }

        .haka-confirm-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #b89c6e;
          color: #b89c6e;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 4px 0;
          transition: opacity 0.2s ease;
        }
        .haka-confirm-btn:hover { opacity: 0.7; }
        .haka-confirm-btn:disabled { opacity: 0.2; cursor: not-allowed; }

        .haka-finish-btn {
          background: #b89c6e;
          border: none;
          color: #070707;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 3px;
          text-transform: uppercase;
          padding: 14px 32px;
          cursor: pointer;
          transition: opacity 0.2s ease;
          width: 100%;
          margin-top: 8px;
        }
        .haka-finish-btn:hover { opacity: 0.85; }

        @keyframes msgRise {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .haka-msg { animation: msgRise 0.45s ease forwards; }

        @keyframes dotPulse {
          0%,80%,100% { transform: scale(1); opacity: 0.3; }
          40%          { transform: scale(1.5); opacity: 1; }
        }
        .typing-dot { animation: dotPulse 1.4s infinite ease-in-out; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>

      {/* ── PROGRESS STRIP ── */}
      <div style={{ height: "1px", background: "#111", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${progress}%`,
            background: "#b89c6e",
            transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>

      {/* ── HEADER ── */}
      <header
        style={{
          borderBottom: "1px solid #131313",
          padding: "28px 40px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {/* Logo */}
        <div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "26px",
              fontWeight: 400,
              color: "#f2ede6",
              letterSpacing: "6px",
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            HAKA<span style={{ color: "#b89c6e", fontStyle: "italic" }}>.</span>media
          </div>
          <div
            style={{
              marginTop: "6px",
              fontSize: "9px",
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              color: "#333",
              fontWeight: 300,
            }}
          >
            Filling the Digital Gap
          </div>
        </div>

        {/* Step counter */}
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "#333",
              marginBottom: "4px",
            }}
          >
            Step
          </div>
          <div
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "22px",
              fontWeight: 300,
              color: "#666",
            }}
          >
            {stepIndex + 1}
            <span style={{ fontSize: "14px", color: "#2e2e2e", margin: "0 4px" }}>/</span>
            <span style={{ fontSize: "14px", color: "#2e2e2e" }}>{STEP_ORDER.length}</span>
          </div>
        </div>
      </header>

      {/* Step pip row */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "0 40px",
          borderBottom: "1px solid #0e0e0e",
        }}
      >
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: "2px",
              background: i < stepIndex ? "#3a3a3a" : i === stepIndex ? "#b89c6e" : "#141414",
              transition: "background 0.4s ease",
              marginBottom: "-1px",
            }}
          />
        ))}
      </div>

      {/* ── CHAT AREA ── */}
      <div
        ref={chatRef}
        className="haka-scrollbar"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "40px 40px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          minHeight: "360px",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className="haka-msg"
            style={{ textAlign: m.type === "user" ? "right" : "left" }}
          >
            {m.type === "bot" ? (
              <>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  HAKA.media
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "22px",
                    fontWeight: 300,
                    color: "#d8d0c4",
                    lineHeight: 1.45,
                    maxWidth: "480px",
                  }}
                >
                  {m.text}
                </p>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: "#333",
                    marginBottom: "8px",
                  }}
                >
                  You
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 300,
                    color: "#888",
                    letterSpacing: "0.3px",
                    lineHeight: 1.6,
                  }}
                >
                  {m.text}
                </p>
              </>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div className="haka-msg">
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#333",
                marginBottom: "10px",
              }}
            >
              HAKA.media
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center", paddingTop: "4px" }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="typing-dot"
                  style={{
                    width: "4px",
                    height: "4px",
                    background: "#444",
                    borderRadius: "50%",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── SERVICE SELECTOR ── */}
        {step === "services" && (
          <div
            className="haka-msg"
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SERVICES.map((s) => (
                <button
                  key={s}
                  className={`haka-service-btn${selected.includes(s) ? " active" : ""}`}
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
              className="haka-confirm-btn"
              style={{ alignSelf: "flex-start" }}
              onClick={confirmServices}
              disabled={!selected.length}
            >
              Confirm Selection &rarr;
            </button>
          </div>
        )}

        {/* ── SUMMARY ── */}
        {step === "summary" && (
          <div
            className="haka-msg"
            style={{
              border: "1px solid #191919",
              padding: "28px 32px",
              maxWidth: "480px",
            }}
          >
            {/* Corner accents */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: -28,
                  left: -32,
                  width: 16,
                  height: 16,
                  borderTop: "1px solid #3a3a3a",
                  borderLeft: "1px solid #3a3a3a",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -28,
                  right: -32,
                  width: 16,
                  height: 16,
                  borderTop: "1px solid #3a3a3a",
                  borderRight: "1px solid #3a3a3a",
                }}
              />
            </div>

            <div
              style={{
                fontSize: "9px",
                letterSpacing: "3.5px",
                textTransform: "uppercase",
                color: "#b89c6e",
                marginBottom: "22px",
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
                  gap: "16px",
                  padding: "10px 0",
                  borderBottom: "1px solid #111",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "2.5px",
                    textTransform: "uppercase",
                    color: "#333",
                    minWidth: "68px",
                  }}
                >
                  {label}
                </span>
                <span style={{ fontSize: "14px", color: "#aaa", fontWeight: 300 }}>{value}</span>
              </div>
            ))}

            <div style={{ padding: "10px 0", borderBottom: "1px solid #111" }}>
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: "2.5px",
                  textTransform: "uppercase",
                  color: "#333",
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
                      border: "1px solid #222",
                      color: "#666",
                      fontSize: "9.5px",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <button className="haka-finish-btn" onClick={finish}>
              Confirm &amp; Connect
            </button>
          </div>
        )}
      </div>

      {/* ── INPUT BAR ── */}
      {step !== "services" && step !== "summary" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!input.trim()) return;
            advance(input);
            setInput("");
          }}
          style={{
            borderTop: "1px solid #111",
            padding: "18px 40px 24px",
            background: "#070707",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 0,
              borderBottom: "1px solid #1e1e1e",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3a3a3a")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#1e1e1e")}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your reply..."
              className="haka-input"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                color: "#d0d0d0",
                fontFamily: "'Jost', sans-serif",
                fontSize: "14px",
                fontWeight: 300,
                letterSpacing: "0.3px",
                padding: "12px 0",
              }}
            />
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px 0 8px 16px",
                color: "#333",
                fontSize: "10px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                fontFamily: "'Jost', sans-serif",
                fontWeight: 300,
                transition: "color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#b89c6e")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#333")}
            >
              Send &rarr;
            </button>
          </div>
        </form>
      )}

      {/* ── FOOTER ── */}
      <div
        style={{
          borderTop: "1px solid #0e0e0e",
          padding: "10px 40px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: "#1e1e1e",
          }}
        >
          Confidential · Strategy Consultation
        </span>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontSize: "11px",
            color: "#1e1e1e",
          }}
        >
          haka.media
        </span>
      </div>
    </div>
  );
}
