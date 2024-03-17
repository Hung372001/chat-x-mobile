import { configureStore, combineReducers } from '@reduxjs/toolkit';
import TabSlice from './TabSlice';
import appSetting from './SettingSlice';
import mainListingSlice from './mainListingSlice';
import messagesSlice from './messagesSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer } from 'redux-persist';
import userListSlice from './userListSlice';
import { getDefaultMiddleware } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import { chatApi } from '../services/chatApi';
import { authApi } from '../services/authApi';
import { notificationApi } from '../services/notificationApi';
import { logger } from 'redux-logger';
// import { expireTokenMiddleware } from '../utils/middleware';

const rootReducer = combineReducers({
    tab: TabSlice,
    listing: mainListingSlice,
    setting: appSetting,
    messages: messagesSlice,
    users: userListSlice,
    auth: authSlice,
    [chatApi.reducerPath]: chatApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
});
const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

const middleWares = [
    // expireTokenMiddleware,
    chatApi.middleware,
    authApi.middleware,
    notificationApi.middleware,
];

// if (__DEV__) { middleWares.push(logger) }

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false,
        }).concat(middleWares),
});

export const dispatch = store.dispatch;
export default store;
