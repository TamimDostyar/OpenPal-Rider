export function RouteMap() {
  return (
    <div className="rounded-3xl border border-line bg-cream-2 px-5 py-6">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-sage">Point A</p>
          <p className="text-lg font-semibold text-ink">Chicago</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-coral">Point B</p>
          <p className="text-lg font-semibold text-ink">Boston</p>
        </div>
      </div>

      <div className="relative h-20 overflow-hidden">
        <svg viewBox="0 0 376 80" className="h-full w-full" aria-hidden>
          {[8, 80, 152, 224, 296, 368].map((x, i) => {
            const y = i % 2 === 0 ? 62 : 18;
            return <circle key={x} cx={x} cy={y} r="1.5" fill="#C7CBD1" />;
          })}
          <circle cx="8" cy="62" r="8" fill="rgb(var(--c-sage))" stroke="white" strokeWidth="2" />
          <circle cx="368" cy="18" r="8" fill="rgb(var(--c-coral))" stroke="white" strokeWidth="2" />
        </svg>

        <div className="route-car absolute left-0 top-0 h-6 w-11">
          <div className="relative h-full w-full">
            <div className="absolute left-[11px] top-0 h-[11px] w-[22px] rounded-t-lg bg-coral" />
            <div className="absolute left-[15px] top-[3px] h-[6px] w-[14px] rounded-sm bg-cream-2" />
            <div className="absolute left-0 top-2 h-[11px] w-11 rounded-md bg-coral" />
            <div className="absolute right-[1px] top-[11px] h-[3px] w-[3px] rounded-full bg-amber-200" />
            {[7, 27].map((left) => (
              <div
                key={left}
                className="absolute top-[13px] flex h-[11px] w-[11px] items-center justify-center rounded-full bg-ink"
                style={{ left }}
              >
                <div className="h-1 w-1 rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
