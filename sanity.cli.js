import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID || "2r3rfhwf",
    dataset: process.env.SANITY_STUDIO_DATASET || process.env.VITE_SANITY_DATASET || "production"
  },
  deployment: {
    appId: "l34ujcr5y35z8q969m95nc6x"
  }
});
