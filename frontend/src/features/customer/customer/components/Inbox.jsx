import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, setSelectedConversation, fetchMessages, setConversationsRead } from "../chatSlice";
import { getUserIdFromToken } from "../../../../utlis/auth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const Inbox = () => {
  const dispatch = useDispatch();
  const { conversations, selectedConversation, loading } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSelect = (userId) => {
    dispatch(setSelectedConversation(userId));
    dispatch(fetchMessages(userId));
    dispatch(setConversationsRead(userId));
  };

  if (loading) return <div className="p-4 text-gray-500">Loading...</div>;

  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div className="inbox overflow-y-auto bg-gray-50 h-full">
      {sortedConversations.map((conv) => {
        const currentUserId = getUserIdFromToken();
        const isMine = conv.sender_id === currentUserId;
        const otherUserName = isMine ? conv.receiver_name : conv.sender_name;
        const otherUserId = isMine ? conv.receiver_id : conv.sender_id;

        const isUnread = !conv.read && conv.sender_id !== currentUserId;
        const bgClass = isUnread ? "bg-green-100" : selectedConversation === otherUserId ? "bg-gray-200" : "bg-white";

        return (
          <div
            key={conv.id}
            onClick={() => handleSelect(otherUserId)}
            className={`p-4 cursor-pointer border-b border-gray-300 flex justify-between items-center ${bgClass} hover:bg-gray-100 transition`}
          >
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">{otherUserName}</span>
              <span className="text-sm text-gray-600 truncate max-w-[200px]">{conv.message}</span>
            </div>
            <div className="text-xs text-gray-400 flex-shrink-0 ml-2">
              {dayjs(conv.created_at).subtract(-3, "hour").fromNow()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Inbox;
