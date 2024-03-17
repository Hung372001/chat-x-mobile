import * as CONSTANT from '../constant/constant';
import store from '../redux/Store';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { config } from '../services/globalConfig';

export function useSocket(disableDisconnect) {
    const [socket, setSocket] = useState(null);
    useEffect(() => {
        const state = store.getState();
        const auth = state?.auth;
        const socketClient = io('http://210.211.110.20:3001' + `/socket/chats?token=Bearer ${auth.token}`, {
            transports: ['websocket'],
            auth: {
                token: auth.token,
            },
            secure: true,
            reconnect: true,
            autoConnect: true,
        });
        setSocket(socketClient);
        if (disableDisconnect) {
        } else {
            return () => {
                console.log('--------disconnect to socket server -------');
                socket?.disconnect();
            };
        }
    }, []);
    return socket;
}

export function useSocketEvent(socket, event, callback) {
    useEffect(() => {
        if (!socket) {
            return;
        }
        socket.on(event, callback);
        return () => {
            socket.off(event, callback);
        };
    }, [socket, event, callback]);
    return socket;
}
