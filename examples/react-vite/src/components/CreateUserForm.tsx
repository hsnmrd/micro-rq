"use client";

import { FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { users } from "../api";

export function CreateUserForm() {
  const queryClient = useQueryClient();
  const createUser = useMutation({
    ...users.create.build(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: users.list.baseKey(),
      });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    createUser.mutate({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
    });
  };

  return (
    <form className="stack" onSubmit={onSubmit}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit" disabled={createUser.isPending}>
        {createUser.isPending ? "Creating" : "Create"}
      </button>
    </form>
  );
}
