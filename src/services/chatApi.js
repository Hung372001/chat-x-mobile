import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { config } from './globalConfig';
import { isEmpty } from 'lodash';
import qs from 'qs';

export const chatApi = createApi({
    reducerPath: 'chatApi',
    baseQuery: fetchBaseQuery({
        baseUrl: config.apiUrl,
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
    tagTypes: ['Chat'],
    endpoints: (builder) => ({
        // Get Users
        getUsers: builder.query({
            query: (params) => {
                let data = {
                    limit: params?.limit || 20,
                    page: params?.page,
                };

                if (!isEmpty(params?.searchValue)) {
                    data['searchBy'] = ['username'];
                    // data['searchBy'] = ['nickname', 'username', 'email', 'phoneNumber'];
                    data['keyword'] = params?.searchValue;
                }

                return {
                    url: `/user?${qs.stringify(data, { encode: false })}`,
                    params: {},
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
        }),
        // Add new friend
        addFriend: builder.mutation({
            query: (body) => {
                return {
                    url: `/user/add-friends`,
                    method: 'POST',
                    body: { friends: [body] },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Create new group
        createGroup: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat`,
                    method: 'POST',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Get Users
        getGroup: builder.query({
            query: (params) => {
                let data = {
                    limit: params?.limit ?? 10,
                    page: params?.page,
                    sortBy: 'chat_message as latestMessages.createdAt',
                    sortOrder: 'DESC',
                };
                if (params?.filter === 'GROUP') {
                    data['searchBy'] = 'type';
                    data['keyword'] = 'Group';
                }

                return {
                    url: `/group-chat`,
                    params: data,
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
            providesTags: (result, error) => [{ type: 'Chat', id: result?.key }],
        }),
        // Get Users
        getArchiveMessage: builder.query({
            query: (params) => {
                let data = {
                    limit: params?.limit ?? 20,
                    page: params?.page,
                    searchBy: ['group_chat_setting.hiding '],
                    keyword: true,
                };

                return {
                    url: `/group-chat`,
                    params: data,
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
            providesTags: (result, error) => [{ type: 'Chat', id: result?.key }],
        }),
        // Get Chat message
        getChatMessage: builder.query({
            query: (params) => {
                // Todo: handle pagination
                let data = {
                    limit: params?.limit || 20,
                    page: params?.page,
                };
                return {
                    url: `/chat-message/group-chat/${params?.groupChatId}`,
                    params: data,
                };
            },

            transformResponse: (response) => {
                return response?.data;
            },
        }),

        // Get get chat message from contact
        // getChatMessageContactChat: builder.query({
        //     query: (params) => {
        //         // Todo: handle pagination
        //         let data = {
        //             limit: params?.limit || 20,
        //             page: params?.page,
        //         };
        //         return {
        //             url: `/chat-message/contact/${params?.contactUserId}`,
        //             params: data,
        //         };
        //     },

        //     transformResponse: (response) => {
        //         return response?.data;
        //     },
        // }),

        // Send message
        sendMessage: builder.mutation({
            query: (body) => {
                return {
                    url: `/chat-message/send`,
                    method: 'POST',
                    body: body,
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Remove from group
        removeFromGroup: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/remove-members/${body?.groupId}`,
                    method: 'PATCH',
                    body: { members: body?.members },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Add to group
        addToGroup: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/add-members/${body?.groupId}`,
                    method: 'PATCH',
                    body: { members: body?.members },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Accept friend
        acceptFriend: builder.mutation({
            query: (body) => {
                return {
                    url: `/user/friend-request/accept/${body?.userId}`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Get Check friend request
        checkFriendRequest: builder.query({
            query: (params) => {
                return {
                    url: `/user/friend-request/${params?.userId}`,
                    params: {},
                };
            },

            transformResponse: (response) => {
                return response?.data;
            },
        }),
        // Archive group chat
        archiveGroupChat: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/hiding/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Pin group chat
        pinGroupChat: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/pin/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Get group chat by id
        getGroupChatById: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.id}`,
                    method: 'GET',
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Delete group chat
        deleteGroupChat: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}`,
                    method: 'DELETE',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Personal chat setting
        getPersonalSetting: builder.query({
            query: (params) => {
                return {
                    url: `/group-chat/${params?.groupId}/setting`,
                    params: {},
                };
            },

            transformResponse: (response) => {
                return response?.data;
            },
        }),
        // Clear chat  message
        cleatChatMessage: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/clear`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Update user Nick Name
        updateNickName: builder.mutation({
            query: (body) => {
                return {
                    url: `/user/nickname/${body?.userId}`,
                    method: 'PATCH',
                    body: { nickname: body?.nickName },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Personal Chat setting toggle pin
        togglePinSetting: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/pin/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Personal Chat setting toggle mute
        toggleMuteSetting: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/mute-notification/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Personal Chat setting toggle add friend
        toggleAddFriendSetting: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/add-friends/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Personal Chat setting toggle chat feature
        toggleChatFeatureSetting: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/chat-feature/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Group Chat setting toggle private/public
        toggleGroupTypeSetting: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/group-type/toggle`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Clear message sequence
        clearMessageSequence: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/${body?.groupId}/setting/clear-message-sequence`,
                    method: 'PATCH',
                    body: { duration: body?.duration },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Add group admin
        updateGroupAdmin: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/modify-admin/${body?.groupId}`,
                    method: 'PATCH',
                    body: { admins: body?.admins },
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // Find group chat id
        findGroupChatId: builder.query({
            query: (params) => {
                return {
                    url: `/group-chat/conversation/${params?.userId}`,
                    params: {},
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
        }),
        // Add group admin
        leaveGroup: builder.mutation({
            query: (body) => {
                return {
                    url: `/group-chat/leave-group/${body?.groupId}`,
                    method: 'PATCH',
                    body: {},
                    headers: { accept: `application/json` },
                };
            },
            transformResponse: (response) => {
                return response;
            },
        }),
        // search by type USER | GROUP_CHAT | ALL
        getSearch: builder.query({
            query: (params) => {
                let data = {
                    limit: params?.limit || 20,
                    page: params?.page,
                    type: params.type || 'ALL',
                };
                if (!isEmpty(params?.searchValue)) {
                    data['keyword'] = params?.searchValue;
                }
                return {
                    url: `/search?${qs.stringify(data, { encode: false })}`,
                    params: {},
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
        }),
        getMemberList: builder.query({
            query: (params) => {
                let data = {
                    limit: params?.limit || 15,
                    page: params?.page,
                };
                return {
                    url: `/group-chat/members/${params?.groupId}?${qs.stringify(data, {
                        encode: false,
                    })}`,
                    params: {},
                };
            },
            transformResponse: (response) => {
                return response?.data;
            },
        }),
    }),
});

export const {
    usePrefetch,
    useGetUsersQuery,
    useAddFriendMutation,
    useCreateGroupMutation,
    useGetGroupQuery,
    useGetChatMessageQuery,
    // useGetChatMessageContactChatQuery,
    useSendMessageMutation,
    useRemoveFromGroupMutation,
    useAddToGroupMutation,
    useAcceptFriendMutation,
    useCheckFriendRequestQuery,
    useArchiveGroupChatMutation,
    usePinGroupChatMutation,
    useDeleteGroupChatMutation,
    useGetGroupChatByIdMutation,
    useGetArchiveMessageQuery,
    useGetPersonalSettingQuery,
    useCleatChatMessageMutation,
    useUpdateNickNameMutation,
    useTogglePinSettingMutation,
    useToggleMuteSettingMutation,
    useToggleAddFriendSettingMutation,
    useToggleChatFeatureSettingMutation,
    useToggleGroupTypeSettingMutation,
    useClearMessageSequenceMutation,
    useUpdateGroupAdminMutation,
    useFindGroupChatIdQuery,
    useLeaveGroupMutation,
    useGetSearchQuery,
    useGetMemberListQuery,
} = chatApi;
