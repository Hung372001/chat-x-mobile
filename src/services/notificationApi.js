import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import * as CONSTANT from '../constant/constant';
import { config } from './globalConfig';

export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: config.baseUrl,
        timeout: 10000,
        prepareHeaders: async (headers, { getState }) => {
            const token = getState().auth?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('accept', `application/json`);
            return headers;
        },
    }),
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: (builder) => ({
        addFCMToken: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/notification-token`,
                    method: 'POST',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        removeFCMToken: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/notification-token`,
                    method: 'DELETE',
                    body: { deviceToken: body },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
    }),
});

export const { usePrefetch, useAddFCMTokenMutation, useRemoveFCMTokenMutation } = notificationApi;
