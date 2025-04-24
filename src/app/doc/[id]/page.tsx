"use client"

import { useParams } from "next/navigation"
import Document from "../../../components/ui/Document"
import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { db } from "../../../../firebase"
import { doc, updateDoc, onSnapshot, collection, getDocs, query, where, setDoc, getDoc } from "firebase/firestore"
import { PlusCircle, Trash2, Crown, Users } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createNewDocument } from "../../../../actions/actions"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Room } from "../../Room"
import { Editor } from "../../Editor"

interface Member {
  id: string;
  email: string;
  role: "owner" | "editor";
}

function DocumentPage() {
  const params = useParams()
  const id = params.id as string
  const [isPending, startTransition] = useTransition()
  const [input, setInput] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const { user } = useUser()

  // Load document title
  useEffect(() => {
    if (!id) return
    
    const unsubscribe = onSnapshot(doc(db, "documents", id), (snapshot) => {
      if (snapshot.exists()) {
        setInput(snapshot.data()?.title || "")
      }
    })
    
    return () => unsubscribe()
  }, [id])

  // Load members and check if current user is owner
  useEffect(() => {
    if (!id || !user) return

    const fetchMembers = async () => {
      try {
        const membersData: Member[] = []
        
        // Query all users who have access to this document
        const usersRef = collection(db, "users")
        const userDocs = await getDocs(usersRef)
        
        for (const userDoc of userDocs.docs) {
          const roomRef = doc(db, "users", userDoc.id, "rooms", id)
          const roomSnap = await getDoc(roomRef)
          
          if (roomSnap.exists()) {
            const roomData = roomSnap.data()
            
            membersData.push({
              id: userDoc.id,
              email: userDoc.id,
              role: roomData.role
            })
            
            // Check if current user is owner
            if (userDoc.id === user.emailAddresses[0].emailAddress && roomData.role === "owner") {
              setIsOwner(true)
            }
          }
        }
        
        setMembers(membersData)
      } catch (error) {
        console.error("Error fetching members:", error)
      }
    }
    
    fetchMembers()
  }, [id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    startTransition(async () => {
      try {
        const docRef = doc(db, "documents", id)
        await updateDoc(docRef, {
          title: input.trim()
        })
      } catch (error) {
        console.error("Error updating document:", error)
      }
    })
  }

  const handleInviteUser = async () => {
    if (!newMemberEmail.trim() || !id || !user) return
    
    startTransition(async () => {
      try {
        // Check if email exists in system
        const userRef = doc(db, "users", newMemberEmail.trim())
        
        // Add document to user's rooms collection
        await setDoc(doc(db, "users", newMemberEmail.trim(), "rooms", id), {
          userId: newMemberEmail.trim(),
          role: "editor",
          createdAt: new Date(),
          roomId: id,
        })
        
        // Clear form and close dialog
        setNewMemberEmail("")
        setShowInviteDialog(false)
        
      } catch (error) {
        console.error("Error inviting user:", error)
      }
    })
  }

  const handleDeleteDocument = async () => {
    if (!id || !isOwner) return
    
    startTransition(async () => {
      try {
        // Delete document
        await updateDoc(doc(db, "documents", id), {
          deleted: true
        })
        
        // Redirect to home
        window.location.href = "/"
      } catch (error) {
        console.error("Error deleting document:", error)
      }
    })
  }

  return (
    <div>
      <Document id={id} />

      <div>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center p-4">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter title..."
            className="flex-1"
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? "Updating..." : "Update"}
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    Invite
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite User</DialogTitle>
                    <DialogDescription>
                      Enter the email of the user you want to invite as an editor.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      placeholder="user@example.com"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInviteUser}>
                      Invite
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="destructive" 
                onClick={handleDeleteDocument}
                disabled={isPending}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </form>
      </div>
    
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Collaborators
        </h2>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between p-3 rounded-md border"
            >
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <p className="font-medium">{member.email}</p>
                  <p className="text-xs text-gray-500 flex items-center">
                    {member.role === "owner" ? (
                      <>
                        <Crown className="h-3 w-3 mr-1 text-yellow-500" />
                        Owner
                      </>
                    ) : (
                      "Editor"
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4">
        <Room roomId={id}>
          <Editor />
        </Room>
      </div>
    </div>
  )
}

export default DocumentPage