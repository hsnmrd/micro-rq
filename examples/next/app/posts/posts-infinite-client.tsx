"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { posts } from "../../api/dummy-json/resources";

export function PostsInfiniteClient() {
  const query = useInfiniteQuery({
    queryKey: ["demo", "posts", "infinite"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      posts.list.fn({
        limit: 8,
        skip: pageParam,
        sortBy: "views",
        order: "desc",
      })(),
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;

      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });

  return (
    <section className="mx-auto max-w-5xl px-5 py-6">
      <div className="grid gap-4">
        {query.data?.pages.flatMap((page) =>
          page.posts.map((post) => (
            <article className="rounded-lg border border-neutral-200 bg-white p-5" key={`${page.skip}-${post.id}`}>
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-neutral-600">{post.body}</p>
              <div className="mt-3 text-xs uppercase tracking-wide text-neutral-500">
                {post.views} views · {post.reactions.likes} likes
              </div>
            </article>
          )),
        )}
      </div>
      <button
        className="button-primary mt-5"
        disabled={!query.hasNextPage || query.isFetchingNextPage}
        type="button"
        onClick={() => query.fetchNextPage()}
      >
        {query.isFetchingNextPage ? "Loading" : "Load more posts"}
      </button>
    </section>
  );
}
