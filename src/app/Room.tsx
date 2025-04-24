"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";

export function Room({ children, roomId }: { children: ReactNode; roomId: string }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_097lH7K1lkxlF5AlKNk8wSGl61yyynSQtwXAx2gR33_bhaqaGBBwTqqFWaFcAEAr"}>
      <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<div>Loading editor...</div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
} 