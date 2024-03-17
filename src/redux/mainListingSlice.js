import { createSlice } from "@reduxjs/toolkit";
export const mainListingSlice = createSlice({
  name: "mainListingSlice",
  initialState: {
    users: [],
    autoInvite:false,
    requestUsers: [],
    chat: [],
    groupChat: [],
    friends: [],
    blockedUsers: [],
    postChat: [],
    whatsappChat: [],
    supportMessages: [],
    supportAgents: []
  },
  reducers: {
    updateUsers: (state, action) => {
      state.users = action.payload;
    },
    updateAutoInvite: (state, action) => {
      state.autoInvite = action.payload;
    },
    updateUsersRequest: (state, action) => {
      state.requestUsers = action.payload;
    },
    updateChat: (state, action) => {
      state.chat = action.payload;
    },
    updateGroupChat: (state, action) => {
      state.groupChat = action.payload;
    },
    updateFriends: (state, action) => {
      state.friends = action.payload;
    },
    updateBlockedUsers: (state, action) => {
      state.blockedUsers = action.payload;
    },
    updatePostChat: (state, action) => {
      state.postChat = action.payload;
    },
    updateWhatsappChat: (state, action) => {
      state.whatsappChat = action.payload;
    },
    updateSupportMessages: (state, action) => {
      state.supportMessages = action.payload;
    },
    updateSupportAgents: (state, action) => {
      state.supportAgents = action.payload;
    },
  }
});
export const {
  updateUsers,
  updateAutoInvite,
  updateUsersRequest,
  updateChat,
  updateGroupChat,
  updateFriends,
  updateBlockedUsers,
  updatePostChat,
  updateWhatsappChat,
  updateSupportMessages,
  updateSupportAgents
} = mainListingSlice.actions;
export default mainListingSlice.reducer;
