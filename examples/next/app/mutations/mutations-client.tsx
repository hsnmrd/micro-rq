"use client";

import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { FormEvent } from "react";
import {
  carts,
  posts,
  products,
  resetUploadProgress,
  uploads,
  users,
  useUploadProgress,
} from "../../api/dummy-json/resources";
import { ResultBox } from "../_components/result-box";

export function MutationsClient() {
  const queryClient = useQueryClient();
  const dashboardQueries = useQueries({
    queries: [
      {
        ...users.list.toQuery({ limit: 4, skip: 0, select: ["firstName", "lastName", "email"] }),
        staleTime: 60_000,
      },
      {
        ...carts.list.toQuery({ limit: 2, skip: 0 }),
        staleTime: 60_000,
      },
      {
        ...posts.list.toQuery({ limit: 3, skip: 0, tag: "history" }),
        staleTime: 60_000,
      },
    ],
  });
  const createProduct = useMutation({
    ...products.create.toMutation(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: products.list.baseKey() }),
  });
  const updateProduct = useMutation({
    ...products.update.toMutation(),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: products.detail.key(product.id) });
      queryClient.invalidateQueries({ queryKey: products.list.baseKey() });
    },
  });
  const patchProduct = useMutation({
    ...products.patch.toMutation(),
    onSuccess: (product) => queryClient.invalidateQueries({ queryKey: products.detail.key(product.id) }),
  });
  const deleteProduct = useMutation({
    ...products.remove.toMutation(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: products.list.baseKey() }),
  });
  const uploadProgress = useUploadProgress("demo-upload");
  const upload = useMutation({
    ...uploads.demo.toMutation(),
    onMutate: () => resetUploadProgress("demo-upload"),
  });

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    createProduct.mutate({
      title: String(form.get("title") || "Micro RQ demo product"),
      price: Number(form.get("price") || 49),
      category: String(form.get("category") || "beauty"),
    });
  }

  function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("file");

    if (file instanceof File) {
      upload.mutate({
        file,
        title: String(form.get("title") || file.name),
      });
    }
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold">Multiple clients</h2>
        <p className="mt-1 text-sm text-neutral-600">useQueries reads users, carts, and posts with separate resource keys.</p>
        <MiniList title="Users" items={dashboardQueries[0].data?.users.map((user) => `${user.firstName} ${user.lastName}`) ?? []} />
        <MiniList title="Carts" items={dashboardQueries[1].data?.carts.map((cart) => `Cart #${cart.id}`) ?? []} />
        <MiniList title="Posts" items={dashboardQueries[2].data?.posts.map((post) => post.title) ?? []} />
      </aside>

      <div className="grid gap-5">
        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Product mutations</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]" onSubmit={handleCreate}>
            <input className="field" name="title" defaultValue="Micro RQ demo product" aria-label="Product title" />
            <input className="field" name="price" defaultValue="49" type="number" aria-label="Product price" />
            <input className="field sm:col-span-2" name="category" defaultValue="beauty" aria-label="Product category" />
            <button className="button-primary sm:col-span-2" type="submit">
              POST /products/add
            </button>
          </form>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <button
              className="button-secondary"
              type="button"
              onClick={() => updateProduct.mutate({ id: 1, traceId: "demo-trace", body: { title: "Updated by PUT", stock: 42 } })}
            >
              PUT product
            </button>
            <button className="button-secondary" type="button" onClick={() => patchProduct.mutate({ id: 1, body: { title: "Patched title" } })}>
              PATCH product
            </button>
            <button className="button-danger" type="button" onClick={() => deleteProduct.mutate(1)}>
              DELETE product
            </button>
          </div>
          <ResultBox
            value={
              createProduct.data
                ? `Created #${createProduct.data.id}`
                : updateProduct.data
                  ? `Updated #${updateProduct.data.id}`
                  : patchProduct.data
                    ? `Patched #${patchProduct.data.id}`
                    : deleteProduct.data
                      ? `Deleted #${deleteProduct.data.id}`
                      : "No mutation yet"
            }
            error={createProduct.error ?? updateProduct.error ?? patchProduct.error ?? deleteProduct.error}
          />
        </section>

        <section className="rounded-lg border border-neutral-200 bg-white p-5">
          <h2 className="font-semibold">Upload</h2>
          <p className="mt-1 text-sm text-neutral-600">FormData bodyType and a custom XHR fetcher expose upload progress.</p>
          <form className="mt-4 space-y-3" onSubmit={handleUpload}>
            <input className="field" name="title" defaultValue="Receipt image" aria-label="Upload title" />
            <input className="field" name="file" type="file" />
            <button className="button-primary" type="submit">
              Upload file
            </button>
            <progress className="h-2 w-full" max={100} value={uploadProgress}>
              {uploadProgress}%
            </progress>
          </form>
          <ResultBox value={upload.data ? JSON.stringify(upload.data) : "Ready"} error={upload.error} />
        </section>
      </div>
    </section>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm text-neutral-600">
        {items.map((item) => (
          <li className="truncate" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
