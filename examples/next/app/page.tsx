import { useQueries } from "@tanstack/react-query";
import Link from "next/link";

export default function LoginForm() {

  const {} = useQueries([])

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-amber-500 text-lg font-bold text-white">
            MRQ
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to continue to your account
          </p>
        </div>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Email address
            </label>

            <input
              id="username"
              type="text"
              autoComplete="billing bday-day webauthn"
              placeholder="emilys"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-200"
              >
                Password
              </label>
            </div>

            <input
              id="password"
              type="password"
              autoComplete="off"
              placeholder="emilyspass"
              className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-800 px-4 py-3 font-semibold text-white transition hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/30"
          >
            Login
          </button>
        </form>
      </section>
    </main>
  );
}