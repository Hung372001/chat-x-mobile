import _ from 'lodash'; // import { push } from 'connected-react-router';
import { dispatch } from '../redux/Store';
import { chatApi } from '../services/chatApi';
import { updateLogout } from '../redux/authSlice';
import { resetTo } from '../navigation/navigationUtils';

export const expireTokenMiddleware = (store) => (next) => (action) => {
    if (action?.payload?.status === 401) {
        dispatch(chatApi.util.resetApiState());
        dispatch(updateLogout());
        resetTo('xAuthStack');
    }

    const result = next(action);
    return result;
};
