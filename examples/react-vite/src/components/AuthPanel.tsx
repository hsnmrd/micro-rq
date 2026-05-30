"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MicroAuthRequiredError } from "micro-rq";
import { auth } from "../api";

export function AuthPanel() {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    ...auth.me.build(),
    retry: false,
  });
  const login = useMutation({
    ...auth.login.build(),
    onSuccess: (tokens) => {
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);
      queryClient.invalidateQueries({
        queryKey: auth.me.baseKey(),
      });
    },
  });

  return (
    <div className="stack">
      <button
        type="button"
        disabled={login.isPending}
        onClick={() => {
          login.mutate({
            username: "emilys",
            password: "emilyspass",
          });
        }}
      >
        {login.isPending ? "Signing in" : "Sign in with DummyJSON"}
      </button>

      <button
        type="button"
        onClick={() => {
          localStorage.setItem("accessToken", "expired-demo-token");
          queryClient.invalidateQueries({
            queryKey: auth.me.baseKey(),
          });
        }}
      >
        Test refresh flow
      </button>

      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          queryClient.removeQueries({
            queryKey: auth.me.baseKey(),
          });
        }}
      >
        Clear tokens
      </button>

      {meQuery.isFetching ? <p>Loading authenticated user</p> : null}
      {meQuery.error instanceof MicroAuthRequiredError ? <p className="muted">Not signed in.</p> : null}
      {meQuery.isError && !(meQuery.error instanceof MicroAuthRequiredError) ? (
        <p>Authenticated request failed.</p>
      ) : null}
      {meQuery.data ? (
        <p className="muted">
          Signed in as {meQuery.data.firstName} {meQuery.data.lastName}
        </p>
      ) : null}
    </div>
  );
}
