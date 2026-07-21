import API from "../utils/api";

// 📥 Get conversations
export async function getConversations() {
  const res = await API.get("/messages/conversations");
  return res.data;
}

// 💬 Get messages for a chat
export async function getMessages(chatId) {
  const res = await API.get(`/messages/${chatId}`);
  return res.data;
}

// 📤 Send message
export async function sendMessage(chatId, message) {
  const res = await API.post(`/messages/${chatId}`, { content: message });
  return res.data;
}
