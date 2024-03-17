import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ImageBackground,
  Alert,
  Platform,
  Linking,
} from "react-native";
import React, { useState, useEffect } from "react";
import Feather from "react-native-vector-icons/Feather";
import { DotIndicator } from "react-native-indicators";
import Notification from "../components/Notification";

const whatsappSupport = ({ route, navigation }) => {
  const [dateTime, setDateTime] = useState("");
  const [showNotice, setshowNotice] = useState(true);
  const [message, setMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  useEffect(() => {
    getCurrentTime();
    setTimeout(() => {
      setshowNotice(false);
    }, 1600);
  }, []);

  const getCurrentTime = () => {
    var date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours %= 12;
    hours = hours || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    setDateTime(strTime);
  };

  const sendMessage = () => {
    let msg = message;
    let phoneWithCountryCode = route.params.item.userContact;

    let mobile =
      Platform.OS == "ios" ? phoneWithCountryCode : "+" + phoneWithCountryCode;
    if (mobile) {
      if (msg) {
        let url = "whatsapp://send?text=" + msg + "&phone=" + mobile;
        Linking.openURL(url)
          .then((data) => {
            setMessage("");
          })
          .catch(() => {
            setShowAlert(true);
            setAlertType("error");
            setTitle("Oops!");
            setDesc("Make sure WhatsApp installed on your device");
          });
      } else {
        setShowAlert(true);
        setAlertType("error");
        setTitle("Oops!");
        setDesc("Please insert message to send");
      }
    } else {
      setShowAlert(true);
      setAlertType("error");
      setTitle("Oops!");
      setDesc("There is no mobile number in Data ");
    }
  };
  const hideAlert = () => {
    setShowAlert(false);
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
       <Notification
        show={showAlert}
        hide={hideAlert}
        type={alertType}
        title={title}
        desc={desc}
      />
      <View
        style={{
          flexDirection: "row",
          paddingVertical: 15,
          backgroundColor: "#22C55E",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Feather
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: 15 }}
            name="chevron-left"
            type="chevron-left"
            color={"#FFF"}
            size={25}
          />
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("imagePreview", {
                imageData: route.params.item.userAvatar,
                profImage: "show",
              })
            }
          >
            <Image
              style={{
                width: 40,
                height: 40,
                borderRadius: 40 / 2,
              }}
              source={{
                uri:
                  route.params.item.userAvatar.slice(0, 5) == "https"
                    ? route.params.item.userAvatar
                    : "https:" + route.params.item.userAvatar,
              }}
            />
          </TouchableOpacity>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 15,
              marginRight: 15,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {route.params.item.userName}
          </Text>
        </View>
      </View>
      <ImageBackground
        style={{ flex: 1 }}
        source={require("../../assets/Whatsapp-bg.jpg")}
      >
        {showNotice ? (
          <View
            style={{
              width: "100%",
              height: 50,
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                maxWidth: "75%",
                marginHorizontal: 15,
                marginTop: 10,
                marginBottom: 5,
                borderTopRightRadius: 13,
                borderBottomRightRadius: 13,
                borderBottomLeftRadius: 13,
                elevation: 3,
                shadowOffset: { width: 0, height: 1 },
                shadowColor: "#000000",
                shadowOpacity: 0.1,
                paddingHorizontal: 15,
              }}
            >
              <DotIndicator count={3} size={5} color={"#0A0F26"} />
            </View>
          </View>
        ) : (
          <View
            style={{
              width: "100%",
              alignItems: "flex-start",
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",
                maxWidth: "75%",
                marginHorizontal: 15,
                marginTop: 10,
                marginBottom: 5,
                borderTopRightRadius: 13,
                borderBottomRightRadius: 13,
                borderBottomLeftRadius: 13,
                elevation: 3,
                shadowOffset: { width: 0, height: 1 },
                shadowColor: "#000000",
                shadowOpacity: 0.1,
                paddingHorizontal: 5,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  ellipsizeMode="tail"
                  style={{
                    marginHorizontal: 10,
                    marginTop: 10,
                    marginBottom: 5,
                    fontFamily: "OpenSans-Regular",
                    lineHeight: 24,
                    fontSize: 15,
                    letterSpacing: 0.5,
                    color: "#0A0F26",
                  }}
                >
                  {route.params.online == false
                    ? route.params.item.userOfflineMessage
                    : route.params.item.userDefaultMessage}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  marginHorizontal: 10,
                }}
              >
                <Text
                  style={{
                    marginRight: 2,
                    fontFamily: "OpenSans-Regular",
                    fontSize: 12,
                    marginBottom: 10,
                    letterSpacing: 0.5,
                    color: "#999999",
                  }}
                >
                  {dateTime}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ImageBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          // backgroundColor:"#000",
          elevation: 3,
          shadowOffset: { width: 0, height: 1 },
          shadowColor: "#000000",
          shadowOpacity: 0.1,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            height: 65,
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 15,
          }}
        >
          <TextInput
            style={{
              flex: 1,
              height: 45,
              fontSize: 16,
              paddingHorizontal: 4,
              color: "#000",
            }}
            placeholder={"Type your message here"}
            placeholderTextColor={"#727372"}
            autoCorrect={false}
            textContentType="email_address"
            value={message}
            onChangeText={(text) => setMessage(text)}
          />
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={{
              width: 48,
              height: 48,
              borderRadius: 48 / 2,
              backgroundColor: "#075E54",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="send" type="send" color={"#FFF"} size={25} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default whatsappSupport;

const styles = StyleSheet.create({});
