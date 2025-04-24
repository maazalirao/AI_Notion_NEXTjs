import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";
import * as Y from "yjs";
import LiveblocksProvider from "@liveblocks/yjs";
import { BlockNoteEditor } from "@blocknote/core";

// Types for our Liveblocks room
type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  color: string;
  isTyping: boolean;
};

type Storage = {
  editorContent: LiveblocksProvider<Y.Doc>;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
    picture?: string;
  };
};

type RoomEvent = {};

export const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useObject,
    useMap,
    useList,
    useBatch,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent>(client); 