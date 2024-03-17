import { createSlice } from "@reduxjs/toolkit";
export const TabSlice = createSlice({
  name: "TabSlice",
  initialState: {
    tab: "private_chats",
    chatTab: "one",
  },
  reducers: {
    updateTab: (state, action) => {
      state.tab = action.payload;
    },
    updateChatTab: (state, action) => {
      state.chatTab = action.payload;
    },
  },
});
export const { updateTab, updateChatTab } = TabSlice.actions;
export default TabSlice.reducer;
