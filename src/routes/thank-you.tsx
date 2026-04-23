import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  head: () => ({
    title: "Thank You — HAKA.media",
    meta: [
      {
        name: "description",
        content: "Thank you for your inquiry. Our team will be in touch shortly.",
      },
    ],
  }),
});

function ThankYouPage() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [visible, setVisible] = useState(false);

  const search = Route.useSearch() as {
    firstName?: string;
    email?: string;
  };

  const firstName = search.firstName || "there";
  const email = search.email || "";

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      navigate({ to: "/" });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#070707",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Jost', sans-serif",
        fontWeight: 300,
        color: "#c4c4c4",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes lineExpand {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        @keyframes countShrink {
          from { width: 100%; }
          to   { width: 0%; }
        }

        .fade-up-1 { animation: fadeUp 0.8s ease 0.1s both; }
        .fade-up-2 { animation: fadeUp 0.8s ease 0.35s both; }
        .fade-up-3 { animation: fadeUp 0.8s ease 0.6s both; }
        .fade-up-4 { animation: fadeUp 0.8s ease 0.85s both; }
        .fade-up-5 { animation: fadeUp 0.8s ease 1.1s both; }
        .fade-up-6 { animation: fadeUp 0.8s ease 1.35s both; }

        .line-expand {
          animation: lineExpand 1.2s cubic-bezier(0.4,0,0.2,1) 0.6s both;
          transform-origin: left center;
        }

        .back-btn {
          background: transparent;
          border: none;
          border-bottom: 1px solid #2a2a2a;
          color: #444;
          font-family: 'Jost', sans-serif;
          font-size: 9px;
          font-weight: 300;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 4px 0;
          transition: border-color 0.25s ease, color 0.25s ease;
        }
        .back-btn:hover {
          border-color: #D4AF6A;
          color: #D4AF6A;
        }

        .countdown-bar {
          animation: countShrink 10s linear 0s forwards;
        }
      `}</style>

      {/* Top progress strip */}
      <div style={{ height: "1px", background: "#111", position: "relative", overflow: "hidden" }}>
        <div
          className="countdown-bar"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "#D4AF6A",
            width: "100%",
          }}
        />
      </div>

      {/* Corner brackets */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          width: 40,
          height: 40,
          borderTop: "1px solid #1a1a1a",
          borderLeft: "1px solid #1a1a1a",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          width: 40,
          height: 40,
          borderTop: "1px solid #1a1a1a",
          borderRight: "1px solid #1a1a1a",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          width: 40,
          height: 40,
          borderBottom: "1px solid #1a1a1a",
          borderLeft: "1px solid #1a1a1a",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 40,
          height: 40,
          borderBottom: "1px solid #1a1a1a",
          borderRight: "1px solid #1a1a1a",
          pointerEvents: "none",
        }}
      />

      {/* Header wordmark */}
      <header
        className="fade-up-1"
        style={{ padding: "32px 40px", borderBottom: "1px solid #0e0e0e" }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#f2ede6",
            letterSpacing: "6px",
            textTransform: "uppercase",
          }}
        >
          HAKA<span style={{ color: "#D4AF6A", fontStyle: "italic" }}>.</span>media
        </div>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: "#252525",
            marginTop: "5px",
          }}
        >
          Filling the Digital Gap
        </div>
      </header>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
          textAlign: "center",
          maxWidth: "640px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Received label */}
        <div
          className="fade-up-1"
          style={{
            fontSize: "9px",
            letterSpacing: "4px",
            textTransform: "uppercase",
            color: "#D4AF6A",
            marginBottom: "32px",
          }}
        >
          Received in Confidence
        </div>

        {/* Decorative line */}
        <div
          className="line-expand"
          style={{
            width: "40px",
            height: "1px",
            background: "#2a2a2a",
            marginBottom: "36px",
          }}
        />

        {/* Headline */}
        <h1
          className="fade-up-2"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(36px, 6vw, 56px)",
            fontWeight: 300,
            color: "#ede8e0",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Thank you,
          <br />
          <span
            style={{
              fontStyle: "italic",
              fontWeight: 400,
              color: "#D4AF6A",
            }}
          >
            {firstName}.
          </span>
        </h1>

        {/* Body */}
        <p
          className="fade-up-3"
          style={{
            marginTop: "28px",
            fontSize: "14px",
            fontWeight: 300,
            color: "#555",
            lineHeight: 1.8,
            letterSpacing: "0.3px",
            maxWidth: "380px",
          }}
        >
          Your enquiry has been received. A strategist from HAKA.media will reach out to{" "}
          <span style={{ color: "#888", borderBottom: "1px solid #2a2a2a" }}>{email}</span> within
          24 hours to arrange your consultation.
        </p>

        {/* Divider row */}
        <div
          className="fade-up-4"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            margin: "40px 0",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#141414" }} />
          <div
            style={{
              width: "4px",
              height: "4px",
              background: "#D4AF6A",
              transform: "rotate(45deg)",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, height: "1px", background: "#141414" }} />
        </div>

        {/* What happens next */}
        <div
          className="fade-up-5"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            maxWidth: "360px",
            marginBottom: "48px",
          }}
        >
          {[
            { num: "01", label: "Confirmation email sent to your inbox" },
            { num: "02", label: "Strategist review within 24 hours" },
            { num: "03", label: "Strategy call scheduled at your convenience" },
          ].map(({ num, label }) => (
            <div
              key={num}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "16px",
                padding: "12px 0",
                borderBottom: "1px solid #0e0e0e",
              }}
            >
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "11px",
                  color: "#D4AF6A",
                  letterSpacing: "2px",
                  minWidth: "24px",
                  fontWeight: 400,
                }}
              >
                {num}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 300,
                  color: "#444",
                  letterSpacing: "0.3px",
                  textAlign: "left",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Back button */}
        <button className="fade-up-6 back-btn" onClick={() => navigate({ to: "/" })}>
          Return to Home &rarr;
        </button>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #0e0e0e",
          padding: "12px 40px 16px",
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
            color: "#1c1c1c",
          }}
        >
          Confidential · Strategy Consultation
        </span>
        <span style={{ fontSize: "9px", letterSpacing: "2px", color: "#222" }}>
          Redirecting in {countdown}s
        </span>
      </footer>
    </div>
  );
}
