"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { carts } from "../api";
import { AuthPanel } from "../components/AuthPanel";
import { CartsPanel } from "../components/CartsPanel";
import { CreateUserForm } from "../components/CreateUserForm";
import { UserDetailPage } from "../components/UserDetailPage";
import { UsersPage } from "../components/UsersPage";

export function ExampleClient() {
  const [selectedUserId, setSelectedUserId] = useState(1);
  const client = useQueryClient();

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>micro-rq example</h1>
          <p>Next.js App Router with plain TanStack Query usage.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            client.invalidateQueries({
              queryKey: carts.list.baseKey(),
            });
          }}
        >
          Invalidate carts
        </button>
      </header>

      <section className="layout">
        <div className="panel">
          <h2>Auth</h2>
          <AuthPanel />
        </div>

        <div className="panel">
          <h2>Users</h2>
          <UsersPage onSelectUser={setSelectedUserId} selectedUserId={selectedUserId} />
        </div>

        <div className="panel">
          <h2>User detail</h2>
          <UserDetailPage userId={selectedUserId} />
        </div>

        <div className="panel">
          <h2>Create user</h2>
          <CreateUserForm />
        </div>

        <div className="panel">
          <h2>Carts</h2>
          <CartsPanel />
        </div>
      </section>
    </main>
  );
}
