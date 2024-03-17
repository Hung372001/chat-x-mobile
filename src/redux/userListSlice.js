import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const getUsers = createAsyncThunk('getUsers', async ({ limit }, { dispatch, getState }) => {
    return fetch(
        `https://wp-guppy.com/messenger/wp-json/guppy/v2/load-guppy-messages-list?userId=1`
    ).then((res) => {
        res.json();
        // console.log("res.json()", res.json())
    });
});

export const userListSlice = createSlice({
    name: 'userListSlice',
    initialState: {
        list: [],
        status: null,
    },
    reducers: {
        [getUsers.pending]: (state, action) => {
            state.status = 'loading';
        },
        [getUsers.fulfilled]: (state, { payload }) => {
            state.list = payload;
            state.status = 'success';
        },
        [getUsers.rejected]: (state, action) => {
            state.status = 'failed';
        },
    },
});
export default userListSlice.reducer;
