"use client"

import React, { Suspense } from "react";
import { RoomProvider } from "../../liveblocks.config";
import CollaborativeEditor from "./CollaborativeEditor";

function DocumentSkeleton() {
  return (
    <div className="w-full p-4">
      <div className="h-8 w-64 bg-gray-200 animate-pulse rounded-md mb-4"></div>
      <div className="h-96 bg-gray-100 animate-pulse rounded-md"></div>
    </div>
  );
}

function Document({ id }: { id: string }) {
  return (
    <RoomProvider
      id={id}
      initialPresence={{
        cursor: null,
        name: "",
        color: "",
        isTyping: false,
      }}
      initialStorage={() => ({
        editorContent: null,
      })}
    >
      <Suspense fallback={<DocumentSkeleton />}>
        <div className="w-full p-4">
          <CollaborativeEditor documentId={id} />
        </div>
      </Suspense>
    </RoomProvider>
  );
}

export default Document;