"use client";

import { useQuery } from "@tanstack/react-query";
import { users } from "../api";

type UsersPageProps = {
  selectedUserId?: number;
  onSelectUser: (userId: number) => void;
};

export function UsersPage({ selectedUserId, onSelectUser }: UsersPageProps) {
  const usersQuery = useQuery({
    ...users.list.build({
      page: 1,
    }),
    staleTime: 60_000,
    retry: 2,
  });

  if (usersQuery.isLoading) {
    return <p>Loading users</p>;
  }

  if (usersQuery.isError) {
    return <p>Could not load users</p>;
  }

  if (!usersQuery.data) {
    return null;
  }

  return (
    <ul className="user-list">
      {usersQuery.data.users.map((user) => (
        <li key={user.id}>
          <button
            type="button"
            aria-pressed={selectedUserId === user.id}
            onClick={() => onSelectUser(user.id)}
          >
            {user.firstName} {user.lastName}
            <br />
            <span className="muted">{user.email}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
