import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/thank-you")({
  component: ThankYouPage,
  head: () => ({
    meta: [
      { title: "Thank You — HAKA.media" },
      {
        name: "description",
        content: "Thank you for your inquiry. Our team will be in touch shortly.",
      },
    ],
  }),
});

function ThankYouPage() {
  const search = Route.useSearch() as { firstName?: string; email?: string };
  const firstName = search.firstName || "there";
  const email = search.email || "";

  useEffect(() => {
    // Redirect to home after 10 seconds
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.08_75/8%)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.78_0.08_75/4%)_0%,_transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1280px] flex-col items-center justify-center px-8 lg:px-14">
        <div className="flex flex-col items-center justify-center text-center animate-fade-up">
          <div className="divider-ornament mb-10 w-full max-w-sm">
            <span className="text-gold">✦</span>
          </div>
          <p className="text-[10px] uppercase tracking-luxe text-gold mb-6">
            Received in Confidence
          </p>
          <h2 className="font-serif text-5xl font-light tracking-wide leading-tight">
            Thank you,
            <br />
            <span className="text-gold italic">{firstName}</span>
          </h2>
          <div className="mt-10 h-px w-16 bg-gold/60" />
          <p className="mt-10 max-w-md font-serif text-2xl leading-relaxed font-light italic text-foreground/80">
            Your enquiry has been entrusted to our atelier.
          </p>
          <p className="mt-6 max-w-md text-sm leading-loose text-muted-foreground font-light">
            A strategist from HAKA.media shall reach out to{" "}
            <span className="text-gold">{email}</span> within four-and-twenty hours to arrange your
            private consultation.
          </p>
          <div className="divider-ornament mt-14 w-full max-w-sm">
            <span className="text-gold text-xs">✦</span>
          </div>

          <div className="mt-12 flex gap-6">
            <a
              href="/"
              className="group flex items-center gap-3 border-b border-gold/60 pb-1.5 text-[10px] uppercase tracking-luxe text-gold transition-all duration-300 hover:border-gold"
            >
              Back to Home
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </a>
          </div>

          <p className="mt-12 text-[9px] uppercase tracking-luxe text-muted-foreground/50">
            Haka.media · Maison of Digital Craft
          </p>
          <p className="mt-4 text-[8px] uppercase tracking-luxe text-muted-foreground/30">
            Redirecting to home in 10 seconds...
          </p>
        </div>
      </div>
    </div>
  );
}
