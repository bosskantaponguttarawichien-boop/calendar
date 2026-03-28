"use client";

import { useCallback } from "react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    addDoc, 
    query, 
    where, 
    updateDoc, 
    doc,
    onSnapshot,
    deleteDoc,
    Timestamp,
    setDoc,
    getDoc
} from "firebase/firestore";
import { Group, GroupMember } from "@/types/group.types";

export function useGroupService() {
    const subscribeToUserGroups = useCallback((
        userId: string, 
        onUpdate: (groups: Group[]) => void
    ) => {
        if (!userId) return () => {};

        // In a real app, you'd probably use a 'members' subcollection or an array field.
        // For simplicity, let's look for groups where the user is in the members list.
        // Firestore 'array-contains' is good if members is an array of IDs.
        const q = query(
            collection(db, "groups"), 
            where("memberIds", "array-contains", userId)
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const groupsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
                };
            }) as Group[];
            onUpdate(groupsData);
        });

        return unsub;
    }, []);

    const createGroup = useCallback(async (
        userId: string, 
        userName: string, 
        userPicture: string | null,
        groupData: { name: string; category: string; image?: string }
    ) => {
        try {
            const creator: GroupMember = {
                id: userId,
                displayName: userName,
                pictureUrl: userPicture || undefined
            };

            const docRef = await addDoc(collection(db, "groups"), {
                ...groupData,
                creatorId: userId,
                members: [creator],
                memberIds: [userId], // For easy querying
                lastMsg: "กลุ่มถูกสร้างขึ้นแล้ว",
                time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return docRef.id;
        } catch (error) {
            console.error("Error creating group:", error);
            throw error;
        }
    }, []);

    const joinGroup = useCallback(async (
        groupId: string,
        userId: string,
        userName: string,
        userPicture: string | null
    ) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);

            if (!groupSnap.exists()) {
                throw new Error("Group not found");
            }

            const groupData = groupSnap.data();
            const memberIds = groupData.memberIds || [];

            if (memberIds.includes(userId)) {
                return; // Already a member
            }

            const newMember: GroupMember = {
                id: userId,
                displayName: userName,
                pictureUrl: userPicture || undefined
            };

            await updateDoc(groupRef, {
                members: [...(groupData.members || []), newMember],
                memberIds: [...memberIds, userId],
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Error joining group:", error);
            throw error;
        }
    }, []);

    const deleteGroup = useCallback(async (groupId: string) => {
        try {
            await deleteDoc(doc(db, "groups", groupId));
        } catch (error) {
            console.error("Error deleting group:", error);
            throw error;
        }
    }, []);

    const leaveGroup = useCallback(async (groupId: string, userId: string) => {
        try {
            const groupRef = doc(db, "groups", groupId);
            const groupSnap = await getDoc(groupRef);

            if (!groupSnap.exists()) {
                throw new Error("Group not found");
            }

            const groupData = groupSnap.data();
            const memberIds = groupData.memberIds || [];
            const members = groupData.members || [];

            await updateDoc(groupRef, {
                members: members.filter((m: any) => m.id !== userId),
                memberIds: memberIds.filter((id: string) => id !== userId),
                updatedAt: new Date()
            });
        } catch (error) {
            console.error("Error leaving group:", error);
            throw error;
        }
    }, []);

    return {
        subscribeToUserGroups,
        createGroup,
        joinGroup,
        deleteGroup,
        leaveGroup
    };
}
