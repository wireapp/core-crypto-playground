# my-app — Wire CoreCrypto Playground

A minimal React + TypeScript + Vite app for exploring the [`@wireapp/core-crypto`](https://github.com/wireapp/core-crypto) WebAssembly library. It demonstrates MLS (Messaging Layer Security) conversation creation and identity resolution using the Wire end-to-end encryption SDK.

## Getting Started

```bash
npm install
npm run dev
```

The app is served at `http://localhost:5173`.

> **Note:** The WASM binary (`core-crypto-ffi_bg.wasm`) must be served from the root `/`. Vite is configured to copy it to `public/` automatically.

## Project Structure

```
src/
  CoreCryptoWrapper.ts   # Singleton CoreCrypto instance + all crypto logic
  App.tsx                # UI — consumes wrapper functions, renders results
  main.tsx               # React entry point
public/                  # Static assets (WASM binary served from here)
```

## Architecture

All `@wireapp/core-crypto` interactions are encapsulated in `CoreCryptoWrapper.ts`. `App.tsx` only calls the exported helper functions and manages UI state — it has no direct dependency on the CoreCrypto API.

### CoreCryptoWrapper.ts — Exported API

| Function | Description |
|---|---|
| `getCoreCryptoInstance()` | Returns the singleton `CoreCrypto` instance, initializing it once on first call. |
| `createConversationID()` | Generates a random `ConversationId`. |
| `checkConversationExists(id)` | Returns `true` if the given conversation exists in the local store. |
| `createConversationAndGetIdentities(id)` | Creates an MLS conversation and returns the `WireIdentity[]` for the current user. |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

## Dependencies

- [`@wireapp/core-crypto@9.0.0`](https://www.npmjs.com/package/@wireapp/core-crypto) — Wire MLS/Proteus E2E encryption SDK (WASM)
- React 19, Vite, TypeScript
