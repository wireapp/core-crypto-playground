import { useEffect, useState } from "react";
import { WireIdentity } from "@wireapp/core-crypto";
import {
  checkConversationExists,
  createConversationAndGetIdentities,
  createConversationID,
} from "./CoreCryptoWrapper";

function App() {
  const [isConversationExists, setIsConversationExists] =
    useState<boolean>(true);
  const [wireIdentities, setWireIdentities] = useState<WireIdentity[]>([]);

  useEffect(() => {
    const initialize = async () => {
      const conversationId = await createConversationID();
      try {
        const conversationExists =
          await checkConversationExists(conversationId);
        setIsConversationExists(conversationExists);

        const identities =
          await createConversationAndGetIdentities(conversationId);
        setWireIdentities(identities);
      } catch (error) {
        console.error("Error during transaction:", error);
      }
    };

    initialize();
  }, []);

  return (
    <>
      <>{isConversationExists ? "Conversation exists" : "No conversation"}</>
      <br />
      <>{JSON.stringify(wireIdentities)}</>
    </>
  );
}

export default App;
