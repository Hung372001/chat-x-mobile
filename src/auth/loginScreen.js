import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Image,
  Text,
  ImageBackground,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RBSheet from "react-native-raw-bottom-sheet";
import { Tooltip } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as CONSTANT from "../constant/constant";
import { SkypeIndicator } from "react-native-indicators";
import { useSelector, useDispatch } from "react-redux";
import { updateTab, updateChatTab } from "../redux/TabSlice";
import Notification from "../components/Notification";
import { updateSetting, updateTranslations } from "../redux/SettingSlice";

const loginScreen = ({ navigation }) => {
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const refRBSheet = useRef();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureP, setSecureP] = useState(true);
  const [emailValid, setEmailValid] = useState(false);
  const [loader, setLoader] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (isFocused) {
      refRBSheet.current.open();
    }
  }, [isFocused]);

  const validateEmail = (userEmail) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(userEmail) === false) {
      setEmailValid(false);
      return false;
    } else {
      setEmailValid(true);
      setEmail(userEmail);
    }
  };

  const getAppSettings = async (id) => {
    const response = await fetch(
      CONSTANT.BaseUrl + "get-app-guppy-setting?userId=" + id
    );
    const json = await response.json();
    dispatch(updateSetting(json.settings));
    dispatch(updateTranslations(json.settings.chatSetting.translations));
    dispatch(updateTab(json.settings.chatSetting.defaultActiveTab));
  };

  const login = () => {
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: "home" }],
    // });
    // return;
    if (email != "" && password != "") {
      setLoader(true);
      axios
        .post(CONSTANT.BaseUrl + "user-login", {
          username: email,
          userpassword: password,
        })
        .then(async (response) => {
          if (response.data.type == "success") {
            await AsyncStorage.setItem(
              "id",
              JSON.stringify(response.data.userInfo.userId)
            );
            getAppSettings(response.data.userInfo.userId);
            await AsyncStorage.setItem(
              "token",
              JSON.stringify(response.data.authToken)
            );
            await AsyncStorage.setItem("loginType", "1");
            refRBSheet.current.close();
            // navigation.navigate("home")
            setLoader(false);
            dispatch(updateTab(settings.chatSetting.defaultActiveTab));

            navigation.reset({
              index: 0,
              routes: [{ name: "homeScreen" }],
            });
          } else if (response.data.type == "error") {
            setLoader(false);
            setShowAlert(true);
            setAlertType("error");
            setTitle("Oops!");
            setDesc("Please check email and password");
            autoHideAlert();
          }
        })
        .catch((error) => {
          setLoader(false);
        });
    } else {
      Keyboard.dismiss();
      setShowAlert(true);
      setAlertType("error");
      setTitle("Oops!");
      setDesc("Must enter the all fields");
      autoHideAlert();
      // Alert.alert("Must enter the all fields")
    }
  };

  const autoHideAlert = () => {
    setTimeout(() => {
      setShowAlert(false);
    }, 2000);
  };
  const hideAlert = () => {
    setShowAlert(false);
  };
  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        resizeMode={"cover"}
        imageStyle={{}}
        style={{ width: "100%", height: "100%" }}
        source={require("../../assets/gallery/loginImage.jpg")}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#00000080",
          }}
        >
          <SafeAreaView>
            <RBSheet
              ref={refRBSheet}
              duration={50}
              closeOnPressMask={false}
              closeOnPressBack={false}
              height={Dimensions.get("window").height / 3}
              customStyles={{
                wrapper: {
                  backgroundColor: "transparent",
                },
                container: {
                  paddingLeft: 15,
                  paddingRight: 15,
                  marginBottom: 30,
                  backgroundColor: "transparent",
                },
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 15,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#fff",
                    paddingBottom: 20,
                  }}
                >
                  <Notification
                    show={showAlert}
                    time={true}
                    type={alertType}
                    title={title}
                    desc={desc}
                  />

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        color: "#0A0F26",
                        fontSize: 16,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {translation.email}
                    </Text>
                    <Text style={{ color: "#FF7300" }}>*</Text>
                  </View>
                  <TextInput
                    style={{
                      fontSize: 15,
                      padding: 5,
                      height: Dimensions.get("window").height / 16,
                      color: "#323232",
                      fontFamily: "Urbanist-Regular",
                      borderColor: "#DDDDDD",
                      borderWidth: 1,
                      borderRadius: 4,
                      marginTop: 10,
                      marginBottom: 10,
                      paddingLeft: 10,
                    }}
                    underlineColorAndroid="transparent"
                    name={"Email"}
                    placeholder={"Enter email id"}
                    placeholderTextColor="#807f7f"
                    onChangeText={(userEmail) => validateEmail(userEmail)}
                  />

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        color: "#0A0F26",
                        fontSize: 16,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {translation.password}
                    </Text>
                    <Text style={{ color: "#FF7300" }}>*</Text>
                  </View>
                  <View
                    style={{
                      justifyContent: "space-between",
                      height: Dimensions.get("window").height / 16,
                      flexDirection: "row",
                      borderColor: "#DDDDDD",
                      borderWidth: 1,
                      borderRadius: 4,
                      marginTop: 10,
                      marginBottom: 10,
                      alignItems: "center",
                    }}
                  >
                    <TextInput
                      style={{
                        width: "90%",
                        fontSize: 15,
                        padding: 5,
                        height: Dimensions.get("window").height / 16,
                        color: "#323232",
                        fontFamily: "Urbanist-Regular",
                        paddingLeft: 10,
                      }}
                      underlineColorAndroid="transparent"
                      name={"password"}
                      placeholder={"Enter password"}
                      placeholderTextColor="#807f7f"
                      value={password}
                      secureTextEntry={secureP}
                      onChangeText={(password) => setPassword(password)}
                    />
                    <Feather
                      onPress={() => setSecureP(!secureP)}
                      style={{ width: "10%" }}
                      name={secureP ? "eye-off" : "eye"}
                      type={"eye"}
                      color={"#999999"}
                      size={16}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => login()}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      height: Dimensions.get("window").height / 16,
                      backgroundColor: "#FF7300",
                      padding: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 5,
                      flexDirection: "row",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontFamily: "Urbanist-Bold",

                        color: "#fff",
                      }}
                    >
                      {translation.start_chat_text}
                    </Text>
                    {loader && (
                      <View style={{ marginLeft: 15 }}>
                        <SkypeIndicator count={7} size={20} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </RBSheet>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

export default loginScreen;
