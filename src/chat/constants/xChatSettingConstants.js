import { images } from '../../../assets';

export const MENU_DATA_PERSONAL = [
    {
        id: 0,
        type: 'DISTURB',
        title: 'Chế độ không làm phiền',
        onPress: () => {},
    },
    {
        id: 1,
        type: 'PIN_TOP',
        title: 'Gắn tin nhắn trên cùng',
        onPress: () => {},
    },
    {
        id: 2,
        type: 'CLEAR_HISTORY',
        title: 'Xóa lịch sử trò chuyện',
        onPress: () => {},
    },
    {
        id: 3,
        type: 'SET_NICKNAME',
        title: 'Đặt biệt danh',
        onPress: () => {},
    },
];

export const MENU_DATA_GROUP = [
    {
        id: 0,
        type: 'ADD_FRIEND',
        title: 'Thêm bạn bè',
        onPress: () => {},
    },
    // {
    //     id: 1,
    //     type: 'TYPE',
    //     title: 'Nhóm công khai',
    //     onPress: () => {},
    // },
    {
        id: 2,
        type: 'ADMIN',
        title: 'Quản trị viên',
        onPress: () => {},
    },
    {
        id: 3,
        type: 'AUTO_CLEAR_MESSAGE',
        title: 'Tự động xóa tin nhắn',
        onPress: () => {},
    },
    {
        id: 4,
        type: 'LEAVE_GROUP',
        title: 'Rời nhóm',
        onPress: () => {},
    },
];

export const CLEAR_HISTORY_DATA = [
    {
        id: '1',
        label: 'Không',
        value: '0',
        size: 18,
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '2',
        label: '30 Phút',
        value: '30',
        size: 18,
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '3',
        label: '1 Giờ',
        value: '60',
        size: 18,
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '4',
        label: '2 Giờ',
        value: '120',
        size: 18,
        containerStyle: { marginHorizontal: 5 },
    },
];

export const CLEAR_HISTORY_DATA_DARK_MODE = [
    {
        id: '1',
        label: 'Không',
        value: '0',
        size: 18,
        color: '#FFFFFF',
        labelStyle: { color: '#FFFFFF' },
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '2',
        label: '30 Phút',
        value: '30',
        size: 18,
        color: '#FFFFFF',
        labelStyle: { color: '#FFFFFF' },
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '3',
        label: '1 Giờ',
        value: '60',
        size: 18,
        color: '#FFFFFF',
        labelStyle: { color: '#FFFFFF' },
        containerStyle: { marginHorizontal: 5 },
    },
    {
        id: '4',
        label: '2 Giờ',
        value: '120',
        size: 18,
        color: '#FFFFFF',
        labelStyle: { color: '#FFFFFF' },
        containerStyle: { marginHorizontal: 5 },
    },
];
