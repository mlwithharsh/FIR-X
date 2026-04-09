type Props = {
  previewText: string;
  legalDescription: string;
  conditionalSections: Record<string, boolean> | null;
};

export function PreviewPanel({ previewText, legalDescription, conditionalSections }: Props) {
  return (
    <aside className="panel h-fit p-6">
      <h2 className="text-2xl font-semibold tracking-tight">Draft Preview</h2>
      <p className="mt-2 text-sm text-ink/70">Rendered legal draft before report export.</p>

      <div className="mt-5 rounded-xl bg-ink p-4 text-sm leading-6 text-white whitespace-pre-wrap">
        {previewText || "Preview will appear here after validation."}
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-rust">Legal Description</h3>
        <p className="mt-2 text-sm leading-6 text-ink/85">
          {legalDescription || "AI-assisted legal text will appear here."}
        </p>
      </div>

      {conditionalSections && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-rust">Conditional Logic</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(conditionalSections).map(([key, value]) => (
              <span
                key={key}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${value ? "bg-olive text-white" : "bg-ink/10 text-ink/60"}`}
              >
                {key}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
