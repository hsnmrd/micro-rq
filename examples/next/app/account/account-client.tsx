"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authenticatedAuth } from "../../api/dummy-json/resources";
import { clearTokens } from "../../api/dummy-json/token-provider";
import { ResultBox } from "../_components/result-box";

export function AccountClient() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    ...authenticatedAuth.me.toQuery(),
    retry: false,
    staleTime: 30_000,
  });

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold">Authenticated user</h2>
          <p className="mt-1 text-sm text-neutral-600">
            This data does not exist before login. The query uses authMode required.
          </p>
        </div>
        <button
          className="button-danger"
          type="button"
          onClick={() => {
            clearTokens();
            queryClient.clear();
            router.replace("/login");
            router.refresh();
          }}
        >
          Logout
        </button>
      </div>

      {meQuery.data ? (
        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Field label="Name" value={`${meQuery.data.firstName} ${meQuery.data.lastName}`} />
          <Field label="Username" value={meQuery.data.username} />
          <Field label="Email" value={meQuery.data.email} />
          <Field label="Role" value={meQuery.data.role ?? "user"} />
        </div>
      ) : (
        <ResultBox value={meQuery.isLoading ? "Loading authenticated user" : "No authenticated user loaded"} error={meQuery.error} />
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-neutral-100 p-3">
      <div className="text-xs uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
