"use server";

import { auth } from "@clerk/nextjs/server";
import { admindb } from "../firebase-admin";
import { title } from "process";

export async function createNewDocument(){

    auth.protect();

    const {sessionClaims} = await auth();
    
    const docCollectionRef = admindb.collection("documents");
    const docRef = await docCollectionRef.add({
        title:"New Doc"
    })

    await admindb.collection('users').doc(sessionClaims?.email!).collection
    ('rooms').doc(docRef.id).set({
        userId: sessionClaims?.email!,
        role: "owner",
        createdAt: new Date(),
        roomId: docRef.id,
    })
    return { docId: docRef.id };
}
