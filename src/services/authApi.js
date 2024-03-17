import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from './globalConfig';
import { baseQueryWithReauth } from './baseQueryWithAuthen';

export const authApi = createApi({
    reducerPath: 'authApi',
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
        login: builder.mutation({
            query: (body) => {
                return {
                    url: `/auth/login`,
                    method: 'POST',
                    body: body,
                    headers: {
                        accept: `application/json`,
                    },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        getProfile: builder.mutation({
            query: (params) => {
                return {
                    url: `/api/v1/user/me`,
                    method: 'GET',
                    headers: {
                        accept: `application/json`,
                        Authorization: `Bearer ${params?.token}`,
                    },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        getRollCall: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/user/roll-call`,
                    method: 'GET',
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        putRollCall: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/user/roll-call`,
                    method: 'PATCH',
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        uploadImage: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/upload`,
                    method: 'POST',
                    body: body,
                    headers: { accept: `application/json`, 'Content-Type': 'multipart/form-data' },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        updateAvatar: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/profile/avatar`,
                    method: 'PATCH',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        updateUserProfile: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/profile`,
                    method: 'PUT',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        updateHidden: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/user/hiding/toggle`,
                    method: 'PATCH',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        updateSoundNotification: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/user/sound-notification/toggle`,
                    method: 'PATCH',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        changePassword: builder.mutation({
            query: (body) => {
                return {
                    url: `/auth/change-password`,
                    method: 'PUT',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Delete user
        deleteUser: builder.mutation({
            query: (body) => {
                return {
                    url: `/api/v1/user/${body?.userId}`,
                    method: 'DELETE',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
    }),
});

export const {
    usePrefetch,
    useLoginMutation,
    useGetProfileMutation,
    useGetRollCallMutation,
    usePutRollCallMutation,
    useUploadImageMutation,
    useUpdateAvatarMutation,
    useUpdateUserProfileMutation,
    useUpdateHiddenMutation,
    useUpdateSoundNotificationMutation,
    useChangePasswordMutation,
    useDeleteUserMutation,
} = authApi;
