import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Platform,
  TouchableOpacity,
  Alert,
  ImageBackground,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import ImagePicker from "react-native-image-crop-picker";
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BarIndicator, UIActivityIndicator } from "react-native-indicators";
import { useSelector, useDispatch } from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import { useNavigation } from "@react-navigation/native";
import { updateTab, updateChatTab } from "../redux/TabSlice";
import Notification from "../components/Notification";
import {
  updateUsers,
  updateUsersRequest,
  updateChat,
  updateGroupChat,
  updateFriends,
  updateBlockedUsers,
  updatePostChat,
  updateWhatsappChat,
  updateSupportMessages,
  updateSupportAgents,
} from "../redux/mainListingSlice";

const profile = () => {
  const dispatch = useDispatch();
  const translation = useSelector((state) => state.setting.translations);
  const settings = useSelector((state) => state.setting.settings);
  const navigationforword = useNavigation();
  const [mute, setMute] = useState(false);
  const [name, setName] = useState("");
  const [headerName, setHeaderName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [spinner, setSpinner] = useState(false);
  const [image, setImage] = useState(null);
  const [user_avatar, setAvatar] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const choosePictureFromGallery = async () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 1200,
      mediaType: "photo",
    }).then((image) => {
      setImage(image);
    });
  };

  const saveProfileData = async () => {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    if (name != "" && email != "" && phone != "") {
      setSpinner(true);
      const formData = new FormData();
      formData.append("userId", JSON.parse(id));
      formData.append("userName", name);
      formData.append("userEmail", email);
      formData.append("userPhone", phone);

      if (image != null) {
        formData.append("removeAvatar", 1);
        formData.append(0, {
          name: Platform.OS == "ios" ? image.filename : "profileImages",
          type: image.mime,
          uri: Platform.OS == "ios" ? image.sourceURL : image.path,
          error: 0,
          size: JSON.parse(image.size),
        });
        formData.append("userAvatar", user_avatar);
      } else if (user_avatar != null) {
        formData.append("removeAvatar", 0);
        formData.append("userAvatar", user_avatar);
      } else if (image == null && user_avatar == null) {
        formData.append("removeAvatar", 1);
      }

      axios
        .post(CONSTANT.BaseUrl + "update-profile-info", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: "Bearer " + JSON.parse(token),
          },
        })
        .then(async (response) => {
          if (response.status === 200) {
            setSpinner(false);
            setShowAlert(true);
            1;
            setAlertType("success");
            setTitle("Success");
            setDesc("Updated successfully");
            fetchUserProfile();
          } else if (response.status === 203) {
            setSpinner(false);
            setShowAlert(true);
            setAlertType("error");
            setTitle("Oops!");
            setDesc(response.data.messgae);
          }
        })
        .catch((error) => {
          setSpinner(false);
        });
    } else {
      setShowAlert(true);
      setAlertType("error");
      setTitle("Oops!");
      setDesc("Please enter complete data");
    }
  };
  const fetchUserProfile = async () => {
    setSpinner(true);
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    return fetch(
      CONSTANT.BaseUrl + "load-profile-info?userId=" + JSON.parse(id),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + JSON.parse(token),
        },
      }
    )
      .then((response) => response.json())
      .then((responseJson) => {
        setSpinner(false);
        setImage(null);
        setHeaderName(responseJson.userInfo.userName);
        setName(responseJson.userInfo.userName);
        setEmail(responseJson.userInfo.userEmail);
        setPhone(responseJson.userInfo.userPhone);
        setMute(responseJson.userInfo.muteNotification);
        if (responseJson.userInfo.userAvatar === "") {
          setAvatar(null);
          setImage(null);
        } else {
          setAvatar(responseJson.userInfo.userAvatar);
        }
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };
  const setImageState = () => {
    setAvatar(null);
    setImage(null);
  };
  const muteUnmuteNotification = async () => {
    setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "mute-guppy-notifications",
        {
          muteType: 1,
          actionTo: 0,
          userId: JSON.parse(id),
          groupId: 0,
          postId: 0,
          chatType: 0,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          setSpinner(false);
          setMute(!mute);
        } else if (response.status === 203) {
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };
  const logoutUser = async () => {
    await AsyncStorage.removeItem("id");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("updateChats");

    navigationforword.reset({
      index: 0,
      routes: [{ name: "loginScreen" }],
    });
    dispatch(updateUsers([]));
    dispatch(updateUsersRequest([]));
    dispatch(updateChat([]));
    dispatch(updateGroupChat([]));
    dispatch(updateFriends([]));
    dispatch(updateBlockedUsers([]));
    dispatch(updatePostChat([]));
    dispatch(updateWhatsappChat([]));
    dispatch(updateTab(settings?.chatSetting?.defaultActiveTab));
    dispatch(updateSupportMessages([]));
    dispatch(updateSupportAgents([]));
  };
  const hideAlert = () => {
    setShowAlert(false);
  };
  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <Notification
        show={showAlert}
        hide={hideAlert}
        type={alertType}
        title={title}
        desc={desc}
      />
      <View
        style={{ backgroundColor: "#fff", justifyContent: "center", flex: 1 }}
      >
        <Spinner
          visible={spinner}
          //  color={settings?.chatSetting?.primaryColor}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            padding: 15,
            borderBottomColor: "#ddd",
            borderBottomWidth: 1,
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: settings?.chatSetting?.secondaryColor,
                fontSize: 16,
                lineHeight: 32,
                letterSpacing: 0.5,
                marginRight: 10,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {translation.profile_settings}
            </Text>
          </View>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              paddingHorizontal: 15,
              marginTop: 20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  marginBottom: 5,
                  fontFamily: "Urbanist-Medium",
                }}
              >
                {translation.full_name}
              </Text>
              <Text style={{ color: settings?.chatSetting?.primaryColor }}>
                *
              </Text>
            </View>
            <TextInput
              style={{
                fontSize: 16,
                padding: 5,
                height: 50,
                color: "#323232",
                fontFamily: "Urbanist-Regular",
                borderColor: "#DDDDDD",
                borderWidth: 1.5,
                borderRadius: 4,
                marginTop: 10,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              underlineColorAndroid="transparent"
              name={"name"}
              placeholder={translation.your_name}
              placeholderTextColor="#807f7f"
              value={name}
              editable={!settings?.chatSetting?.hideAccSettings}
              onChangeText={(name) => setName(name)}
            />
          </View>
          <View
            style={{
              paddingHorizontal: 15,
              marginVertical: 10,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  marginBottom: 5,
                  fontFamily: "Urbanist-Medium",
                }}
              >
                {translation.email}
              </Text>
              <Text style={{ color: settings?.chatSetting?.primaryColor }}>
                *
              </Text>
            </View>
            <TextInput
              style={{
                fontSize: 16,
                padding: 5,
                height: 50,
                color: "#323232",
                fontFamily: "Urbanist-Regular",
                borderColor: "#DDDDDD",
                borderWidth: 1.5,
                borderRadius: 4,
                marginTop: 10,
                marginBottom: 10,
                paddingHorizontal: 10,
              }}
              underlineColorAndroid="transparent"
              name={"email"}
              placeholder={translation.your_email}
              editable={!settings?.chatSetting?.hideAccSettings}
              placeholderTextColor="#807f7f"
              value={email}
              onChangeText={(email) => setEmail(email)}
            />
          </View>
          <View
            style={{
              paddingHorizontal: 15,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{
                  color: "#000",
                  fontSize: 16,
                  marginBottom: 5,
                  fontFamily: "Urbanist-Medium",
                }}
              >
                {translation.phone}
              </Text>
              <Text style={{ color: settings?.chatSetting?.primaryColor }}>
                *
              </Text>
            </View>
            <TextInput
              style={{
                fontSize: 16,
                padding: 5,
                height: 50,
                color: "#323232",
                fontFamily: "Urbanist-Regular",
                borderColor: "#DDDDDD",
                borderWidth: 1.5,
                borderRadius: 4,
                marginVertical: 10,
                paddingHorizontal: 10,
              }}
              underlineColorAndroid="transparent"
              name={"phone"}
              placeholder={translation.your_phone}
              editable={!settings?.chatSetting?.hideAccSettings}
              placeholderTextColor="#807f7f"
              value={phone}
              inputType={"phone-pad"}
              onChangeText={(phone) => setPhone(phone)}
            />
          </View>
          <View
            style={{
              borderColor: "#DDDDDD",
              borderWidth: 1.5,
              borderStyle: "dashed",
              paddingHorizontal: 15,
              marginHorizontal: 15,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user_avatar == null && image == null ? (
              // <TouchableOpacity
              //   onPress={() => choosePictureFromGallery()}
              //   activeOpacity={0.9}
              //   style={{
              //     backgroundColor: "#F7F7F7",
              //     borderRadius: 3,
              //     marginBottom: 20,
              //     marginTop: 30,
              //     height: 90,
              //     width: 90,
              //     borderRadius: 90 / 2,
              //   }}
              // >
              //   <Image
              //     style={{
              //       height: 90,
              //       width: 90,
              //       borderRadius: 90 / 2,
              //     }}
              //     source={require("../../assets/placeholder.png")}
              //   />
              // </TouchableOpacity>
              <ImageBackground
                onPress={() => choosePictureFromGallery()}
                source={require("../../assets/placeholder.png")}
                resizeMode="cover"
                imageStyle={{
                  borderRadius: 90 / 2,
                  alignItems: "flex-end",
                  alignContent: "flex-end",
                }}
                style={{
                  height: 90,
                  width: 90,
                  marginTop: 30,
                  marginBottom: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => choosePictureFromGallery()}
                  style={{
                    backgroundColor: "#22C55E",
                    borderColor: "#fff",
                    borderWidth: 3,
                    width: 30,
                    height: 30,
                    borderRadius: 30 / 2,
                    alignItems: "center",
                    justifyContent: "center",
                    alignSelf: "flex-end",
                    marginTop: 60,
                    zIndex: 1000,
                  }}
                >
                  <Feather name={"plus"} size={15} color={"#fff"} />
                </TouchableOpacity>
              </ImageBackground>
            ) : (
              <>
                {image != null ? (
                  <ImageBackground
                    source={{
                      uri: Platform.OS === "ios" ? image.sourceURL : image.path,
                    }}
                    resizeMode="cover"
                    imageStyle={{
                      borderRadius: 90 / 2,
                      alignItems: "flex-end",
                      alignContent: "flex-end",
                    }}
                    style={{
                      height: 90,
                      width: 90,
                      marginTop: 30,
                      marginBottom: 20,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setImageState()}
                      style={{
                        backgroundColor: "#EF4444",
                        borderColor: "#fff",
                        borderWidth: 3,
                        width: 30,
                        height: 30,
                        borderRadius: 30 / 2,
                        alignItems: "center",
                        justifyContent: "center",
                        alignSelf: "flex-end",
                        marginTop: 60,
                        zIndex: 1000,
                      }}
                    >
                      <Feather name={"x"} size={15} color={"#fff"} />
                    </TouchableOpacity>
                  </ImageBackground>
                ) : (
                  <>
                    <ImageBackground
                      source={{
                        uri:
                          user_avatar.slice(0, 5) == "https"
                            ? user_avatar
                            : "https:" + user_avatar,
                      }}
                      resizeMode="cover"
                      imageStyle={{
                        borderRadius: 90 / 2,
                        alignItems: "flex-end",
                        alignContent: "flex-end",
                      }}
                      style={{
                        height: 90,
                        width: 90,
                        marginTop: 30,
                        marginBottom: 20,
                      }}
                    >
                      {!settings?.chatSetting?.hideAccSettings && (
                        <TouchableOpacity
                          onPress={() => setImageState()}
                          style={{
                            backgroundColor: "#EF4444",
                            borderColor: "#fff",
                            borderWidth: 3,
                            width: 30,
                            height: 30,
                            borderRadius: 30 / 2,
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "flex-end",
                            marginTop: 60,
                            zIndex: 1000,
                          }}
                        >
                          <Feather name={"x"} size={15} color={"#fff"} />
                        </TouchableOpacity>
                      )}
                    </ImageBackground>
                  </>
                )}
              </>
            )}
            <View style={{ flexDirection: "row", marginBottom: 30 }}>
              <Text
                style={{
                  fontFamily: "Urbanist-Regular",
                  color: "#000",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 22,
                  letterSpacing: 0.5,
                }}
              >
                Click on the button above to select your profile photo
              </Text>
            </View>
          </View>

          <View
            style={{
              padding: 15,
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {/* <View
              style={{
                alignItems: "center",
                paddingVertical: 10,
                justifyContent: "center",
                width: "32%",
                borderRadius: 4,
                borderColor: "#ddd",
                borderWidth: 1,
              }}
            >
              <Feather name={"moon"} size={20} color={"#999999"} />
              <Text
                style={{
                  color: "#000",
                  fontSize: 11,
                  marginBottom: 5,
                  marginTop: 5,
                  fontFamily: "OpenSans-Bold",
                }}
              >
                Night mode
              </Text>
            </View> */}

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => muteUnmuteNotification()}
              style={{
                alignItems: "center",
                paddingVertical: 10,
                justifyContent: "center",
                width: "49%",
                borderRadius: 4,
                borderColor: "#ddd",
                borderWidth: 1,
              }}
            >
              <Feather
                name={mute ? "volume-x" : "volume-2"}
                color={mute ? "#999999" : "#22C55E"}
                size={20}
              />
              <Text
                style={{
                  color: "#000",
                  fontSize: 11,
                  marginBottom: 5,
                  marginTop: 5,
                  fontFamily: "OpenSans-Bold",
                }}
              >
                {translation.mute_alert_txt}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => logoutUser()}
              style={{
                alignItems: "center",
                paddingVertical: 10,
                justifyContent: "center",
                width: "49%",
                borderRadius: 4,
                borderColor: "#ddd",
                borderWidth: 1,
              }}
            >
              <Feather name={"power"} size={20} color={"#EF4444"} />
              <Text
                style={{
                  color: "#000",
                  fontSize: 11,
                  marginBottom: 5,
                  marginTop: 5,
                  fontFamily: "OpenSans-Bold",
                }}
              >
                {translation.logout}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {!settings?.chatSetting?.hideAccSettings && (
        <View>
          <TouchableOpacity
            onPress={() => saveProfileData()}
            style={{
              backgroundColor: settings?.chatSetting?.primaryColor,
              alignItems: "center",
              marginTop: 15,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                marginVertical: 15,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {translation.save_changes}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default profile;
