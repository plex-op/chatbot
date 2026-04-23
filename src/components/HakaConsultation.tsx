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
  name: "Can I have your name?",
  phone: "Your phone number?",
  email: "Your email address?",
  location: "Where are you located?",
  services: "Which services are you looking for?",
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
  const [data, setData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    location: "",
    services: [],
  });
  const [selected, setSelected] = useState<string[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  const pushBot = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      idRef.current += 1;
      setMessages((m) => [...m, { id: idRef.current, type: "bot", text }]);
    }, 1100);
  };

  const pushUser = (text: string) => {
    idRef.current += 1;
    setMessages((m) => [...m, { id: idRef.current, type: "user", text }]);
  };

  useEffect(() => {
    pushBot(PROMPTS.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing, step]);

  useEffect(() => {
    if (step !== "services" && step !== "summary" && step !== "done") {
      inputRef.current?.focus();
    }
  }, [step]);

  const advance = (current: Step, value: string) => {
    pushUser(value);
    const next: Record<Step, Step> = {
      name: "phone",
      phone: "email",
      email: "location",
      location: "services",
      services: "summary",
      summary: "done",
      done: "done",
    };
    const nextStep = next[current];
    setData((d) => ({ ...d, [current]: value }));
    setStep(nextStep);
    if (nextStep !== "summary" && nextStep !== "done") {
      pushBot(PROMPTS[nextStep as keyof typeof PROMPTS]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    if (step === "name" || step === "phone" || step === "email" || step === "location") {
      advance(step, value);
      setInput("");
    }
  };

  const toggleService = (s: string) => {
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const confirmServices = () => {
    if (selected.length === 0) return;
    pushUser(selected.join(" · "));
    setData((d) => ({ ...d, services: selected }));
    setStep("summary");
  };

  const finish = () => {
    const firstName = data.name.split(" ")[0] || "";
    navigate({
      to: "/thank-you",
      search: {
        firstName,
        email: data.email,
      },
    });
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.78_0.08_75/8%)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_oklch(0.78_0.08_75/4%)_0%,_transparent_60%)]" />
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1280px] grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
        {/* Left: Editorial panel */}
        <aside className="relative hidden flex-col justify-between border-r border-border/40 px-12 py-14 lg:flex">
          <div className="animate-fade-in">
            <div className="mb-2 text-[10px] uppercase tracking-luxe text-gold">Maison</div>
            <h1 className="font-serif text-4xl font-light leading-none tracking-wide">
              Haka<span className="text-gold">.</span>media
            </h1>
            <div className="mt-5 h-px w-16 bg-gradient-to-r from-gold to-transparent" />
          </div>

          <div className="animate-fade-up max-w-sm">
            <p className="font-serif text-3xl font-light italic leading-relaxed text-foreground/90">
              "We don't build campaigns.
              <br />
              We compose <span className="text-gold">legacies</span>."
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-px w-10 bg-gold/60" />
              <span className="text-[10px] uppercase tracking-luxe text-muted-foreground">
                The House of Haka
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="divider-ornament">
              <span className="text-[9px] uppercase tracking-luxe">Atelier</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] uppercase tracking-refined text-muted-foreground/80">
              <span>Strategy</span>
              <span>Design</span>
              <span>Development</span>
              <span>Cinematography</span>
              <span>Performance</span>
              <span>Storytelling</span>
            </div>
            <p className="pt-4 text-[9px] uppercase tracking-luxe text-muted-foreground/50">
              Established Excellence · MMXXIV
            </p>
          </div>
        </aside>

        {/* Right: Consultation */}
        <main className="relative flex h-screen flex-col">
          {/* Header with progress */}
          <header className="border-b border-border/40 px-8 py-7 lg:px-14 lg:py-8 animate-fade-in">
            <div className="flex items-center justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-luxe text-gold">
                  Private Consultation
                </p>
                <p className="mt-1.5 font-serif text-base font-light italic text-muted-foreground">
                  By invitation · In confidence
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-luxe text-muted-foreground">Chapter</p>
                <p className="mt-1 font-serif text-2xl font-light text-foreground">
                  <span className="text-gold">
                    {String(Math.min(stepIndex + 1, STEP_ORDER.length)).padStart(2, "0")}
                  </span>
                  <span className="mx-1 text-muted-foreground/50">/</span>
                  <span className="text-muted-foreground">
                    {String(STEP_ORDER.length).padStart(2, "0")}
                  </span>
                </p>
              </div>
            </div>

            {/* Progress filaments */}
            <div className="mt-6 flex gap-1.5">
              {STEP_ORDER.map((s, i) => (
                <div
                  key={s}
                  className={`h-px flex-1 transition-all duration-700 ${
                    i <= stepIndex ? "bg-gold" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </header>

          {/* Chat */}
          <div ref={chatRef} className="flex-1 overflow-y-auto px-8 py-12 lg:px-14">
            <div className="flex flex-col gap-8">
              {messages.map((m) =>
                m.type === "bot" ? (
                  <div key={m.id} className="animate-fade-up max-w-[92%]">
                    <div className="mb-2.5 flex items-center gap-2.5">
                      <span className="h-1 w-1 rounded-full bg-gold" />
                      <span className="text-[9px] uppercase tracking-luxe text-gold/80">Haka</span>
                    </div>
                    <p className="font-serif text-[26px] leading-[1.4] font-light text-foreground">
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="animate-fade-up self-end max-w-[80%]">
                    <div className="mb-2 flex items-center justify-end gap-2.5">
                      <span className="text-[9px] uppercase tracking-luxe text-muted-foreground/60">
                        You
                      </span>
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                    </div>
                    <p className="text-right font-serif text-xl font-light italic text-foreground/70">
                      {m.text}
                    </p>
                  </div>
                ),
              )}

              {typing && (
                <div className="animate-fade-in">
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <span className="h-1 w-1 rounded-full bg-gold" />
                    <span className="text-[9px] uppercase tracking-luxe text-gold/80">Haka</span>
                  </div>
                  <div className="flex gap-1.5 py-1">
                    <span className="dot-shimmer h-1.5 w-1.5 rounded-full bg-gold" />
                    <span
                      className="dot-shimmer h-1.5 w-1.5 rounded-full bg-gold"
                      style={{ animationDelay: "-0.32s" }}
                    />
                    <span
                      className="dot-shimmer h-1.5 w-1.5 rounded-full bg-gold"
                      style={{ animationDelay: "-0.16s" }}
                    />
                  </div>
                </div>
              )}

              {step === "services" && !typing && (
                <div className="animate-fade-up mt-3 space-y-6">
                  <div className="flex flex-wrap gap-2.5">
                    {SERVICES.map((s) => {
                      const isSel = selected.includes(s);
                      return (
                        <button
                          key={s}
                          onClick={() => toggleService(s)}
                          className={`group relative overflow-hidden rounded-full border px-5 py-2.5 text-[10.5px] uppercase tracking-refined font-light transition-all duration-500 ${
                            isSel
                              ? "border-gold bg-gold text-primary-foreground shadow-glow"
                              : "border-border/60 text-foreground/70 hover:border-gold/60 hover:text-foreground"
                          }`}
                        >
                          <span className="relative z-10 flex items-center gap-2">
                            {isSel && <span className="text-[8px]">✦</span>}
                            {s}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between border-t border-border/30 pt-5">
                    <p className="text-[10px] uppercase tracking-luxe text-muted-foreground">
                      {selected.length} selected
                    </p>
                    <button
                      onClick={confirmServices}
                      disabled={selected.length === 0}
                      className="group flex items-center gap-3 border-b border-gold/60 pb-1.5 text-[10px] uppercase tracking-luxe text-gold transition-all duration-300 hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Confirm Selection
                      <span className="transition-transform duration-500 group-hover:translate-x-1">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {step === "summary" && <SummaryCard data={data} onFinish={finish} />}
            </div>
          </div>

          {/* Input */}
          {step !== "services" && step !== "summary" && (
            <form
              onSubmit={handleSubmit}
              className="border-t border-border/40 bg-background/60 px-8 py-7 lg:px-14 animate-fade-in backdrop-blur-sm"
            >
              <div className="group flex items-center gap-4 border-b border-border/60 pb-3 transition-colors duration-300 focus-within:border-gold">
                <span className="font-serif text-2xl font-light text-gold">›</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Compose your reply…"
                  className="w-full bg-transparent font-serif text-xl font-light tracking-wide text-foreground placeholder:font-serif placeholder:italic placeholder:text-muted-foreground/40 outline-none"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex shrink-0 items-center gap-2 text-[10px] uppercase tracking-luxe text-muted-foreground transition-all duration-300 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Send
                  <span>↵</span>
                </button>
              </div>
              <p className="mt-3 text-[9px] uppercase tracking-luxe text-muted-foreground/40">
                Press enter to continue
              </p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

function SummaryCard({ data, onFinish }: { data: FormData; onFinish: () => void }) {
  const rows: { label: string; value: string }[] = [
    { label: "Name", value: data.name },
    { label: "Telephone", value: data.phone },
    { label: "Correspondence", value: data.email },
    { label: "Location", value: data.location },
    { label: "Services", value: data.services.join(" · ") },
  ];

  return (
    <div className="animate-fade-up mt-6 border border-gold/20 bg-card/40 shadow-elegant backdrop-blur-md">
      {/* Ornamental header */}
      <div className="border-b border-gold/20 px-10 py-7 text-center">
        <div className="text-gold text-xs">✦</div>
        <p className="mt-3 font-serif text-2xl font-light italic text-foreground">Your Brief</p>
        <p className="mt-1.5 text-[9px] uppercase tracking-luxe text-muted-foreground">
          Prepared with discretion
        </p>
      </div>

      <div className="divide-y divide-border/30 px-10 py-2">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[140px_1fr] items-baseline gap-6 py-5">
            <span className="text-[9px] uppercase tracking-luxe text-muted-foreground/70">
              {r.label}
            </span>
            <span className="font-serif text-lg font-light leading-snug text-foreground">
              {r.value || "—"}
            </span>
          </div>
        ))}
      </div>

      <div className="grid gap-px bg-border/40 sm:grid-cols-2">
        <button
          onClick={onFinish}
          className="group bg-gold px-6 py-5 text-[10px] uppercase tracking-luxe text-primary-foreground font-light transition-all duration-500 hover:bg-foreground"
        >
          <span className="flex items-center justify-center gap-3">
            Confirm & Connect
            <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
          </span>
        </button>
        <a
          href="tel:+910000000000"
          className="group bg-card px-6 py-5 text-center text-[10px] uppercase tracking-luxe text-foreground/80 font-light transition-all duration-500 hover:bg-accent hover:text-gold"
        >
          <span className="flex items-center justify-center gap-3">
            <span className="text-gold">✦</span>
            Speak Directly
          </span>
        </a>
      </div>
    </div>
  );
}
