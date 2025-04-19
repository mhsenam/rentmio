"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Inbox } from "lucide-react";
import {
  getConversations,
  getMessages,
  sendMessage,
  Conversation,
  Message,
} from "@/lib/messageService";
import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";

// Helper function to safely handle Date | Timestamp for formatDistanceToNow
const formatTimestamp = (timestamp: Date | Timestamp) => {
  if (timestamp instanceof Date) {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  }
  // If it's a Firestore Timestamp, convert to Date first
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
};

export default function MessagesPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchConversations = async () => {
      setLoading(true);
      try {
        const fetchedConversations = await getConversations(user.uid);
        setConversations(fetchedConversations);

        // Check for conversation ID in URL
        const conversationId = searchParams.get("conversation");
        const initialMessage = searchParams.get("message");

        if (conversationId) {
          // Find conversation in fetched conversations
          const targetConversation = fetchedConversations.find(
            (conv) => conv.id === conversationId
          );

          if (targetConversation) {
            setActiveConversation(targetConversation);

            // Set initial message if provided
            if (initialMessage) {
              setNewMessage(decodeURIComponent(initialMessage));
            }
          }

          // Clear URL params after handling
          if (window.history.replaceState) {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          }
        }
        // Otherwise set the first conversation as active if available
        else if (fetchedConversations.length > 0 && !activeConversation) {
          setActiveConversation(fetchedConversations[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, router, searchParams]);

  useEffect(() => {
    if (activeConversation && user) {
      const fetchMessages = async () => {
        try {
          const fetchedMessages = await getMessages(activeConversation.id);
          setMessages(fetchedMessages);

          // Scroll to bottom of messages
          const messagesContainer =
            document.getElementById("messages-container");
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [activeConversation, user]);

  // Auto-send initial message if present
  useEffect(() => {
    if (
      activeConversation &&
      user &&
      newMessage &&
      !sendingMessage &&
      messages.length === 0
    ) {
      handleSendMessage();
    }
  }, [activeConversation, messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || !user) return;

    setSendingMessage(true);
    try {
      await sendMessage({
        conversationId: activeConversation.id,
        senderId: user.uid,
        content: newMessage,
        timestamp: new Date(),
      });

      setNewMessage("");

      // Refresh messages
      const updatedMessages = await getMessages(activeConversation.id);
      setMessages(updatedMessages);

      // Scroll to bottom
      setTimeout(() => {
        const messagesContainer = document.getElementById("messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5" />
              <span>Conversations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No messages yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your conversations with hosts and guests will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(
                    (p) => p.id !== user.uid
                  );

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer ${
                        activeConversation?.id === conversation.id
                          ? "bg-gray-100"
                          : ""
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <Avatar>
                        <AvatarImage src={otherUser?.photoURL || ""} />
                        <AvatarFallback>
                          {otherUser?.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {otherUser?.displayName || "User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.propertyTitle && (
                            <span className="font-medium text-primary">
                              {conversation.propertyTitle}
                            </span>
                          )}
                          {conversation.propertyTitle &&
                            conversation.lastMessage &&
                            " - "}
                          {conversation.lastMessage?.content ||
                            (conversation.propertyTitle
                              ? ""
                              : "No messages yet")}
                        </p>
                      </div>
                      {conversation.lastMessage && (
                        <div className="text-xs text-gray-400">
                          {formatTimestamp(conversation.lastMessage.timestamp)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="md:col-span-2 flex flex-col">
          {activeConversation ? (
            <>
              <CardHeader className="border-b pb-3">
                <CardTitle className="flex items-center gap-2">
                  {activeConversation.propertyTitle ? (
                    <span>
                      Conversation about{" "}
                      <span className="text-primary">
                        {activeConversation.propertyTitle}
                      </span>
                    </span>
                  ) : (
                    <span>
                      Conversation with{" "}
                      {
                        activeConversation.participants.find(
                          (p) => p.id !== user.uid
                        )?.displayName
                      }
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent
                className="flex-1 overflow-y-auto p-4 space-y-4"
                id="messages-container"
                style={{ maxHeight: "400px" }}
              >
                {messages.length === 0 ? (
                  <div className="text-center py-10">
                    <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Send a message to start the conversation
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isUserMessage = message.senderId === user.uid;
                    const sender = activeConversation.participants.find(
                      (p) => p.id === message.senderId
                    );

                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          isUserMessage ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isUserMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={sender?.photoURL || ""} />
                            <AvatarFallback>
                              {sender?.displayName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            isUserMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary"
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div
                            className={`text-xs mt-1 ${
                              isUserMessage
                                ? "text-primary-foreground/80"
                                : "text-gray-400"
                            }`}
                          >
                            {formatTimestamp(message.timestamp)}
                          </div>
                        </div>
                        {isUserMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={userData?.photoURL || ""} />
                            <AvatarFallback>
                              {userData?.displayName?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
              <CardFooter className="border-t p-3">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sendingMessage}
                  />
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !newMessage.trim()}
                  >
                    {sendingMessage ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <MessageCircle className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No Conversation Selected
              </h3>
              <p className="text-gray-500 max-w-md mb-6">
                Select a conversation from the list to view messages or start a
                new conversation from a property page.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
