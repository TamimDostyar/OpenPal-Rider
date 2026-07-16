import { api } from '@/api/client';
import type { LegalDocument } from '@/api/types';
import { useApiData } from '@/hooks/useApi';
import { Modal } from '@/components/ui/Modal';
import { Banner } from '@/components/ui/Banner';

export type LegalKind = 'terms' | 'privacy';

export function LegalModal({ kind, onClose }: { kind: LegalKind; onClose: () => void }) {
  const { data: doc, loading, error } = useApiData<LegalDocument>(
    () => (kind === 'terms' ? api.legal.terms() : api.legal.privacy()),
    [kind],
  );

  return (
    <Modal title={kind === 'terms' ? 'Terms & Conditions' : 'Privacy Policy'} onClose={onClose}>
      {loading ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-3 w-1/3 rounded-full" />
          <div className="skeleton h-4 w-full rounded-full" />
          <div className="skeleton h-4 w-5/6 rounded-full" />
          <div className="skeleton h-4 w-2/3 rounded-full" />
        </div>
      ) : null}
      {error ? <Banner tone="error">{error}</Banner> : null}
      {doc ? (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted">Last updated {doc.lastUpdated}</p>
          {doc.intro ? <p className="text-sm leading-6 text-ink-2">{doc.intro}</p> : null}
          {doc.sections.map((section) => (
            <div key={section.title}>
              <h3 className="mb-1 text-sm font-semibold text-ink">{section.title}</h3>
              <p className="text-sm leading-6 text-ink-2">{section.body}</p>
            </div>
          ))}
          {doc.footer ? <p className="text-xs text-muted">{doc.footer}</p> : null}
        </div>
      ) : null}
    </Modal>
  );
}
