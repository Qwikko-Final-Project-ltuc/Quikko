// chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import customerAPI from "./services/customerAPI";
import { getUserIdFromToken } from "../../../utlis/auth";
import { db } from '../../../app/firebase';
import { collection, doc, setDoc, serverTimestamp} from "firebase/firestore";


export const sendMessageToFirebase = async (message) => {
  // chatId ثابت بغض النظر عن ترتيب المستخدمين
  const chatId = `chat_${[message.sender_id, message.receiver_id].sort().join('_')}`;
  const docRef = doc(collection(db, 'chats', chatId, 'messages'));

  await setDoc(docRef, {
    sender_id: message.sender_id,
    receiver_id: message.receiver_id,
    message: message.message,
    read_status: false,
    created_at: serverTimestamp(), // مهم لضبط التوقيت لكل المستخدمين
  });
};
// جلب كل المحادثات
export const fetchConversations = createAsyncThunk(
  "chat/fetchConversations",
  async () => {
    const data = await customerAPI.getConversations();
    return data;
  }
);

// جلب رسائل محادثة معينة
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (user2Id) => {
    const messages = await customerAPI.getChatMessages(user2Id);
    return { user2Id, messages };
  }
);

// إرسال رسالة
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiver_id, message }) => {
    const newMsg = await customerAPI.sendChatMessage(receiver_id, message);
    return newMsg;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    conversations: [],
    messages: {},
    selectedConversation: null,
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
    addMessage: (state, action) => {
      const msg = action.payload;
      const otherUserId =
        msg.sender_id === getUserIdFromToken() ? msg.receiver_id : msg.sender_id;

      if (!state.messages[otherUserId]) state.messages[otherUserId] = [];
      state.messages[otherUserId].push(msg);
    },
    // 🔥 تحديث المحادثة كمقروءة محلياً
    setConversationsRead: (state, action) => {
      const userId = action.payload;
      state.conversations = state.conversations.map((conv) => {
        const currentUserId = getUserIdFromToken();
        const otherUserId =
          conv.sender_id === currentUserId ? conv.receiver_id : conv.sender_id;

        if (otherUserId === userId) {
          return { ...conv, read: true };
        }
        return conv;
      });
    },
    setMessages: (state, action) => {
    const { userId, messages } = action.payload;
    state.messages[userId] = messages;
  }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages[action.payload.user2Id] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const msg = action.payload;
        const otherUserId =
          msg.sender_id === getUserIdFromToken() ? msg.receiver_id : msg.sender_id;

        if (!state.messages[otherUserId]) state.messages[otherUserId] = [];
        state.messages[otherUserId].push(msg);
      });
  },
});

export const { setSelectedConversation, addMessage, setConversationsRead,setMessages } =
  chatSlice.actions;
export default chatSlice.reducer;
