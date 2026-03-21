import { generateReactHelpers } from "@uploadthing/react";

// The URL for the UploadThing API, we'll route it directly to their service
export const url = "https://server.uploadthing.com/api/uploadthing";

// This generates the hook and components we need for React
export const { useUploadThing, uploadFiles } = generateReactHelpers({
  url: url,
});
