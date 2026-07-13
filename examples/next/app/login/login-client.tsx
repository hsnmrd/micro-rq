"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { auth } from "../../api/dummy-json/resources";
import { saveTokens } from "../../api/dummy-json/token-provider";
import { ResultBox } from "../_components/result-box";

export function LoginClient() {
  const router = useRouter();
  const loginMutation = useMutation({
    ...auth.login.toMutation(),
    onSuccess: (tokens) => {
      saveTokens(tokens);
      router.replace("/account");
      router.refresh();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    loginMutation.mutate({
      username: String(form.get("username") || "emilys"),
      password: String(form.get("password") || "emilyspass"),
      expiresInMins: 1,
    });
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <input className="field" name="username" defaultValue="emilys" aria-label="Username" />
      <input className="field" name="password" defaultValue="emilyspass" type="password" aria-label="Password" />
      <button className="button-primary w-full" disabled={loginMutation.isPending} type="submit">
        Sign in
      </button>
      <ResultBox value="The account page is empty until the login response stores tokens." error={loginMutation.error} />
    </form>
  );
}
