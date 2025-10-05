import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedConversation, setMessages, sendMessageToFirebase } from "../chatSlice";
import { getUserIdFromToken } from "../../../../utlis/auth";
import dayjs from "dayjs";
import { Timestamp } from "firebase/firestore";
import listenToMessages from "./listenToMessages";
import chatAPI from "../services/customerAPI";

const Conversation = () => {
  const dispatch = useDispatch();
  const { selectedConversation, messages, conversations } = useSelector((state) => state.chat);
  const [text, setText] = useState("");

  const messagesEndRef = useRef();
  const messagesContainerRef = useRef();
  const currentUserId = getUserIdFromToken();

  const convMessages = messages[selectedConversation] || [];

  const normalizeMsg = (msg) => ({
    ...msg,
    created_at:
      msg.created_at instanceof Timestamp
        ? msg.created_at.toDate()
        : msg.created_at instanceof Date
        ? msg.created_at
        : new Date(msg.created_at),
  });

  const mergeMessages = (oldMsgs, newMsgs) => {
    const all = [...oldMsgs.map(normalizeMsg), ...newMsgs.map(normalizeMsg)];
    const uniqueMap = new Map();
    all.forEach((msg) => {
      const key = msg.id || `${msg.sender_id}-${msg.created_at.getTime()}-${msg.message}`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, msg);
    });
    return Array.from(uniqueMap.values()).sort((a, b) => a.created_at - b.created_at);
  };

  // Fetch + Listen
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const msgs = await chatAPI.getChatMessages(selectedConversation);
        dispatch(setMessages({ userId: selectedConversation, messages: msgs }));
      } catch (err) {
        console.error("Error fetching messages from Postgres:", err);
      }
    };

    fetchMessages();

    const unsubscribe = listenToMessages(currentUserId, selectedConversation, (newMessages) => {
      dispatch(
        setMessages({
          userId: selectedConversation,
          messages: mergeMessages(convMessages, newMessages),
        })
      );
    });

    return () => unsubscribe();
  }, [selectedConversation, dispatch, currentUserId]);

  // Scroll تلقائي
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convMessages]);

  const otherUserName = selectedConversation
    ? (() => {
        const conv = conversations.find(
          (c) =>
            c.sender_id === selectedConversation || c.receiver_id === selectedConversation
        );
        if (!conv) return "Unknown User";
        return conv.sender_id === currentUserId ? conv.receiver_name : conv.sender_name;
      })()
    : "";

  const handleSend = async () => {
      console.log("selectedConversation:", selectedConversation);
      console.log("text:", text);
    if (!text.trim() || !selectedConversation) return;

    try {
      await chatAPI.sendChatMessage(selectedConversation, text);
      await sendMessageToFirebase({
        sender_id: currentUserId,
        receiver_id: selectedConversation,
        message: text,
        read_status: false,
        created_at: new Date(),
      });
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleClose = () => {
    dispatch(setSelectedConversation(null));
  };

  if (!selectedConversation)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-lg font-semibold border-l border-gray-300">
        Open Conversation To Display Messages
      </div>
    );

  return (
    <div className="conversation flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-300 bg-gray-50 flex-shrink-0">
        <span className="flex-1 rounded-full px-4 py-2 text-gray-800 truncate">
          {otherUserName}
        </span>
        <button
          onClick={handleClose}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 transition"
        >
          &times;
        </button>
      </div>

      {/* Messages Scrollable */}
      <div
        ref={messagesContainerRef}
        className="messages flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100"
        style={{ minHeight: 0 }}
      >
        {convMessages.map((msg, index) => {
          const isMine = msg.sender_id === currentUserId;
          const time =
            msg.created_at instanceof Timestamp
              ? dayjs(msg.created_at.toDate()).add(3, "hour").add(8, "minute").format("hh:mm A")
              : dayjs(msg.created_at).add(3, "hour").add(8, "minute").format("hh:mm A");

          return (
            <div
              key={msg.id || `${msg.sender_id}-${msg.created_at.getTime()}-${msg.message}`}
              ref={index === convMessages.length - 1 ? messagesEndRef : null}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"} px-2`}
            >
              <div
                className={`px-4 py-2 rounded-lg break-words max-w-[60%] border border-gray-300 ${
                  isMine ? "bg-[#307A59] text-white" : "bg-white text-black"
                }`}
              >
                {msg.message}
              </div>
              <span
                className={`text-xs text-gray-500 mt-1 ${isMine ? "text-right" : "text-left"}`}
              >
                {time}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex items-center gap-2 bg-gray-50 flex-shrink-0 border-gray-300">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Message"
        />
        <button
          onClick={handleSend}
          className="bg-[#307A59] text-white px-4 py-2 rounded-full hover:bg-green-700 transition"
        >
          Send
        </button>
      </div>
  </div>

  );
};

export default Conversation;
