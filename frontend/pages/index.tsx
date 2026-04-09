import Head from "next/head";
import { useState } from "react";

import { PreviewPanel } from "../components/PreviewPanel";
import { ReportForm } from "../forms/ReportForm";

type PreviewState = {
  previewText: string;
  legalDescription: string;
  conditionalSections: Record<string, boolean> | null;
};

export default function HomePage() {
  const [preview, setPreview] = useState<PreviewState>({
    previewText: "",
    legalDescription: "",
    conditionalSections: null,
  });

  return (
    <>
      <Head>
        <title>FIR.ai V2</title>
        <meta name="description" content="Intelligent FIR and accident report drafting system" />
      </Head>

      <main className="min-h-screen px-4 py-10 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">FIR.ai V2</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Intelligent FIR and accident report drafting for MACT-aligned police workflows.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/75">
              Capture a small set of case facts once, auto-fill repeated details across FORM-I, FORM-III, FORM-IV, FORM-V,
              FORM-VII, preview the legal narrative, and export a bundled `.docx` packet.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <ReportForm onPreview={setPreview} />
            <PreviewPanel
              previewText={preview.previewText}
              legalDescription={preview.legalDescription}
              conditionalSections={preview.conditionalSections}
            />
          </div>
        </div>
      </main>
    </>
  );
}
