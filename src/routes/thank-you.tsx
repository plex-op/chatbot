import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

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

  // Prevent duplicate pixel firing
  const pixelFired = useRef(false);

  const search = Route.useSearch() as {
    firstName?: string;
    email?: string;
  };

  const firstName = search.firstName || "there";
  const email = search.email || "";

  // Entry animation
  useEffect(() => {
    if (!pixelFired.current && typeof window !== "undefined" && window.fbq) {
      // Standard Lead event
      window.fbq("track", "Lead", {
        content_name: "HAKA Media Form",
        status: "submitted",
      });

      // Custom SubmitApplication event
      window.fbq("track", "SubmitApplication");

      pixelFired.current = true;
    }
  }, []);

  // ✅ META PIXEL LEAD EVENT
  useEffect(() => {
    if (!pixelFired.current && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "Lead", {
        content_name: "HAKA Media Form",
        status: "submitted",
      });
      pixelFired.current = true;
    }
  }, []);

  // Countdown redirect
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
      {/* Top progress strip */}
      <div style={{ height: "1px", background: "#111", position: "relative", overflow: "hidden" }}>
        <div
          className="countdown-bar"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            background: "#FFFFFF",
            width: "100%",
            animation: "countShrink 10s linear forwards",
          }}
        />
      </div>

      {/* Header */}
      <header style={{ padding: "32px 40px", borderBottom: "1px solid #0e0e0e" }}>
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "18px",
            color: "#f2ede6",
            letterSpacing: "6px",
          }}
        >
          HAKA<span style={{ color: "#FFFFFF" }}>.</span>media
        </div>
      </header>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 40px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "48px",
            color: "#ede8e0",
          }}
        >
          Thank you,
          <br />
          <span style={{ color: "#FFFFFF" }}>{firstName}.</span>
        </h1>

        <p style={{ marginTop: "20px", color: "#555" }}>
          Our team will contact <span style={{ color: "#888" }}>{email}</span> within 24 hours.
        </p>

        <button
          onClick={() => navigate({ to: "/" })}
          style={{
            marginTop: "40px",
            borderBottom: "1px solid #2a2a2a",
            background: "transparent",
            color: "#444",
            cursor: "pointer",
          }}
        >
          Return to Home →
        </button>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #0e0e0e",
          padding: "12px 40px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "#1c1c1c" }}>Confidential · Strategy Consultation</span>
        <span style={{ color: "#222" }}>Redirecting in {countdown}s</span>
      </footer>
    </div>
  );
}
