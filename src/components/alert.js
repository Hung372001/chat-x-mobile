import { createRef } from 'react';

export const refAlert = createRef();

export const alertSuccess = (message, title = 'Thông báo', duration = 2300) => {
    refAlert.current?.alertWithType('info', title || 'Thông báo', message, undefined, duration);
};

export const alertError = (message, title = 'Đã có lỗi xảy ra', duration = 2300) => {
    refAlert.current?.alertWithType(
        'error',
        title || 'Đã có lỗi xảy ra',
        message,
        undefined,
        duration
    );
};

export const alertWarning = (message, title = 'Đã có lỗi xảy ra', duration = 2300) => {
    refAlert.current?.alertWithType(
        'warn',
        title || 'Đã có lỗi xảy ra',
        message,
        undefined,
        duration
    );
};
