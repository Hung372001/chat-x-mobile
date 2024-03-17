import { createSlice } from "@reduxjs/toolkit";
export const messagesSlice = createSlice({
  name: "messagesSlice",
  initialState: {
    chatId:"",
    chatMessages : [],
  },
  reducers: {
    updateChatId: (state, action) => {
      state.chatId = action.payload
  },
    updateMessages: (state, action) => {
      state.chatMessages = action.payload
  },
  },
});
export const { updateChatId,updateMessages } = messagesSlice.actions;
export default messagesSlice.reducer;