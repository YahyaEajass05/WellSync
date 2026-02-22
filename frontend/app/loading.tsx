export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">

      {/* ── Animated Background Orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* ── Main Loading Content ── */}
      <div className="relative z-10 flex flex-col items-center gap-8">

        {/* ── Animated Logo ── */}
        <div className="relative">
          {/* Outer pulse ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-primary/15 animate-ping" style={{ animationDuration: '3s' }} />
          </div>

          {/* WellSync Logo SVG */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-teal-500/20 border border-primary/30 flex items-center justify-center animate-bounce-in">
            <svg viewBox="0 0 100 60" className="w-14 h-14" fill="none">
              {/* Wave */}
              <path
                d="M5,45 Q20,10 35,30 Q50,50 65,25 Q80,0 95,20"
                stroke="#17A2B8"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              >
                <animate
                  attributeName="d"
                  values="M5,45 Q20,10 35,30 Q50,50 65,25 Q80,0 95,20;
                          M5,30 Q20,50 35,25 Q50,0 65,35 Q80,55 95,30;
                          M5,45 Q20,10 35,30 Q50,50 65,25 Q80,0 95,20"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </path>
              {/* Dots */}
              <circle cx="20" cy="30" r="4" fill="#1B4965">
                <animate attributeName="cy" values="30;15;30" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="30" r="4" fill="#17A2B8">
                <animate attributeName="cy" values="30;45;30" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="30" r="4" fill="#1B4965">
                <animate attributeName="cy" values="30;15;30" dur="2s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
        </div>

        {/* ── WellSync Text ── */}
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #1B4965 0%, #17A2B8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            WellSync
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Loading your wellness data...</p>
        </div>

        {/* ── Wave Loading Bar ── */}
        <div className="flex items-end gap-1 h-8">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="w-2 rounded-full bg-gradient-to-t from-primary to-teal-400"
              style={{
                height: '100%',
                animation: `wave 1s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* ── Progress dots ── */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
