"use client";

import { useMemo, useState } from "react";
import { sections } from "../lib/docs-content";

export function DocsShell() {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleSections = useMemo(() => {
    if (!normalizedSearch) {
      return sections;
    }

    return sections.filter((section) => {
      const text = [
        section.title,
        section.eyebrow,
        ...section.body,
        ...(section.items ?? []),
        ...(section.code?.map((block) => block.code) ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(normalizedSearch);
    });
  }, [normalizedSearch]);

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="border-b border-slate-200 bg-white p-6 lg:sticky lg:top-0 lg:h-screen lg:overflow-auto lg:border-b-0 lg:border-r">
        <a className="flex items-center gap-3 text-inherit no-underline" href="#overview">
          <span className="grid size-11 place-items-center rounded-lg bg-teal-700 font-extrabold text-white">
            rq
          </span>
          <span>
            <strong className="block">micro-rq</strong>
            <small className="block text-sm text-ink-600">REST helpers for TanStack Query</small>
          </span>
        </a>

        <label className="mt-7 grid gap-2 text-sm text-ink-600">
          Search docs
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-ink-950 outline-none focus:border-teal-700"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="query keys, authMode, errors"
            type="search"
          />
        </label>

        <nav className="mt-5 grid gap-1" aria-label="Docs navigation">
          {sections.map((section) => (
            <a
              className="rounded-md px-3 py-2 text-ink-800 no-underline hover:bg-teal-50 hover:text-teal-800"
              href={`#${section.id}`}
              key={section.id}
            >
              {navTitle(section.title)}
            </a>
          ))}
        </nav>
      </aside>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
        {visibleSections.length === 0 ? (
          <section className="rounded-lg border border-slate-200 bg-white p-7">
            <h1 className="text-2xl font-bold">No results</h1>
            <p className="mt-2 text-ink-600">Try searching for resource, query key, authMode, token provider, or error.</p>
          </section>
        ) : null}

        <div className="grid gap-6">
          {visibleSections.map((section, index) => (
            <section
              className={index === 0 ? "rounded-lg border border-slate-200 bg-white p-7 lg:p-9" : "rounded-lg border border-slate-200 bg-white p-7"}
              id={section.id}
              key={section.id}
            >
              {section.eyebrow ? <p className="mb-2 font-bold text-teal-700">{section.eyebrow}</p> : null}
              <h2 className={index === 0 ? "max-w-3xl text-4xl font-extrabold leading-tight lg:text-6xl" : "text-2xl font-bold"}>
                {section.title}
              </h2>
              <div className="mt-4 grid gap-3 text-ink-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              {section.items ? (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-ink-800" key={item}>
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}

              {section.code ? (
                <div className="mt-5 grid gap-4">
                  {section.code.map((block) => (
                    <CodeBlock code={block.code} key={block.code} />
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <pre className="relative overflow-auto rounded-lg border border-slate-900 bg-slate-950 p-5 pr-20 text-sm text-slate-100">
      <button
        className="absolute right-3 top-3 rounded-md border border-slate-600 bg-slate-800 px-2 py-1 text-xs text-white"
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1200);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
      <code>{code}</code>
    </pre>
  );
}

function navTitle(title: string) {
  return title.length > 28 ? title.split(" ").slice(0, 2).join(" ") : title;
}
