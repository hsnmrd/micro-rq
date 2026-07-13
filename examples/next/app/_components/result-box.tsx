import { describeError } from "./error-format";

export function ResultBox({ value, error }: { value: string; error: unknown }) {
  return (
    <div className="mt-3 rounded-md bg-neutral-100 p-3 text-sm">
      {error ? <p className="text-red-700">{describeError(error)}</p> : <p className="wrap-break-words text-neutral-700">{value}</p>}
    </div>
  );
}
