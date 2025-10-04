// // import withSerwist from "@serwist/next";

// // /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   env: {
// //     NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
// //     API_KEY: "zk-123321",
// //     NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
// //     NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
// //     NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
// //     NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
// //     NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
// //     NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
// //     NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
// //     NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
// //     NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
// //     NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
// //     NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
// //     NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
// //     NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
// //     NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
// //       process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
// //     NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
// //       process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
// //     NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
// //       process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
// //     NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
// //     NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
// //       process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
// //     NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
// //       process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
// //     NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
// //     NEXT_PUBLIC_CENTRAL_WALLET_SECRET: process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
// //   },
// //   experimental: {
// //     // Loosen ESM externals handling
// //     esmExternals: "loose",
// //   },
// //   // Force Next.js to compile these packages as part of your code
// //   transpilePackages: [
// //     "@3land/listings-sdk",
// //     "node-fetch",
// //     "solana-agent-kit",
// //   ],
// // };

// // const serwistConfig = withSerwist({
// //   swSrc: "app/sw.ts",
// //   swDest: "public/sw.js",
// // });

// // // Merge both configs
// // export default {
// //   ...nextConfig,
// //   ...serwistConfig,
// // };

// import withSerwist from "@serwist/next";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   // i18n: {
//   //   locales: ["en", "ko"],
//   //   defaultLocale: "en",
//   //   localeDetection: true,
//   // },
//   env: {
//     NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
//     API_KEY: "zk-123321",
//     NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
//     NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
//     NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
//     NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
//     NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
//     NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
//     NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
//     NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
//     NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
//     NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
//     NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
//     NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
//     NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
//       process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
//     NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
//     NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
//     NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
//     NEXT_PUBLIC_CENTRAL_WALLET_SECRET:
//       process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
//     NEXT_PUBLIC_VIDEO_LIPSYNC: process.env.NEXT_PUBLIC_VIDEO_LIPSYNC,
//     NEXT_PUBLIC_VOICE_CLONE: process.env.NEXT_PUBLIC_VOICE_CLONE,
//     NEXT_PUBLIC_SWAP_AUTOMATE: process.env.NEXT_PUBLIC_SWAP_AUTOMATE,
//     NEXT_PUBLIC_SWAP_AUTHENTICATE: process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE,
//     // NEXT_PUBLIC_KIMA_API: process.env.NEXT_PUBLIC_KIMA_API,
//     NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
//     NEXT_PUBLIC_WAN_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_WAN_IMG_TO_VIDEO,
//     NEXT_PUBLIC_LANDWOLF_HIGH: process.env.NEXT_PUBLIC_LANDWOLF_HIGH,
//     NEXT_PUBLIC_VIDEO_GEN_ENDPOINT: process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT,
//     NEXT_PUBLIC_PREDICTION_API: process.env.NEXT_PUBLIC_PREDICTION_API,
//     NEXT_PUBLIC_PAST_PREDICTION_API:
//       process.env.NEXT_PUBLIC_PAST_PREDICTION_API,
//     NEXT_PUBLIC_TRANSAK_API_KEY_STAGING:
//       process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING,
//     NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION:
//       process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION,
//     NEXT_PUBLIC_RECEIVING_WALLET: process.env.NEXT_PUBLIC_RECEIVING_WALLET,
//   },
//   experimental: {
//     esmExternals: "loose",
//   },
//   transpilePackages: [
//     "@3land/listings-sdk",
//     "node-fetch",
//     "solana-agent-kit",
//     "@aarc-xyz/fundkit-web-sdk",
//     "@aarc-xyz/eth-connector",
//     "@tanstack/react-query",
//     "@rainbow-me/rainbowkit",
//     "viem",
//     "wagmi",
//   ],
//   webpack: (config, { isServer }) => {
//     if (isServer) {
//       // Prevent webpack from bundling native .node files. These should be loaded by Node.js at runtime.
//       config.externals.push(({ request }, callback) => {
//         if (request && request.endsWith(".node")) {
//           return callback(null, "commonjs " + request);
//         }
//         callback();
//       });
//     }
//     config.module.rules.unshift({
//       test: /\.m?js$/,
//       include:
//         /node_modules\/(@aarc-xyz\/(?:fundkit-web-sdk|eth-connector)|@tanstack\/react-query|@rainbow-me\/rainbowkit|viem|wagmi)/,
//       type: "javascript/auto",
//     });

//     return config;
//   },
// };

// const serwistConfig = withSerwist({
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
// });

// // Merge both configurations and export
// const config = {
//   ...nextConfig,
//   ...serwistConfig,
// };

// export default config;

// import withSerwist from "@serwist/next";

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   env: {
//     NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
//     API_KEY: "zk-123321",
//     NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
//     NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
//     NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
//     NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
//     NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
//     NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
//     NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
//     NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
//     NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
//     NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
//     NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
//     NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
//     NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
//     NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
//       process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
//     NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
//     NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
//       process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
//     NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
//       process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
//     NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
//     NEXT_PUBLIC_CENTRAL_WALLET_SECRET:
//       process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
//     NEXT_PUBLIC_VIDEO_LIPSYNC: process.env.NEXT_PUBLIC_VIDEO_LIPSYNC,
//     NEXT_PUBLIC_VOICE_CLONE: process.env.NEXT_PUBLIC_VOICE_CLONE,
//     NEXT_PUBLIC_SWAP_AUTOMATE: process.env.NEXT_PUBLIC_SWAP_AUTOMATE,
//     NEXT_PUBLIC_SWAP_AUTHENTICATE: process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE,
//     NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
//     NEXT_PUBLIC_WAN_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_WAN_IMG_TO_VIDEO,
//     NEXT_PUBLIC_LANDWOLF_HIGH: process.env.NEXT_PUBLIC_LANDWOLF_HIGH,
//     NEXT_PUBLIC_VIDEO_GEN_ENDPOINT: process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT,
//     NEXT_PUBLIC_PREDICTION_API: process.env.NEXT_PUBLIC_PREDICTION_API,
//     NEXT_PUBLIC_PAST_PREDICTION_API:
//       process.env.NEXT_PUBLIC_PAST_PREDICTION_API,
//     NEXT_PUBLIC_TRANSAK_API_KEY_STAGING:
//       process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING,
//     NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION:
//       process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION,
//     NEXT_PUBLIC_RECEIVING_WALLET: process.env.NEXT_PUBLIC_RECEIVING_WALLET,
//     NEXT_PUBLIC_APIFY_TOKEN: process.env.NEXT_PUBLIC_APIFY_TOKEN,
//     NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS:
//       process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS,
//     NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS:
//       process.env.NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS,
//   },
//   experimental: {
//     esmExternals: "loose",
//   },
//   transpilePackages: [
//     "@3land/listings-sdk",
//     "node-fetch",
//     "solana-agent-kit",
//     "@aarc-xyz/fundkit-web-sdk",
//     "@aarc-xyz/eth-connector",
//     "@tanstack/react-query",
//     "@rainbow-me/rainbowkit",
//     "viem",
//     "wagmi",
//   ],
//   webpack: (config, { isServer, dev }) => {
//     if (isServer) {
//       // Prevent webpack from bundling native .node files
//       config.externals.push(({ request }, callback) => {
//         if (request && request.endsWith(".node")) {
//           return callback(null, "commonjs " + request);
//         }
//         callback();
//       });
//     }

//     // Handle module resolution for problematic packages
//     config.module.rules.unshift({
//       test: /\.m?js$/,
//       include:
//         /node_modules\/(@aarc-xyz\/(?:fundkit-web-sdk|eth-connector)|@tanstack\/react-query|@rainbow-me\/rainbowkit|viem|wagmi)/,
//       type: "javascript/auto",
//     });

//     // Fix the Terser issue with worker files
//     if (!dev && !isServer) {
//       // Configure Terser to handle worker files properly
//       config.optimization.minimizer = config.optimization.minimizer.map(
//         (plugin) => {
//           if (plugin.constructor.name === "TerserPlugin") {
//             plugin.options = {
//               ...plugin.options,
//               exclude: [/HeartbeatWorker/, /\.worker\.js$/],
//               terserOptions: {
//                 ...plugin.options.terserOptions,
//                 parse: {
//                   ...plugin.options.terserOptions?.parse,
//                   // Allow top level await and import/export
//                   ecma: 2020,
//                 },
//                 compress: {
//                   ...plugin.options.terserOptions?.compress,
//                   // Don't compress modules with import/export
//                   module: true,
//                 },
//                 mangle: {
//                   ...plugin.options.terserOptions?.mangle,
//                   // Don't mangle module exports
//                   module: true,
//                 },
//               },
//             };
//           }
//           return plugin;
//         }
//       );

//       // Alternative: exclude problematic files entirely from minification
//       config.optimization.minimizer.push({
//         apply: (compiler) => {
//           compiler.hooks.compilation.tap(
//             "ExcludeWorkerFiles",
//             (compilation) => {
//               compilation.hooks.shouldRecord.tap("ExcludeWorkerFiles", () => {
//                 // Skip files that cause issues
//                 Object.keys(compilation.assets).forEach((filename) => {
//                   if (
//                     filename.includes("HeartbeatWorker") ||
//                     filename.includes("Worker.js")
//                   ) {
//                     delete compilation.assets[filename];
//                   }
//                 });
//               });
//             }
//           );
//         },
//       });
//     }

//     // Handle worker files properly
//     config.module.rules.push({
//       test: /\.worker\.js$/,
//       use: [
//         {
//           loader: "file-loader",
//           options: {
//             name: "static/workers/[name].[hash].js",
//             publicPath: "/_next/",
//           },
//         },
//       ],
//     });

//     return config;
//   },
// };

// const serwistConfig = withSerwist({
//   swSrc: "app/sw.ts",
//   swDest: "public/sw.js",
// });

// // Merge both configurations and export
// const config = {
//   ...nextConfig,
//   ...serwistConfig,
// };

// export default config;

import withSerwist from "@serwist/next";
import { createCivicAuthPlugin } from "@civic/auth/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BASE_URL: "https://zynapse.zkagi.ai",
    API_KEY: "zk-123321",
    NEXT_PUBLIC_LIP_SYNC: process.env.NEXT_PUBLIC_LIP_SYNC,
    NEXT_PUBLIC_LANDWOLF: process.env.NEXT_PUBLIC_LANDWOLF,
    NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
    NEXT_PUBLIC_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_IMG_TO_VIDEO,
    NEXT_PUBLIC_RPC_ENDPOINT: process.env.NEXT_PUBLIC_RPC_ENDPOINT,
    NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY,
    NEXT_PUBLIC_PINATA_API_SECRET: process.env.NEXT_PUBLIC_PINATA_API_SECRET,
    NEXT_PUBLIC_PMP_PROGRAM_ID: process.env.NEXT_PUBLIC_PMP_PROGRAM_ID,
    NEXT_PUBLIC_MISTRAL_MODEL: process.env.NEXT_PUBLIC_MISTRAL_MODEL,
    NEXT_PUBLIC_DEEPSEEK_BASE_URL: process.env.NEXT_PUBLIC_DEEPSEEK_BASE_URL,
    NEXT_PUBLIC_DEEPSEEK_MODEL: process.env.NEXT_PUBLIC_DEEPSEEK_MODEL,
    NEXT_PUBLIC_OPENAI_BASE_URL: process.env.NEXT_PUBLIC_OPENAI_BASE_URL,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_GET_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT:
      process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT,
    NEXT_PUBLIC_SOL_PRICE_ENDPOINT: process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT,
    NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT:
      process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT,
    NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT:
      process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT,
    NEXT_PUBLIC_TREASURY: process.env.NEXT_PUBLIC_TREASURY,
    NEXT_PUBLIC_CENTRAL_WALLET_SECRET:
      process.env.NEXT_PUBLIC_CENTRAL_WALLET_SECRET,
    NEXT_PUBLIC_VIDEO_LIPSYNC: process.env.NEXT_PUBLIC_VIDEO_LIPSYNC,
    NEXT_PUBLIC_VOICE_CLONE: process.env.NEXT_PUBLIC_VOICE_CLONE,
    NEXT_PUBLIC_SWAP_AUTOMATE: process.env.NEXT_PUBLIC_SWAP_AUTOMATE,
    NEXT_PUBLIC_SWAP_AUTHENTICATE: process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE,
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    NEXT_PUBLIC_WAN_IMG_TO_VIDEO: process.env.NEXT_PUBLIC_WAN_IMG_TO_VIDEO,
    NEXT_PUBLIC_LANDWOLF_HIGH: process.env.NEXT_PUBLIC_LANDWOLF_HIGH,
    NEXT_PUBLIC_VIDEO_GEN_ENDPOINT: process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT,
    NEXT_PUBLIC_PREDICTION_API: process.env.NEXT_PUBLIC_PREDICTION_API,
    NEXT_PUBLIC_PAST_PREDICTION_API:
      process.env.NEXT_PUBLIC_PAST_PREDICTION_API,
    NEXT_PUBLIC_TRANSAK_API_KEY_STAGING:
      process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING,
    NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION:
      process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION,
    NEXT_PUBLIC_RECEIVING_WALLET: process.env.NEXT_PUBLIC_RECEIVING_WALLET,
    NEXT_PUBLIC_APIFY_TOKEN: process.env.NEXT_PUBLIC_APIFY_TOKEN,
    NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS:
      process.env.NEXT_PUBLIC_SOLANA_MERCHANT_ADDRESS,
    NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS:
      process.env.NEXT_PUBLIC_SOLANA_USDC_MINT_ADDRESS,
    NEXT_PUBLIC_HL_PRIVATE_KEY: process.env.NEXT_PUBLIC_HL_PRIVATE_KEY,
    NEXT_PUBLIC_HL_CHAIN: process.env.NEXT_PUBLIC_HL_CHAIN,
    NEXT_PUBLIC_HL_SIGNATURE_CHAIN_ID:
      process.env.NEXT_PUBLIC_HL_SIGNATURE_CHAIN_ID,
    NEXT_PUBLIC_HL_MAIN_WALLET: process.env.NEXT_PUBLIC_HL_MAIN_WALLET,
    NEXT_PUBLIC_HL_USER_WALLET: process.env.NEXT_PUBLIC_HL_USER_WALLET,
    NEXT_PUBLIC_CHAINGPT_API_KEY: process.env.NEXT_PUBLIC_CHAINGPT_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_SECRET_KEY:process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET:process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID:process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID:process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
    NEXT_PUBLIC_CIVIC_CLIENT_ID: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID,
    NEXT_PUBLIC_PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    REVIEWS_API_URL: process.env.REVIEWS_API_URL
  },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: [
    "@3land/listings-sdk",
    "node-fetch",
    "solana-agent-kit",
    "@aarc-xyz/fundkit-web-sdk",
    "@aarc-xyz/eth-connector",
    "@tanstack/react-query",
    "@rainbow-me/rainbowkit",
    "viem",
    "wagmi",
  ],
  webpack: (config, { isServer, dev }) => {
    // ===== ADD THIS SECTION FOR WEB3 FIX =====
    if (!isServer) {
      // Fix for Web3 libraries in Vercel - prevents crypto/fs errors
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        querystring: false,
        buffer: false,
      };
    }

    // Externalize problematic crypto dependencies
    config.externals = config.externals || [];
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      encoding: "commonjs encoding",
    });

    // Ignore pino-pretty to fix the warning
    config.resolve.alias = {
      ...config.resolve.alias,
      "pino-pretty": false,
    };
    // ===== END WEB3 FIX SECTION =====

    if (isServer) {
      // Prevent webpack from bundling native .node files
      config.externals.push(({ request }, callback) => {
        if (request && request.endsWith(".node")) {
          return callback(null, "commonjs " + request);
        }
        callback();
      });
    }

    // Handle module resolution for problematic packages
    config.module.rules.unshift({
      test: /\.m?js$/,
      include:
        /node_modules\/(@aarc-xyz\/(?:fundkit-web-sdk|eth-connector)|@tanstack\/react-query|@rainbow-me\/rainbowkit|viem|wagmi)/,
      type: "javascript/auto",
    });

    // Fix the Terser issue with worker files
    if (!dev && !isServer) {
      // Configure Terser to handle worker files properly
      config.optimization.minimizer = config.optimization.minimizer.map(
        (plugin) => {
          if (plugin.constructor.name === "TerserPlugin") {
            plugin.options = {
              ...plugin.options,
              exclude: [/HeartbeatWorker/, /\.worker\.js$/],
              terserOptions: {
                ...plugin.options.terserOptions,
                parse: {
                  ...plugin.options.terserOptions?.parse,
                  // Allow top level await and import/export
                  ecma: 2020,
                },
                compress: {
                  ...plugin.options.terserOptions?.compress,
                  // Don't compress modules with import/export
                  module: true,
                },
                mangle: {
                  ...plugin.options.terserOptions?.mangle,
                  // Don't mangle module exports
                  module: true,
                },
              },
            };
          }
          return plugin;
        }
      );

      // Alternative: exclude problematic files entirely from minification
      config.optimization.minimizer.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap(
            "ExcludeWorkerFiles",
            (compilation) => {
              compilation.hooks.shouldRecord.tap("ExcludeWorkerFiles", () => {
                // Skip files that cause issues
                Object.keys(compilation.assets).forEach((filename) => {
                  if (
                    filename.includes("HeartbeatWorker") ||
                    filename.includes("Worker.js")
                  ) {
                    delete compilation.assets[filename];
                  }
                });
              });
            }
          );
        },
      });
    }

    // Handle worker files properly
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: "static/workers/[name].[hash].js",
            publicPath: "/_next/",
          },
        },
      ],
    });

    return config;
  },
};

const serwistConfig = withSerwist({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const withCivicAuth = createCivicAuthPlugin({
  clientId: process.env.NEXT_PUBLIC_CIVIC_CLIENT_ID || "",
  enableSolanaWalletAdapter: true,
});

// Merge both configurations and export
const config = {
  ...nextConfig,
  ...serwistConfig,
};

export default config;
