"use client";

import { useQuery } from "@tanstack/react-query";
import { users } from "../api";

type UserDetailPageProps = {
  userId?: number;
};

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const userQuery = useQuery({
    ...users.detail.build(userId ?? 0),
    enabled: Boolean(userId),
  });

  if (!userId) {
    return <p className="muted">Select a user.</p>;
  }

  if (userQuery.isLoading) {
    return <p>Loading user</p>;
  }

  if (userQuery.isError) {
    return <p>Could not load user.</p>;
  }

  if (!userQuery.data) {
    return null;
  }

  return (
    <div className="stack">
      <strong>
        {userQuery.data.firstName} {userQuery.data.lastName}
      </strong>
      <span className="muted">{userQuery.data.email}</span>
      <code>{userQuery.data.id}</code>
    </div>
  );
}
