import { createSlice } from "@reduxjs/toolkit";
export const SettingSlice = createSlice({
  name: "SettingSlice",
  initialState: {
    settings : {},
    translations:{},
    isDarkMode: false,
  },
  reducers: {
    updateSetting: (state, action) => {
      state.settings = action.payload
    },
    updateTranslations: (state, action) => {
      state.translations = action.payload
    },
    updateDarkMode: (state, action) => {
      state.isDarkMode = action.payload
    },
  },
});
export const { updateSetting, updateTranslations, updateDarkMode } = SettingSlice.actions;
export default SettingSlice.reducer;