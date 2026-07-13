"use client";

import { useQuery } from "@tanstack/react-query";
import { authenticatedAuth, mockHttp } from "../../api/dummy-json/resources";
import { clearTokens } from "../../api/dummy-json/token-provider";
import { ResultBox } from "../_components/result-box";

export function ErrorsClient() {
  const http404 = useQuery({
    ...mockHttp.status.toQuery({ status: 404, message: "Product_not_found" }),
    enabled: false,
    retry: false,
  });
  const requiredAuth = useQuery({
    ...authenticatedAuth.me.toQuery(),
    enabled: false,
    retry: false,
  });

  return (
    <section className="mx-auto max-w-3xl px-5 py-6">
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="button-secondary" type="button" onClick={() => http404.refetch()}>
            Trigger HTTP 404
          </button>
          <button
            className="button-secondary"
            type="button"
            onClick={() => {
              clearTokens();
              requiredAuth.refetch();
            }}
          >
            Trigger required auth
          </button>
        </div>
        <ResultBox value="No error yet" error={http404.error ?? requiredAuth.error} />
      </div>
    </section>
  );
}
