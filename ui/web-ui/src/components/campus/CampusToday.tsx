import { CAMPUS_UTILS, type CampusUtil } from './campusUtils';

interface CampusTodayProps {
  school: string | null;
  hasData: boolean;
  onOpen: (util: CampusUtil) => void;
}

export function CampusToday({ school, hasData, onOpen }: CampusTodayProps) {
  if (!school || !hasData) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted">
        On campus · today
      </p>
      <div className="flex gap-2.5 overflow-x-auto pb-1 pl-5 pr-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CAMPUS_UTILS.map((u) => (
          <button
            key={u.category}
            type="button"
            onClick={() => onOpen(u)}
            className="w-32 shrink-0 rounded-2xl border border-line bg-cream p-3 text-left shadow-[var(--shadow-xs)] transition-all duration-150 ease-out hover:shadow-[var(--shadow-sm)] active:scale-95 cursor-pointer"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${u.dot}`} />
              <span className="text-xs font-semibold text-ink-2">{u.label}</span>
            </div>
            <p className="truncate text-sm font-semibold text-ink">View</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{u.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
