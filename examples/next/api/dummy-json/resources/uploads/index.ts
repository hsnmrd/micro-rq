import { apiDummy } from "../..";
import { createUploadFetcher } from "./upload-fetcher";

export type UploadInput = {
  file: File;
  title: string;
};

export type UploadResponse = {
  status: string;
  message: string;
};

export const uploadApi = apiDummy.extend({
  name: "dummy-json-upload",
  fetcher: createUploadFetcher("demo-upload"),
});

export const uploads = uploadApi.resource("uploads", {
  demo: uploadApi.post<UploadResponse, UploadInput>("/http/201/uploaded", {
    authMode: "none",
    bodyType: "form-data",
    body: ({ file, title }) => ({
      file,
      title,
      uploadedAt: new Date(),
    }),
  }),
});

export { resetUploadProgress, useUploadProgress } from "./progress";
