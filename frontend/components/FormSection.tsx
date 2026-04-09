import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function FormSection({ title, description, children }: Props) {
  return (
    <section className="panel p-6">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-ink/70">{description}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
