'use client'

import { useCollection } from "react-firebase-hooks/firestore"
import NewDocumentButton from "./NewDocumentButton";
import { useUser } from "@clerk/nextjs";
import { db } from "../../../firebase";
import { query, collectionGroup, where, DocumentData, getDoc, doc as firebaseDoc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor"
  roomId: string;
  userId: string;
  title?: string;
}

function DocumentItem({ doc }: { doc: RoomDocument }) {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  
  useEffect(() => {
    const docRef = firebaseDoc(db, "documents", doc.roomId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setTitle(data?.title || "New Doc");
      }
    });
    
    return () => unsubscribe();
  }, [doc.roomId]);
  
  return (
    <div 
      onClick={() => router.push(`/doc/${doc.roomId}`)}
      className="flex items-center gap-2 p-3 hover:bg-gray-300 rounded-md cursor-pointer border border-gray-300 bg-white shadow-sm"
    >
      <FileText className="h-4 w-4 text-blue-500" />
      <span className="truncate font-medium">{title || "New Doc"}</span>
    </div>
  );
}

function Sidebar() {
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[],
    editor: RoomDocument[]
  }>({
    owner: [],
    editor: []
  });

  const {user} = useUser();
  const [data, loading, error] = useCollection(
    user && (
      query(collectionGroup(db, 'rooms'),
      where("userId", "==", user.emailAddresses[0].toString()))
    )
  )
    
  useEffect(() => {
    if(!data) return;
    const grouped = data.docs.reduce<{
      "owner": RoomDocument[],
      "editor": RoomDocument[]
    }>(
      (acc, curr) => {
        const roomData = curr.data() as RoomDocument;
        if(roomData.role === "owner") {
          acc.owner.push({
            id: curr.id,
            ...roomData
          });
        } else {
          acc.editor.push({
            id: curr.id,
            ...roomData
          });
        }
        return acc;
      }
      ,{
        owner: [],
        editor: []
      }
    )
    setGroupedData(grouped);
  }, [data]);

  if (loading) {
    return (
      <div className="p-2 mid:p-5 bg-gray-200">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-6 w-full bg-gray-300 rounded"></div>
            <div className="h-6 w-full bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 mid:p-5 bg-gray-200">
        <p className="text-red-500">Error loading documents</p>
      </div>
    );
  }

  return (
    <div className="p-2 mid:p-5 bg-gray-200 relative">
      <NewDocumentButton />
      
      <div className="mt-4">
        {groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-sm">
            No room created yet
          </h2>
        ) : (
          <>
            <h2 className="text-gray-500 font-semibold text-sm mb-2">
              My Documents
            </h2>
            <div className="space-y-2">
              {groupedData.owner.map((doc) => (
                <DocumentItem key={doc.roomId} doc={doc} />
              ))}
            </div>
          </>
        )}
      </div>

      {groupedData.editor.length > 0 && (
        <div className="mt-6">
          <h2 className="text-gray-500 font-semibold text-sm mb-2">
            Shared with me
          </h2>
          <div className="space-y-2">
            {groupedData.editor.map((doc) => (
              <DocumentItem key={doc.roomId} doc={doc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;