import { useEffect, useState } from "react";
import { WireIdentity } from "@wireapp/core-crypto";
import {
  loadConversationDemo,
} from "./CoreCryptoWrapper";

function App() {
  const [isConversationExists, setIsConversationExists] =
    useState<boolean>(true);
  const [wireIdentities, setWireIdentities] = useState<WireIdentity[]>([]);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      try {
        const { conversationExists, identities } = await loadConversationDemo();
        if (!isActive) {
          return;
        }

        setIsConversationExists(conversationExists);
        setWireIdentities(identities);
      } catch (error) {
        console.error("Error during transaction:", error);
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
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
