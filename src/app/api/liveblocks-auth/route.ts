import { auth } from "@clerk/nextjs/server";
import { Liveblocks } from "@liveblocks/node";
import { NextRequest, NextResponse } from "next/server";
import { admindb } from "../../../../firebase-admin";

// Create a Liveblocks instance with secret API key
const liveblocks = new Liveblocks({
  secret: "sk_dev_xFBy6LpdZUQfRi9IJRi5SpLniYOEaIu75Vvq1czHHDNUizTQeL2L2Hwzk1znsxdt",
});

export async function POST(request: NextRequest) {
  // Get current user from Clerk
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the document ID from the request
    const { room } = await request.json();
    
    if (!room) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Check if user has access to the document
    const roomRef = admindb.collection("documents").doc(room);
    const doc = await roomRef.get();
    
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Get user info from Clerk
    const { sessionClaims } = await auth();
    const email = sessionClaims?.email as string;
    
    // Get user's document access details from Firestore
    const userRoomRef = admindb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(room);
    
    const userRoom = await userRoomRef.get();
    
    if (!userRoom.exists) {
      return NextResponse.json(
        { error: "You don't have access to this document" },
        { status: 403 }
      );
    }

    const userData = userRoom.data();
    const userRole = userData?.role;

    // Create a session for this user
    const session = liveblocks.prepareSession(userId);

    // Give access to the room and set user metadata
    const user = await auth().getUser();
    
    session.allow(room, userRole);
    
    // Set custom user metadata
    session.setUser({
      id: userId,
      info: {
        name: user.firstName || email.split('@')[0],
        color: getRandomPastelColor(),
        picture: user.imageUrl,
      },
    });

    // Create and return the session token
    const { token } = await session.toToken();
    
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error creating Liveblocks session:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Helper function to generate a random pastel color for user cursor
function getRandomPastelColor() {
  // Generate a random hue (0-360)
  const hue = Math.floor(Math.random() * 360);
  // Use high saturation and lightness for pastel colors
  return `hsl(${hue}, 70%, 80%)`;
} 