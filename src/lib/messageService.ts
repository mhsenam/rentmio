"use client";

import { db } from "./firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  getDoc,
} from "firebase/firestore";

// Types for messages and conversations
export interface Participant {
  id: string;
  displayName: string;
  photoURL?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date | Timestamp;
  read?: boolean;
}

export interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: {
    content: string;
    timestamp: Date | Timestamp;
    senderId: string;
  };
  createdAt: Date | Timestamp;
  propertyId?: string;
  propertyTitle?: string;
}

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";

// Get all conversations for a user
export const getConversations = async (
  userId: string
): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where("participantIds", "array-contains", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        participants: data.participants || [],
        lastMessage: data.lastMessage
          ? {
              content: data.lastMessage.content,
              timestamp: data.lastMessage.timestamp?.toDate() || new Date(),
              senderId: data.lastMessage.senderId,
            }
          : undefined,
        createdAt: data.createdAt?.toDate() || new Date(),
        propertyId: data.propertyId,
        propertyTitle: data.propertyTitle,
      };
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
};

// Create a new conversation
export const createConversation = async (
  participants: Participant[],
  propertyId?: string,
  propertyTitle?: string
): Promise<string> => {
  try {
    // Extract participant IDs for easy querying
    const participantIds = participants.map((p) => p.id);

    // Check if conversation already exists between these users
    if (participantIds.length === 2 && propertyId) {
      const existingConversationQuery = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where("participantIds", "array-contains", participantIds[0]),
        where("propertyId", "==", propertyId)
      );

      const querySnapshot = await getDocs(existingConversationQuery);

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.participantIds.includes(participantIds[1])) {
          return doc.id; // Return existing conversation ID
        }
      }
    }

    // Create new conversation
    const conversationData = {
      participants,
      participantIds,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      propertyId,
      propertyTitle,
    };

    const docRef = await addDoc(
      collection(db, CONVERSATIONS_COLLECTION),
      conversationData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get all messages for a conversation
export const getMessages = async (
  conversationId: string
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        read: data.read || false,
      };
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
};

// Send a new message
export const sendMessage = async (
  messageData: Omit<Message, "id">
): Promise<string> => {
  try {
    // Add message
    const messageToSave = {
      ...messageData,
      timestamp: serverTimestamp(),
      read: false,
    };

    const docRef = await addDoc(
      collection(db, MESSAGES_COLLECTION),
      messageToSave
    );

    // Update conversation with last message
    const conversationRef = doc(
      db,
      CONVERSATIONS_COLLECTION,
      messageData.conversationId
    );
    await updateDoc(conversationRef, {
      lastMessage: {
        content: messageData.content,
        timestamp: serverTimestamp(),
        senderId: messageData.senderId,
      },
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where("conversationId", "==", conversationId),
      where("senderId", "!=", userId),
      where("read", "==", false)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return;
    }

    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        read: true,
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};
