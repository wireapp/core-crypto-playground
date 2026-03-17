/**
 * CoreCryptoWrapper.ts
 *
 * Singleton wrapper around the `@wireapp/core-crypto` WebAssembly SDK.
 * All direct CoreCrypto API calls are centralised here so that the rest of
 * the application only depends on these higher-level helper functions.
 *
 * Initialisation happens once — subsequent calls to any exported function
 * reuse the same `CoreCrypto` instance without re-loading the WASM module.
 */
import {
  initWasmModule,
  CoreCrypto,
  Ciphersuite,
  DatabaseKey,
  ClientId,
  ConversationId,
  CredentialType,
  WireIdentity,
} from "@wireapp/core-crypto";

/** The fully-qualified Wire user ID used throughout the app (`handle:deviceId@domain`). */
const USER_ID = "LcksJb74Tm6N12cDjFy7lQ:8e6424430d3b28be@world.com";

let instance: CoreCrypto | null = null;
let instancePromise: Promise<CoreCrypto> | null = null;
let conversationDemoPromise: Promise<ConversationDemoResult> | null = null;

export interface ConversationDemoResult {
  conversationExists: boolean;
  identities: WireIdentity[];
}

/**
 * Returns the singleton `CoreCrypto` instance.
 * Initialises the WASM module and creates the client on the first call;
 * subsequent calls return the cached instance immediately.
 */
export async function getCoreCryptoInstance(): Promise<CoreCrypto> {
  if (instance) {
    return instance;
  }

  if (!instancePromise) {
    try {
      instancePromise = (async () => {
        await initWasmModule("/");
        const clientId = new ClientId(new TextEncoder().encode(USER_ID));
        const createdInstance = await CoreCrypto.init({
          ciphersuites: [Ciphersuite.MLS_128_DHKEMP256_AES128GCM_SHA256_P256],
          clientId,
          databaseName: "test-database",
          key: new DatabaseKey(crypto.getRandomValues(new Uint8Array(32))),
        });
        instance = createdInstance;
        return createdInstance;
      })()
    } catch (error: unknown) {
      instancePromise = null;
      throw error;
    }
  }

  return instancePromise;
}

/**
 * Returns `true` if a conversation with the given ID already exists
 * in the local CoreCrypto store.
 */
export async function checkConversationExists(
  conversationId: ConversationId,
): Promise<boolean> {
  const client = await getCoreCryptoInstance();
  return client.conversationExists(conversationId);
}

/**
 * Creates a new MLS conversation with Basic credentials and returns the
 * `WireIdentity` list for the current user's handle.
 */
export async function createConversationAndGetIdentities(
  conversationId: ConversationId,
): Promise<WireIdentity[]> {
  const client = await getCoreCryptoInstance();
  const result = await client.transaction(async (ctx) => {
    await ctx.createConversation(conversationId, CredentialType.Basic);
    return await ctx.getUserIdentities(conversationId, [USER_ID.split(":")[0]]);
  });
  console.log("Transaction result:", result);
  return Array.from(result.values()).flat();
}

/**
 * Runs the demo flow exactly once so React Strict Mode in development does
 * not re-enter the CoreCrypto bootstrap sequence.
 */
export async function loadConversationDemo(): Promise<ConversationDemoResult> {
  if (!conversationDemoPromise) {
    try {
      conversationDemoPromise = (async () => {
        const conversationId = await createConversationID();
        const conversationExists = await checkConversationExists(conversationId);
        const identities = await createConversationAndGetIdentities(
          conversationId,
        );

        return {
          conversationExists,
          identities,
        };
      })()
    }
    catch (error: unknown) {
      conversationDemoPromise = null;
      throw error;
    };
  }

  return conversationDemoPromise;
}

/**
 * Generates a new random `ConversationId` after ensuring the CoreCrypto
 * instance is ready.
 */
export async function createConversationID(): Promise<ConversationId> {
  await getCoreCryptoInstance();
  const conversationId = new ConversationId(
    crypto.getRandomValues(new Uint8Array(32)),
  );
  return conversationId;
}

export { USER_ID };
