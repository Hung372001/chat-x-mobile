import { createSlice } from '@reduxjs/toolkit';
export const AuthSlice = createSlice({
    name: 'AuthSlice',
    initialState: {
        userId: '',
        token: '',
        refreshToken: '',
        userProfile: {},
        fCMToken: '',
        fCMId: '',
    },
    reducers: {
        updateLogin: (state, action) => {
            state.userId = action.payload.userId;
            state.token = action.payload.token;
            state.refreshToken = action.payload.refreshToken;
        },
        updateLogout: (state, action) => {
            state.userId = '';
            state.token = '';
            state.refreshToken = '';
            state.userProfile = {};
        },
        updateProfile: (state, action) => {
            state.userProfile = action.payload;
        },
        updateFCMToken: (state, action) => {
            state.fCMToken = action.payload;
        },
        updateFCMId: (state, action) => {
            state.fCMId = action.payload;
        },
    },
});
export const { updateLogin, updateProfile, updateFCMToken, updateFCMId, updateLogout } =
    AuthSlice.actions;

export default AuthSlice.reducer;
