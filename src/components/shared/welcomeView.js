import React from 'react';
import { TouchableOpacity } from 'react-native';
import Avatar from '../Avatar';
import { navigate } from '../../navigation/navigationUtils';
import Colors from '../../utils/colors';
import { useSelector } from 'react-redux';
import CustView from '../custView';
import CustText from '../custText';
import moment from 'moment';

const WelcomeView = ({}) => {
    const userProfile = useSelector((state) => state.auth.userProfile);
    let hour = moment().format('HH');

    const checkWelcomeTitle = (currentHour) => {
        if (0 <= parseInt(currentHour) && parseInt(currentHour) < 11) {
            return 'Chào buổi sáng';
        } else if (11 <= parseInt(currentHour) && parseInt(currentHour) < 18) {
            return 'Chào buổi chiều';
        } else if (18 <= parseInt(currentHour) && parseInt(currentHour) <= 23) {
            return 'Chào buổi tối';
        } else {
            return 'Good morning';
        }
    };

    const onPress = () => {
        navigate('xProfileScreen');
    };

    return (
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.6} onPress={onPress}>
            <CustView transparentBg row centerVertical fillHeight>
                <Avatar size={40} uri={userProfile?.profile?.avatar} />
                <CustView transparentBg style={{ marginLeft: 10, flex: 1 }}>
                    <CustText color={Colors.grey} bold size={10}>
                        {checkWelcomeTitle(hour)}
                    </CustText>
                    <CustText numberOfLines={1} size={18}>
                        {userProfile?.username}
                    </CustText>
                </CustView>
            </CustView>
        </TouchableOpacity>
    );
};

export default WelcomeView;
