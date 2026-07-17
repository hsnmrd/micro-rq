"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPage, getPageSections, pages, sections, type DocPage, type DocSection } from "../lib/docs-content";

type DocsShellProps = {
  page?: DocPage;
};

type ThemeName = "light" | "dark";

const themes: Array<{ name: ThemeName; label: string }> = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
];

export function DocsShell({ page = defaultPage }: DocsShellProps) {
  const [search, setSearch] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("light");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const normalizedSearch = search.trim().toLowerCase();
  const pageIndex = pages.findIndex((navPage) => navPage.slug === page.slug);
  const previousPage = pageIndex > 0 ? pages[pageIndex - 1] : undefined;
  const nextPage = pageIndex >= 0 && pageIndex < pages.length - 1 ? pages[pageIndex + 1] : undefined;
  const pageSections = useMemo(() => getPageSections(page), [page]);
  const sectionNavigation = useMemo(() => {
    if (normalizedSearch) {
      return [];
    }

    return pageSections.map((section) => ({
      id: section.id,
      title: section.title,
    }));
  }, [normalizedSearch, pageSections]);
  const visibleSections = useMemo(() => {
    if (!normalizedSearch) {
      return pageSections;
    }

    return sections.filter((section) => sectionMatchesSearch(section, normalizedSearch));
  }, [normalizedSearch, pageSections]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("micro-rq-docs-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (normalizedSearch || !sectionNavigation.length) {
      setActiveSectionId(null);
      return;
    }

    const sectionElements = sectionNavigation
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionElements.length) {
      setActiveSectionId(null);
      return;
    }
    const readingLineOffset = 140;

    function updateActiveSection() {
      const readingLine = readingLineOffset;
      let nextActiveSectionId = sectionElements[0]?.id ?? null;

      for (const sectionElement of sectionElements) {
        const { top } = sectionElement.getBoundingClientRect();

        if (top <= readingLine) {
          nextActiveSectionId = sectionElement.id;
          continue;
        }

        break;
      }

      setActiveSectionId((current) => (current === nextActiveSectionId ? current : nextActiveSectionId));
    }

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [normalizedSearch, sectionNavigation]);

  useEffect(() => {
    if (!isNavOpen && !isSearchOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsNavOpen(false);
        setIsSearchOpen(false);
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isNavOpen, isSearchOpen]);

  function updateTheme(nextTheme: ThemeName) {
    setTheme(nextTheme);
    window.localStorage.setItem("micro-rq-docs-theme", nextTheme);
  }

  function openSearch() {
    setIsNavOpen(false);
    setIsSearchOpen(true);
  }

  return (
    <div className="min-h-screen bg-[var(--docs-bg)] text-[var(--docs-text)]" data-theme={theme}>
      <header className="border-b border-[var(--docs-border)] bg-[var(--docs-surface)]">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <IconButton className="lg:hidden" label="Open navigation" onClick={() => setIsNavOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Link className="flex min-w-0 items-center gap-3 text-inherit no-underline" href="/">
              <span className="grid size-10 place-items-center overflow-hidden rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] shadow-sm">
                <Image alt="micro-rq logo" height={100} priority src="/icon.jpg" width={100} />
              </span>
              <span className="min-w-0">
                <strong className="block truncate text-base leading-tight">micro-rq</strong>
                <small className="hidden text-xs font-medium text-[var(--docs-muted)] sm:block">
                  REST helpers for TanStack Query
                </small>
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <IconButton label={normalizedSearch ? "Edit search" : "Search docs"} onClick={openSearch}>
              <SearchIcon />
            </IconButton>
            <div className="hidden rounded-full border border-[var(--docs-border)] bg-[var(--docs-soft)] p-1 sm:flex" aria-label="Theme">
              {themes.map((themeOption) => (
                <button
                  className={[
                    "rounded-full px-3 py-1.5 text-xs font-bold transition",
                    theme === themeOption.name
                      ? "bg-[var(--docs-accent)] text-white shadow-sm"
                      : "text-[var(--docs-muted)] hover:text-[var(--docs-text)]",
                  ].join(" ")}
                  key={themeOption.name}
                  onClick={() => updateTheme(themeOption.name)}
                  type="button"
                >
                  {themeOption.label}
                </button>
              ))}
            </div>
            <a
              className="hidden rounded-full border border-[var(--docs-border)] bg-[var(--docs-surface)] px-4 py-2 text-sm font-semibold text-[var(--docs-text)] no-underline shadow-sm hover:border-[var(--docs-accent)] sm:inline-flex"
              href="https://www.npmjs.com/package/micro-rq"
              rel="noreferrer"
              target="_blank"
            >
              npm package
            </a>
          </div>
        </div>
      </header>

      <MobileNavigationDrawer
        currentPage={page}
        isOpen={isNavOpen}
        isSearching={Boolean(normalizedSearch)}
        onClose={() => setIsNavOpen(false)}
        pageDescription={normalizedSearch ? "Search results across **all docs**." : page.description}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        resultCount={visibleSections.length}
        results={visibleSections}
        search={search}
        setSearch={setSearch}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_240px] lg:px-8">
        <aside className="hidden lg:sticky lg:top-8 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-auto">
          <SidebarContent
            currentPage={page}
            isSearching={Boolean(normalizedSearch)}
            pageDescription={normalizedSearch ? "Search results across **all docs**." : page.description}
          />
        </aside>

        <main className="min-w-0">
          <Hero page={page} isSearching={Boolean(normalizedSearch)} resultCount={visibleSections.length} />

          {page.slug === defaultPage.slug && !normalizedSearch ? <CoreRule /> : null}

          {visibleSections.length === 0 ? (
            <section className="mt-6 border-l-2 border-[var(--docs-border)] bg-[var(--docs-surface)] px-6 py-8">
              <h2 className="text-2xl font-bold">No results</h2>
              <p className="mt-2 text-[var(--docs-muted)]">Try searching for resource, query key, authMode, token provider, or error.</p>
            </section>
          ) : (
            <div className="mt-6 grid gap-5">
              {visibleSections.map((section) => (
                <DocSectionView section={section} key={section.id} />
              ))}
            </div>
          )}

          {!normalizedSearch ? <PageNavigation previousPage={previousPage} nextPage={nextPage} /> : null}
        </main>

        {!normalizedSearch && sectionNavigation.length ? (
          <PageSectionsNav activeSectionId={activeSectionId} items={sectionNavigation} />
        ) : null}
      </div>
    </div>
  );
}

function SidebarContent({
  currentPage,
  isSearching,
  pageDescription,
  onNavigate,
}: {
  currentPage: DocPage;
  isSearching: boolean;
  pageDescription: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="border-l-2 border-[var(--docs-border)] bg-transparent pl-4">
        <DocsNavigation currentPage={currentPage} isSearching={isSearching} onNavigate={onNavigate} />
      </div>

      <div className="mt-7 border-l-2 border-[var(--docs-accent)] pl-4 text-sm text-[var(--docs-muted)]">
        <strong className="block text-[var(--docs-text)]">Current page</strong>
        <span className="mt-1 block">
          <InlineText text={pageDescription} />
        </span>
      </div>
    </>
  );
}

function DocsNavigation({
  currentPage,
  isSearching,
  onNavigate,
}: {
  currentPage: DocPage;
  isSearching: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="grid gap-1" aria-label="Docs navigation">
      {pages.map((navPage) => (
        <Link
          className={[
            "rounded-full px-4 py-2 text-sm font-semibold no-underline transition",
            navPage.slug === currentPage.slug && !isSearching
              ? "bg-[var(--docs-accent-soft)] text-[var(--docs-accent-strong)]"
              : "text-[var(--docs-muted)] hover:bg-[var(--docs-soft)] hover:text-[var(--docs-text)]",
          ].join(" ")}
          href={pageHref(navPage)}
          key={navPage.slug}
          onClick={onNavigate}
        >
          {navPage.title}
        </Link>
      ))}
    </nav>
  );
}

function MobileNavigationDrawer({
  currentPage,
  isOpen,
  isSearching,
  onClose,
  pageDescription,
}: {
  currentPage: DocPage;
  isOpen: boolean;
  isSearching: boolean;
  onClose: () => void;
  pageDescription: string;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Docs navigation">
      <button className="absolute inset-0 bg-black/40" type="button" aria-label="Close navigation" onClick={onClose} />
      <div className="relative flex h-full w-[min(22rem,calc(100vw-2rem))] flex-col border-r border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4 shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--docs-border)] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-muted)]">Navigation</p>
            <strong className="mt-1 block text-lg leading-tight text-[var(--docs-heading)]">micro-rq docs</strong>
          </div>
          <IconButton label="Close navigation" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="min-h-0 flex-1 overflow-auto py-5">
          <SidebarContent
            currentPage={currentPage}
            isSearching={isSearching}
            onNavigate={onClose}
            pageDescription={pageDescription}
          />
        </div>
      </div>
    </div>
  );
}

function SearchModal({
  isOpen,
  onClose,
  resultCount,
  results,
  search,
  setSearch,
}: {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
  results: DocSection[];
  search: string;
  setSearch: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const hasSearch = Boolean(search.trim());
  const previewLimit = 6;
  const previewResults = results.slice(0, previewLimit);
  const hasMoreResults = resultCount > previewLimit;

  return (
    <div className="fixed inset-0 z-50 bg-[var(--docs-bg)] text-[var(--docs-text)]" role="dialog" aria-modal="true" aria-label="Search docs">
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--docs-border)] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-muted)]">Search</p>
            <h2 className="mt-1 text-xl font-black text-[var(--docs-heading)]">Find docs</h2>
          </div>
          <IconButton label="Close search" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        <div className="py-5">
          <label className="sr-only" htmlFor="docs-search-modal-input">
            Search docs
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-4 py-3 shadow-sm focus-within:border-[var(--docs-accent)] focus-within:ring-4 focus-within:ring-[var(--docs-ring)]">
            <SearchIcon />
            <input
              className="min-w-0 flex-1 bg-transparent text-base font-semibold text-[var(--docs-text)] outline-none placeholder:text-[var(--docs-faint)] placeholder:opacity-60"
              id="docs-search-modal-input"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="authMode, query keys, headers"
              ref={inputRef}
              type="search"
              value={search}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto border-t border-[var(--docs-border)] py-5">
          {hasSearch ? (
            <div className="grid gap-3">
              <div className="rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4">
                <p className="text-sm font-bold text-[var(--docs-heading)]">
                  {resultCount} matching section{resultCount === 1 ? "" : "s"}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--docs-muted)]">
                  Results update on the current page as you type.
                </p>
              </div>

              {previewResults.length ? (
                <div className="max-h-[min(22rem,45vh)] overflow-auto pr-1">
                  <div className="grid gap-2">
                    {previewResults.map((section) => (
                      <a
                        className="rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4 text-left no-underline transition hover:border-[var(--docs-accent)] hover:bg-[var(--docs-soft)]"
                        href={`#${section.id}`}
                        key={section.id}
                        onClick={onClose}
                      >
                        {section.eyebrow ? (
                          <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-muted)]">
                            {section.eyebrow}
                          </span>
                        ) : null}
                        <span className="block text-sm font-bold text-[var(--docs-heading)]">
                          {section.title}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4">
                  <p className="text-sm font-bold text-[var(--docs-heading)]">No matching sections</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--docs-muted)]">
                    Try searching for authMode, query keys, token provider, SSR hydration, or errors.
                  </p>
                </div>
              )}

              {hasMoreResults ? (
                <button
                  className="rounded-2xl border border-[var(--docs-accent)] bg-[var(--docs-accent-soft)] px-5 py-4 text-left text-sm font-bold text-[var(--docs-accent-strong)] transition hover:bg-[var(--docs-soft)]"
                  onClick={onClose}
                  type="button"
                >
                  View all {resultCount} results
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-2">
              {["authMode", "query keys", "token provider", "SSR hydration", "MicroApiError"].map((term) => (
                <button
                  className="rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4 text-left text-sm font-semibold text-[var(--docs-text)] transition hover:border-[var(--docs-accent)] hover:bg-[var(--docs-soft)]"
                  key={term}
                  onClick={() => setSearch(term)}
                  type="button"
                >
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  className = "",
  label,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={[
        "grid size-10 shrink-0 place-items-center rounded-full border border-[var(--docs-border)] bg-[var(--docs-surface)] text-[var(--docs-text)] shadow-sm transition hover:border-[var(--docs-accent)] hover:bg-[var(--docs-soft)] focus:outline-none focus:ring-4 focus:ring-[var(--docs-ring)]",
        className,
      ].join(" ")}
      aria-label={label}
      title={label}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

function PageSectionsNav({
  items,
  activeSectionId,
}: {
  items: Array<{ id: string; title: string }>;
  activeSectionId: string | null;
}) {
  return (
    <aside className="hidden xl:block">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-auto border-l-2 border-[var(--docs-border)] pl-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-muted)]">On this page</p>
        <nav aria-label="Page sections" className="mt-4 grid gap-1.5">
          {items.map((item) => (
            <a
              aria-current={activeSectionId === item.id ? "location" : undefined}
              className={[
                "rounded-xl px-3 py-2 text-sm leading-6 no-underline transition",
                activeSectionId === item.id
                  ? "bg-[var(--docs-accent-soft)] font-semibold text-[var(--docs-accent-strong)]"
                  : "text-[var(--docs-muted)] hover:bg-[var(--docs-soft)] hover:text-[var(--docs-text)]",
              ].join(" ")}
              href={`#${item.id}`}
              key={item.id}
            >
              {item.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function PageNavigation({ previousPage, nextPage }: { previousPage?: DocPage; nextPage?: DocPage }) {
  if (!previousPage && !nextPage) {
    return null;
  }

  return (
    <nav className="mt-8 grid gap-3 border-t border-[var(--docs-border)] pt-6 sm:grid-cols-2" aria-label="Page navigation">
      {previousPage ? (
        <PageNavigationLink direction="Previous" page={previousPage} />
      ) : (
        <span aria-hidden="true" />
      )}
      {nextPage ? <PageNavigationLink direction="Next" page={nextPage} align="right" /> : null}
    </nav>
  );
}

function PageNavigationLink({ direction, page, align = "left" }: { direction: "Previous" | "Next"; page: DocPage; align?: "left" | "right" }) {
  return (
    <Link
      className={[
        "group rounded-2xl border border-[var(--docs-border)] bg-[var(--docs-surface)] px-5 py-4 text-inherit no-underline transition hover:border-[var(--docs-accent)] hover:bg-[var(--docs-soft)]",
        align === "right" ? "text-right" : "text-left",
      ].join(" ")}
      href={pageHref(page)}
    >
      <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-muted)]">{direction}</span>
      <span className="mt-1 block text-base font-black text-[var(--docs-heading)] group-hover:text-[var(--docs-accent-strong)]">
        {direction === "Previous" ? "← " : ""}
        {page.title}
        {direction === "Next" ? " →" : ""}
      </span>
      <span className="mt-1 block text-sm leading-6 text-[var(--docs-muted)]">{page.description}</span>
    </Link>
  );
}

function pageHref(page: DocPage) {
  return page.slug === defaultPage.slug ? "/" : `/${page.slug}`;
}

function Hero({ page, isSearching, resultCount }: { page: DocPage; isSearching: boolean; resultCount: number }) {
  const showBanner = page.slug === defaultPage.slug && !isSearching;

  return (
    <section className="border-b border-[var(--docs-border)] pb-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--docs-accent-strong)]">
          {isSearching ? "Search Results" : "Documentation"}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[var(--docs-heading)] lg:text-6xl">
          {isSearching ? `${resultCount} matching section${resultCount === 1 ? "" : "s"}` : page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--docs-muted)]">
          <InlineText
            text={
              isSearching
                ? "Matching sections are collected from **every docs page** so you can jump straight to the relevant option."
                : page.description
            }
          />
        </p>
      </div>
    </section>
  );
}

function CoreRule() {
  return (
    <section className="mt-6 rounded-2xl border border-[var(--docs-tip-border)] bg-[var(--docs-tip-bg)] px-5 py-4">
      <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--docs-accent-strong)]">Core rule</p>
      <p className="mt-2 text-sm leading-6 text-[var(--docs-muted)]">
        <InlineText text="micro-rq generates **TanStack Query config**. You still use TanStack Query options directly in `useQuery` and `useMutation`." />
      </p>
    </section>
  );
}

function DocSectionView({ section }: { section: DocSection }) {
  if (section.tone === "warning" || section.tone === "info") {
    return <CalloutSection section={section} />;
  }

  return (
    <section className="scroll-mt-8 border-b border-[var(--docs-border)] pb-8" id={section.id}>
      {section.eyebrow ? <p className="mb-2 text-sm font-bold uppercase tracking-[0.14em] text-[var(--docs-accent-strong)]">{section.eyebrow}</p> : null}
      <h2 className="text-2xl font-black leading-tight text-[var(--docs-heading)]">{section.title}</h2>
      <div className="mt-4 grid gap-3 text-base leading-7 text-[var(--docs-muted)]">
        {section.body.map((paragraph) => (
          <p key={paragraph}>
            <InlineText text={paragraph} />
          </p>
        ))}
      </div>

      {section.items ? (
        <SectionItems items={section.items} />
      ) : null}

      {section.code ? (
        <div className="mt-5 grid gap-4">
          {section.code.map((block) => (
            <CodeBlock code={block.code} key={block.code} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function CalloutSection({ section }: { section: DocSection }) {
  const isWarning = section.tone === "warning";
  const borderColor = isWarning ? "var(--docs-warning-border)" : "var(--docs-info-border)";
  const backgroundColor = isWarning ? "var(--docs-warning-bg)" : "var(--docs-info-bg)";
  const labelColor = isWarning ? "var(--docs-warning-text)" : "var(--docs-info-text)";

  return (
    <section className="scroll-mt-8 border-b border-[var(--docs-border)] pb-8" id={section.id}>
      <div className="rounded-2xl border px-5 py-4" style={{ backgroundColor, borderColor }}>
        <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: labelColor }}>
          {section.eyebrow ?? (isWarning ? "Warning" : "Info")}
        </p>
        <h2 className="mt-2 text-xl font-black leading-tight text-[var(--docs-heading)]">{section.title}</h2>
        <div className="mt-3 grid gap-3 text-sm leading-7 text-[var(--docs-muted)]">
          {section.body.map((paragraph) => (
            <p key={paragraph}>
              <InlineText text={paragraph} />
            </p>
          ))}
        </div>

        {section.code ? (
          <div className="mt-4 grid gap-4">
            {section.code.map((block) => (
              <CodeBlock code={block.code} key={block.code} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SectionItems({ items }: { items: string[] }) {
  const definitionItems = items.filter(isDefinitionItem);
  const tipItems = items.filter((item) => !isDefinitionItem(item));

  return (
    <div className="mt-6 grid gap-5">
      {definitionItems.length ? (
        <dl className="grid gap-2.5">
          {definitionItems.map((item) => (
            <DefinitionItem item={item} key={item} />
          ))}
        </dl>
      ) : null}

      {tipItems.length ? (
        <div className="rounded-2xl border border-[var(--docs-tip-border)] bg-[var(--docs-tip-bg)] px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-accent-strong)]">Key points</p>
          <ul className="mt-3 space-y-3">
            {tipItems.map((item) => (
              <TipItem item={item} key={item} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function DefinitionItem({ item }: { item: string }) {
  const [label, ...descriptionParts] = item.split(": ");
  const description = descriptionParts.join(": ");

  return (
    <div className="grid gap-1 border-l-2 border-[var(--docs-border)] pl-3 md:grid-cols-[minmax(180px,0.34fr)_minmax(0,1fr)] md:gap-4">
      <dt className="break-words text-sm font-bold leading-6 text-[var(--docs-heading)]">{label}</dt>
      <dd className="max-w-3xl text-sm leading-6 text-[var(--docs-muted)]">
        <InlineText text={description} />
      </dd>
    </div>
  );
}

function TipItem({ item }: { item: string }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-7">
      <span
        aria-hidden="true"
        className="mt-2.5 block size-1.5 shrink-0 rounded-full bg-[var(--docs-accent)]"
      />
      <span className="text-[var(--docs-muted)]">
        <InlineText text={item} />
      </span>
    </li>
  );
}

function isDefinitionItem(item: string) {
  const [, ...descriptionParts] = item.split(": ");
  return Boolean(descriptionParts.join(": "));
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--docs-code-border)] bg-[var(--docs-code-bg)] shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--docs-code-border)] bg-[var(--docs-code-head)] px-4 py-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--docs-code-muted)]">TypeScript</span>
        <button
          className="rounded-full border border-[var(--docs-code-border)] bg-[var(--docs-code-button)] px-3 py-1 text-xs font-semibold text-[var(--docs-code-text)] hover:border-[var(--docs-accent)]"
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-auto p-5 text-sm leading-6 text-[var(--docs-code-text)]">
        <code>
          {code.split("\n").map((line, index) => (
            <span className="block" key={`${line}-${index}`}>
              <span className="mr-5 inline-block w-6 select-none text-right text-[var(--docs-code-muted)]">{index + 1}</span>
              <HighlightedLine line={line} />
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function HighlightedLine({ line }: { line: string }) {
  const tokenPattern =
    /(\/\/.*|`(?:\\.|[^`])*`|"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|(?<![\w$])\d+(?:\.\d+)?(?![\w$])|(?<![\w$])(type|interface|const|let|return|if|else|async|await|export|import|from|new|throw|extends|as|typeof|Promise|Record|Array|void|unknown|string|number|boolean|null|undefined|true|false)(?![\w$])|[A-Za-z_$][\w$]*(?=\s*\()|[A-Za-z_$][\w$]*(?=\s*:)|[{}()[\].,:;<>?=])/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of line.matchAll(tokenPattern)) {
    if (match.index === undefined) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(line.slice(lastIndex, match.index));
    }

    nodes.push(
      <span className={tokenClass(match[0])} key={`${match[0]}-${match.index}`}>
        {match[0]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < line.length) {
    nodes.push(line.slice(lastIndex));
  }

  return <>{nodes.length ? nodes : " "}</>;
}

function tokenClass(token: string) {
  if (token.startsWith("//")) {
    return "text-[var(--syntax-comment)]";
  }

  if (token.startsWith("\"") || token.startsWith("'") || token.startsWith("`")) {
    return "text-[var(--syntax-string)]";
  }

  if (/^(type|interface|const|let|return|if|else|async|await|export|import|from|new|throw|extends|as|typeof)$/.test(token)) {
    return "text-[var(--syntax-keyword)]";
  }

  if (/^(Promise|Record|Array|void|unknown|string|number|boolean)$/.test(token)) {
    return "text-[var(--syntax-type)]";
  }

  if (/^(null|undefined|true|false)$/.test(token)) {
    return "text-[var(--syntax-literal)]";
  }

  if (/^\d/.test(token)) {
    return "text-[var(--syntax-number)]";
  }

  if (/^[A-Za-z_$][\w$]*$/.test(token)) {
    return "text-[var(--syntax-symbol)]";
  }

  return "text-[var(--syntax-punctuation)]";
}

function InlineText({ text }: { text: string }) {
  const tokenPattern = /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    if (match.index === undefined) {
      continue;
    }

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("[")) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a
            className="font-semibold text-[var(--docs-accent-strong)] underline decoration-[var(--docs-accent)] underline-offset-4 hover:text-[var(--docs-accent)]"
            href={linkMatch[2]}
            key={`${token}-${match.index}`}
            rel="noreferrer"
            target="_blank"
          >
            {linkMatch[1]}
          </a>,
        );
      }
    } else if (token.startsWith("`")) {
      nodes.push(
        <code className="rounded-md border border-[var(--docs-border)] bg-[var(--docs-soft)] px-1.5 py-0.5 text-[0.9em] font-semibold text-[var(--docs-text)]" key={`${token}-${match.index}`}>
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong className="font-bold text-[var(--docs-heading)]" key={`${token}-${match.index}`}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      nodes.push(
        <em className="text-[var(--docs-text)]" key={`${token}-${match.index}`}>
          {token.slice(1, -1)}
        </em>,
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return <>{nodes}</>;
}

function sectionMatchesSearch(section: DocSection, normalizedSearch: string) {
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
}
