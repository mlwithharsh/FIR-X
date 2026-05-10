import Head from "next/head";

import { ReportForm } from "../forms/ReportForm";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>FIR.ai V2</title>
        <meta name="description" content="Generate DAR court packets as downloadable Word documents" />
      </Head>

      <main className="min-h-screen px-4 py-10 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-panel">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rust">FIR.ai V2</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">
              Generate the DAR packet as a direct browser download in the original court format.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink/75">
              Fill the DAR fields once and download the rendered `.docx` immediately. The app no longer uses the preview
              flow for this packet.
            </p>
          </div>

          <ReportForm />
        </div>
      </main>
    </>
  );
}
