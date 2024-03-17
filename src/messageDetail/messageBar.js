import React, { useState } from 'react';
import { View, SafeAreaView, TextInput , KeyboardAvoidingView , Platform } from 'react-native';
import Feather from "react-native-vector-icons/Feather";

messageBar = () => {
    const [message, setMessage] = useState('')
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={{
                flexDirection: 'row', backgroundColor: '#fff', justifyContent: 'space-between', alignItems: 'center', width: '100%' , paddingVertical:10
            }}>

                <Feather
                    style={{ width: "10%", textAlign:'center' }}
                    name="upload"
                    type="upload"
                    color={"#999999"}
                    size={20}
                />
                {/* <View style={{height:40 }}> */}
                <TextInput
                    style={{
                        fontSize: 15,
                        padding: 5,
                        height: 40,
                        width: "75%",
                        color: "#323232",
                        fontFamily: 'Urbanist-Regular',
                        borderColor: '#DDDDDD',
                        borderWidth: 1,
                        borderRadius: 4,
                    }}
                    underlineColorAndroid="transparent"
                    name={"messgae"}
                    placeholder={"Type Message here"}
                    placeholderTextColor="#807f7f"
                    value={message}
                    onChangeText={message => setMessage(message)}
                />
                {/* </View> */}
                <Feather
                    style={{ width: "10%" , textAlign:'center' }}
                    name="mic"
                    type="mic"
                    color={"#999999"}
                    size={20}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

export default messageBar;
