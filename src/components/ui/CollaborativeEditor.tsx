"use client";

import { useEffect, useState } from "react";
import { useRoom, useOthers, useMyPresence, useStorage } from "../../liveblocks.config";
import { BlockNoteEditor } from "@blocknote/core";
import { BlockNoteView, useBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import * as Y from "yjs";

interface CollaborativeEditorProps {
  documentId: string;
}

// Create a component that displays all the other cursors
function OtherCursors() {
  const others = useOthers();
  
  return (
    <div className="absolute top-2 right-2 flex gap-1">
      {others.map((user) => (
        <div
          key={user.connectionId}
          className="flex items-center rounded-full px-2 py-1 text-xs"
          style={{ backgroundColor: user.info.color }}
        >
          {user.info.name}
          {user.presence.isTyping && (
            <span className="ml-1">✍️</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CollaborativeEditor({ documentId }: CollaborativeEditorProps) {
  const [editorReady, setEditorReady] = useState(false);
  const room = useRoom();
  const [myPresence, updateMyPresence] = useMyPresence();
  const storage = useStorage();
  
  // Set up the editor with Liveblocks
  const editor = useBlockNote({
    editable: true,
    collaborative: {
      provideExtensions: (ydoc) => {
        // If storage isn't ready yet, return null
        if (!storage) return null;
        
        // Get or create the Liveblocks provider
        let provider = storage.get("editorContent") as LiveblocksYjsProvider;
        
        if (!provider) {
          provider = new LiveblocksYjsProvider(ydoc, room);
          storage.set("editorContent", provider);
        }
        
        // Return the provider
        return [provider.awareness];
      },
    },
  });
  
  useEffect(() => {
    // Mark the editor as ready once storage is available
    if (storage && editor && !editorReady) {
      setEditorReady(true);
    }
  }, [storage, editor, editorReady]);
  
  // Track user typing state
  useEffect(() => {
    if (!editor) return;
    
    const handleKeyDown = () => {
      updateMyPresence({ isTyping: true });
      
      // Debounce to stop "typing" indicator after 1 second of inactivity
      const timeout = setTimeout(() => {
        updateMyPresence({ isTyping: false });
      }, 1000);
      
      return () => clearTimeout(timeout);
    };
    
    // Listen for keydown events on the editor element
    editor.domElement?.addEventListener("keydown", handleKeyDown);
    
    return () => {
      editor.domElement?.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, updateMyPresence]);
  
  // Block editor view
  return (
    <div className="relative border rounded-md w-full min-h-[500px] shadow-sm bg-white">
      <OtherCursors />
      
      {editorReady ? (
        <BlockNoteView
          editor={editor}
          className="p-4 min-h-[500px]"
          theme="light"
        />
      ) : (
        <div className="flex justify-center items-center h-[500px]">
          <div className="animate-pulse">Loading editor...</div>
        </div>
      )}
    </div>
  );
} 