import withSerwist from "@serwist/next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
    API_KEY: "zk-123321",
    NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
    // NEXT_PUBLIC_OPENAI_BASE_URL:NEXT_PUBLIC_OPENAI_BASE_URL,
    // NEXT_PUBLIC_OPENAI_API_KEY:NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
    NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
  },
};

const serwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

export default {
  ...nextConfig,
  ...serwistConfig,
};
