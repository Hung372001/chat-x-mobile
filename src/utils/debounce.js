import { useRef } from 'react';

const BOUNCE_RATE = 2000;

export const useDebounce = () => {
    const busy = useRef(false);

    const debounce = async (callback, duration) => {
        if (!busy.current) {
            busy.current = true;
            callback();
            setTimeout(() => {
                busy.current = false;
            }, duration || BOUNCE_RATE);
        }
    };

    return { debounce };
};
