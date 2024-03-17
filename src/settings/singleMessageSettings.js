import React, { useState, useEffect, useRef } from "react";
import {
  View,
  SafeAreaView,
  Text,
  FlatList,
  Platform,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  PermissionsAndroid,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import RBSheet from "react-native-raw-bottom-sheet";
import MultiSelect from "react-native-multiple-select";
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SkypeIndicator } from "react-native-indicators";
import RNFetchBlob from "rn-fetch-blob";
import Spinner from "react-native-loading-spinner-overlay";
import { useSelector, useDispatch } from "react-redux";
import { updateTab } from "../redux/TabSlice";

singleMessageSettings = ({ route, navigation }) => {
  const refMuteRBSheet = useRef();
  const refReportRBSheet = useRef();
  const refBlockRBSheet = useRef();
  const refClearChatRBSheet = useRef();
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const navigationback = useNavigation();
  const [category, setcategory] = useState([]);
  const [description, setDescription] = useState("");
  const [data, setData] = useState([]);
  const [reportData, setreportData] = useState([]);
  const [spinner, setSpinner] = useState(false);
  const [selectedReportData, setSelectedReportData] = useState([]);
  const [muteStatus, setMuteStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loader, setLoader] = useState(false);
  const [blockType, setBlockType] = useState(0);

  useEffect(() => {
    setData(route.params.mediaAttachments);
    reportReasonData();
    fetchAttachmentData();
  }, []);

  const reportReasonData = async () => {
    const notificationStatus = await AsyncStorage.getItem("notificationStatus");
    setMuteStatus(JSON.parse(notificationStatus));

    return fetch(CONSTANT.BaseUrl + "get-app-guppy-setting", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        for (
          let i = 0;
          i < responseJson.settings.chatSetting.reportingReasons.length;
          i++
        ) {
          reportData[i] = {
            title: responseJson.settings.chatSetting.reportingReasons[i],
          };
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchAttachmentData = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

    let postID = "";
    let actionTo = "";
    if (route.params.chatType == 0) {
      actionTo = route.params.chatId.split("_")[1];
      postID = route.params.chatId;
    } else {
      actionTo = route.params.friendId;
      postID = 0;
    }
    return fetch(
      CONSTANT.BaseUrl +
        "download-guppy-attachments?actionTo=" +
        actionTo +
        "&groupId=0&userId=" +
        JSON.parse(id) +
        "&postId=" +
        postID +
        "&chatType=" +
        route.params.chatType,
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
        setDownloadUrl(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const blockFriend = async (val) => {
    setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "update-user-status",
        {
          actionTo: route.params.friendId,
          userId: JSON.parse(id),
          groupId: 0,
          statusType: val,
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
          refBlockRBSheet.current.close();
          dispatch(updateTab("blocked"));
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };

  const blockPostUser = async (val) => {
    setSpinner(true);
    let actionTo = route.params.chatId.split("_")[1];
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

    axios
      .post(
        CONSTANT.BaseUrl + "update-post-user-status",
        {
          actionTo: actionTo,
          userId: JSON.parse(id),
          groupId: 0,
          statusType: val,
          postId: route.params.friendId,
          blockType: blockType,
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
          refBlockRBSheet.current.close();
          // dispatch(updateTab("blocked"));
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };

  const clearChat = async (val) => {
    let actionTo = "";
    if (route.params.chatType == 0) {
      actionTo = route.params.chatId.split("_")[1];
    }
    setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "clear-guppy-chat",
        {
          actionTo:
            route.params.chatType == 0 ? actionTo : route.params.friendId,
          userId: JSON.parse(id),
          groupId: 0,
          chatType: route.params.chatType,
          postId: route.params.chatType == 0 ? route.params.friendId : "",
          chatId: route.params.chatId,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          refClearChatRBSheet.current.close();
          setSpinner(false);
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };

  const submitreport = async (val) => {
    setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "report-guppy-chat",
        {
          userId: JSON.parse(id),
          chatType: route.params.chatType,
          reportDesc: description,
          reportReason: selectedReportData[0],
          reportAgainst: route.params.name,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          refReportRBSheet.current.close();
          setSpinner(false);
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };

  const updateMuteStatus = async () => {
    setLoader(true);
    let actionTo = "";
    if (route.params.chatType == 0) {
      actionTo = route.params.chatId.split("_")[1];
    }
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "mute-guppy-notifications",
        {
          actionTo:
            route.params.chatType == 0 ? actionTo : route.params.friendId,
          userId: JSON.parse(id),
          groupId: 0,
          postId: route.params.chatType == 0 ? route.params.friendId : "",
          muteType: 0,
          chatType: route.params.chatType,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        if (response.status === 200) {
          if (muteStatus == true) {
            await AsyncStorage.setItem(
              "notificationStatus",
              JSON.stringify(false)
            );
            setMuteStatus(false);
          } else if (muteStatus == false) {
            await AsyncStorage.setItem(
              "notificationStatus",
              JSON.stringify(true)
            );
            setMuteStatus(true);
          }
          setLoader(false);
        } else if (response.status === 203) {
          setLoader(false);
        }
      })
      .catch((error) => {
        setLoader(false);
      });
  };

  const checkPermission = async () => {
    if (Platform.OS === "ios") {
      downloadMedia();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "App needs access to your storage to download Photos",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // console.log("permission granted..");
          downloadMedia();
        } else {
          Alert.alert("Storage Permission Not Granted");
        }
      } catch (error) {
        console.warn(error);
      }
    }
  };

  const downloadMedia = () => {
    let URL = downloadUrl.downloadUrl;
    let ext = ".zip";
    const { config, fs } = RNFetchBlob;
    // const {dirs:{DocumentDir,PictureDir}} = RNFetchBlob.fs
    // const devicePath = Platform.select({ios:DocumentDir,android:PictureDir});
    let options;
    let PictureDir = fs.dirs.PictureDir;
    options = Platform.select({
      ios: {
        fileCache: true,
        path: PictureDir + "/Guppy/Guppy Documents/" + downloadUrl.fileName,
        appendExt: ext,
      },
      android: {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true, // <-- this is the only thing required
          // Optional, override notification setting (default to true)
          notification: true,
          path: PictureDir + "/Guppy/Guppy Documents/" + downloadUrl.fileName,
          description: "Document",
        },
      },
    });
    config(options)
      .fetch("GET", URL)
      .then((res) => {
        if (Platform.OS === "ios") {
          RNFetchBlob.ios.openDocument(res.data);
        }
        // else{
        //   RNFetchBlob.android.actionViewIntent(res.path())
        // }
      });
  };
  const blockSingleUser = () => {
    if (route.params.friendId == route.params.blockedUser) {
      blockFriend("4");
    } else {
      blockFriend("3");
    }
  };
  const blockUnblockPostUser = () => {
    if (route.params.chatId.split("_")[1] == route.params.blockedUser) {
      blockPostUser("4");
      setBlockType(0);
    } else {
      blockPostUser("3");
    }
  };
  return (
    <SafeAreaView style={{ backgroundColor: "#fff", flex: 1 }}>
      <Spinner visible={loader} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 15,
          borderBottomColor: "#ddd",
          borderBottomWidth: 1,
        }}
      >
        <Text
          style={{
            color: "#0A0F26",
            fontSize: 22,
            fontFamily: "Urbanist-Bold",
          }}
        >
          {translation.settings}
        </Text>
        <Entypo
          onPress={() => navigationback.goBack()}
          name="cross"
          type="cross"
          color={settings.chatSetting.secondaryColor}
          size={25}
        />
      </View>
      <FlatList
        columnWrapperStyle={{ marginVertical: 5, marginHorizontal: 10 }}
        showsVerticalScrollIndicator={false}
        numColumns={3}
        data={data}
        keyExtractor={(x, i) => i.toString()}
        ListHeaderComponent={
          <>
            <View
              style={{
                padding: 15,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  color: "#999999",
                  fontSize: 18,
                  marginTop: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                Actions
              </Text>
              {/* <Text style={{
                                color: '#3C57E5',
                                fontSize: 16,
                                marginTop: 15,
                                fontFamily: 'Urbanist-Bold',
                            }}>Search in conversation</Text> */}

              <Text
                onPress={() => updateMuteStatus()}
                style={{
                  color: "#3C57E5",
                  fontSize: 16,
                  marginTop: 15,
                  marginBottom: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                {muteStatus == true
                  ? translation.unmute_conversation
                  : translation.mute_conversation}
              </Text>
            </View>
            {route.params.chatType == 1 ? (
              <>
                {route.params.friendId == route.params.blockedUser ||
                route.params.blockedUser == false ? (
                  <View
                    style={{
                      padding: 15,
                      borderBottomColor: "#ddd",
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "#999999",
                        fontSize: 18,
                        marginTop: 10,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {translation.privacy_settings}
                    </Text>
                    <Text
                      onPress={() => refBlockRBSheet.current.open()}
                      style={{
                        color: "#EF4444",
                        fontSize: 16,
                        marginTop: 15,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {route.params.friendId == route.params.blockedUser
                        ? "Unblock user"
                        : "Block user"}
                    </Text>

                    {settings.chatSetting.reportUserOption && (
                      <Text
                        onPress={() => refReportRBSheet.current.open()}
                        style={{
                          color: "#EF4444",
                          fontSize: 16,
                          marginTop: 15,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        {translation.report_user}
                      </Text>
                    )}
                    {settings.chatSetting.clearChatOption && (
                      <Text
                        onPress={() => refClearChatRBSheet.current.open()}
                        style={{
                          color: "#EF4444",
                          fontSize: 16,
                          marginTop: 15,
                          marginBottom: 10,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        {translation.clear_chat}
                      </Text>
                    )}
                  </View>
                ) : null}
              </>
            ) : (
              <>
                {route.params.chatId.split("_")[1] ==
                  route.params.blockedUser ||
                route.params.blockedUser == false ? (
                  <View
                    style={{
                      padding: 15,
                      borderBottomColor: "#ddd",
                      borderBottomWidth: 1,
                    }}
                  >
                    <Text
                      style={{
                        color: "#999999",
                        fontSize: 18,
                        marginTop: 10,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {translation.privacy_settings}
                    </Text>
                    <Text
                      onPress={() => refBlockRBSheet.current.open()}
                      style={{
                        color: "#EF4444",
                        fontSize: 16,
                        marginTop: 15,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {route.params.chatId.split("_")[1] ==
                      route.params.blockedUser
                        ? "Unblock user"
                        : "Block user"}
                    </Text>

                    {settings.chatSetting.reportUserOption && (
                      <Text
                        onPress={() => refReportRBSheet.current.open()}
                        style={{
                          color: "#EF4444",
                          fontSize: 16,
                          marginTop: 15,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        {translation.report_user}
                      </Text>
                    )}
                    {settings.chatSetting.clearChatOption && (
                      <Text
                        onPress={() => refClearChatRBSheet.current.open()}
                        style={{
                          color: "#EF4444",
                          fontSize: 16,
                          marginTop: 15,
                          marginBottom: 10,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        {translation.clear_chat}
                      </Text>
                    )}
                  </View>
                ) : null}
              </>
            )}
            <View style={{ padding: 15 }}>
              <Text
                style={{
                  color: "#999999",
                  fontSize: 18,
                  marginTop: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                {translation.media}
              </Text>
              {data.length >= 1 && (
                <Text
                  onPress={() => checkPermission()}
                  style={{
                    color: "#3C57E5",
                    fontSize: 15,
                    marginTop: 10,
                    fontFamily: "Urbanist-Bold",
                  }}
                >
                  {translation.download_all}
                </Text>
              )}
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() =>
                item.type == "images"
                  ? navigation.navigate("imagePreview", {
                      image: JSON.stringify(item),
                    })
                  : null
              }
              style={{
                width: "30%",
                backgroundColor: "#CAD4D6",
                borderRadius: 6,
                marginHorizontal: 5,
              }}
            >
              {item.type == "images" && (
                <Image
                  style={{
                    width: "100%",
                    height: 100,
                    borderRadius: 4,
                  }}
                  source={{ uri: item.thumbnail }}
                />
              )}
              {item.type == "video" && (
                <Image
                  style={{
                    width: "100%",
                    height: 100,
                    borderRadius: 4,
                  }}
                  source={require("../../assets/video-thumbnail.jpg")}
                />
              )}
              {item.type == "audio" && (
                <View
                  style={{
                    width: "100%",
                    height: 100,
                    borderRadius: 4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather
                    style={{ paddingLeft: 10 }}
                    name={"music"}
                    type={"music"}
                    color={settings.chatSetting.primaryColor}
                    size={30}
                  />
                  <Text
                    style={{
                      fontFamily: "OpenSans-Regular",
                      lineHeight: 25,
                      fontSize: 13,
                      color: "#0A0F26",
                    }}
                  >
                    {item.fileName.length > 10
                      ? item.fileName.substring(0, 10) + " ..."
                      : item.fileName}
                  </Text>
                </View>
              )}
              {item.type == "file" && (
                <View
                  style={{
                    width: "100%",
                    height: 100,
                    borderRadius: 4,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Feather
                    style={{ paddingLeft: 10 }}
                    name={"file"}
                    type={"file"}
                    color={settings.chatSetting.primaryColor}
                    size={30}
                  />
                  <Text
                    style={{
                      fontFamily: "OpenSans-Regular",
                      lineHeight: 25,
                      fontSize: 13,
                      color: "#0A0F26",
                    }}
                  >
                    {item.fileName.length > 10
                      ? item.fileName.substring(0, 10) + " ..."
                      : item.fileName}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <>
            <View style={{ height: 30 }}></View>
            {data.length < 1 && (
              <View
                style={{
                  marginTop: 20,
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={{
                    width: 50,
                    height: 50,
                  }}
                  source={require("../../assets/placeholder.png")}
                />
                <Text
                  style={{
                    fontFamily: "Urbanist-Regular",
                    color: "#999999",
                    marginTop: 20,
                    fontSize: 14,
                  }}
                >
                  No attachments to show
                </Text>
              </View>
            )}
          </>
        }
      />
      <RBSheet
        ref={refReportRBSheet}
        height={Dimensions.get("window").height * 0.65}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 20,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: "#0A0F26",
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.report_user}
          </Text>
          <Text
            style={{
              color: "#0A0F26",
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              lineHeight: 28,
              marginTop: 5,
            }}
          >
            {translation.report_description}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {translation.report_title}
            </Text>
            <Text style={{ color: "#FF7300" }}>*</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              justifyContent: "space-between",
            }}
          >
            {/* {
                            reportData.length >= 1 && */}
            <MultiSelect
              onSelectedItemsChange={(value) => setSelectedReportData(value)}
              uniqueKey="title"
              items={reportData}
              selectedItems={selectedReportData}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={translation.report_reason}
              selectText={translation.report_reason}
              styleMainWrapper={{
                backgroundColor: "#fff",
                borderRadius: 4,
                overflow: "hidden",
                width: "100%",
                paddingVertical: 20,
              }}
              styleDropdownMenuSubsection={{
                backgroundColor: "#fff",
                paddingRight: -7,
                height: 70,
                paddingLeft: 10,
                paddingTop: 15,
                borderWidth: 0.5,
                borderColor: "#ddd",
                borderRadius: 5,
              }}
              styleSelectorContainer={{
                marginTop: 10,
                justifyContent: "center",
              }}
              onChangeInput={(text) => {}}
              displayKey="title"
              submitButtonText={"Submit"}
            />
            {/* } */}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {translation.report_issue_detail}
            </Text>
            <Text style={{ color: "#FF7300" }}>*</Text>
          </View>
          <TextInput
            style={{
              fontSize: 15,
              padding: 10,
              height: 150,
              color: "#323232",
              fontFamily: "Urbanist-Regular",
              borderColor: "#DDDDDD",
              borderWidth: 1,
              borderRadius: 4,
              marginTop: 10,
              marginBottom: 10,
              textAlignVertical: "top",
            }}
            underlineColorAndroid="transparent"
            name={"Description"}
            placeholder={translation.report_add_description}
            placeholderTextColor="#807f7f"
            value={description}
            multiline={true}
            onChangeText={(description) => setDescription(description)}
          />
          <TouchableOpacity
            onPress={() => submitreport()}
            style={{
              marginTop: 10,
              flexDirection: "row",
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FF7300",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",

                color: "#fff",
              }}
            >
              {translation.report_submit}
            </Text>
            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refReportRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              //   borderRadius: 5,
              //  borderColor: '#ddd',
              //  borderWidth: 3,
              marginVertical: 5,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",

                color: "#999999",
              }}
            >
              {translation.report_cancel}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 20 }}></View>
        </ScrollView>
      </RBSheet>
      <RBSheet
        ref={refBlockRBSheet}
        height={Dimensions.get("window").height * 0.35}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 20,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            padding: 15,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 4,
                marginBottom: 10,
              }}
              source={require("../../assets/warning.png")}
            />
          </View>
          {route.params.chatType == 1 ? (
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 24,
                fontFamily: "Urbanist-Bold",
                textAlign: "center",
              }}
            >
              {" "}
              {route.params.friendId == route.params.blockedUser
                ? translation.unblock_now + "?"
                : translation.block_user + "?"}
            </Text>
          ) : (
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 24,
                fontFamily: "Urbanist-Bold",
                textAlign: "center",
              }}
            >
              {" "}
              {route.params.chatId.split("_")[1] == route.params.blockedUser
                ? translation.unblock_now + "?"
                : translation.block_user + "?"}
            </Text>
          )}

          {route.params.chatType == 1 ? (
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 15,
                fontFamily: "OpenSans-Regular",
                textAlign: "center",
                lineHeight: 28,
              }}
            >
              {route.params.friendId == route.params.blockedUser
                ? translation.unblock_user_description
                : translation.block_user_description}
            </Text>
          ) : (
            <Text
              style={{
                color: "#0A0F26",
                fontSize: 15,
                fontFamily: "OpenSans-Regular",
                textAlign: "center",
                lineHeight: 28,
              }}
            >
              {route.params.chatId.split("_")[1] == route.params.blockedUser
                ? translation.unblock_user_description
                : translation.block_user_description}
            </Text>
          )}
          {route.params.chatType == 0 &&
            route.params.chatId.split("_")[1] != route.params.blockedUser && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",

                  marginTop: 15,
                }}
              >
                <TouchableOpacity
                  onPress={() => setBlockType(1)}
                  style={{
                    flexDirection: "row",
                    marginVertical: 5,
                  }}
                >
                  <View
                    style={{
                      marginRight: 10,
                      width: 25,
                      height: 25,
                      borderRadius: 25 / 2,
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#DDDDDD",
                      borderWidth: 1,
                      backgroundColor: blockType == 1 ? "#22C55E" : "#fff",
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      fontFamily: "Urbanist-Medium",
                      fontSize: 16,
                      letterSpacing: 0.5,
                      lineHeight: 26,
                      color: "#1C1C1C",
                    }}
                  >
                    For this post
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setBlockType(0)}
                  style={{
                    flexDirection: "row",
                    marginVertical: 5,
                    marginLeft: 20,
                  }}
                >
                  <View
                    style={{
                      marginRight: 10,
                      width: 25,
                      height: 25,
                      borderRadius: 25 / 2,
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#DDDDDD",
                      borderWidth: 1,
                      backgroundColor: blockType == 0 ? "#22C55E" : "#fff",
                    }}
                  >
                    <View
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: "#fff",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </View>

                  <Text
                    style={{
                      fontFamily: "Urbanist-Medium",
                      fontSize: 16,
                      letterSpacing: 0.5,
                      lineHeight: 26,
                      color: "#1C1C1C",
                    }}
                  >
                    For all post
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          <TouchableOpacity
            onPress={() =>
              route.params.chatType == 1
                ? blockSingleUser()
                : blockUnblockPostUser()
            }
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FF7300",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              flexDirection: "row",
            }}
          >
            {route.params.chatType == 1 ? (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Urbanist-Bold",
                  color: "#fff",
                }}
              >
                {route.params.friendId == route.params.blockedUser
                  ? translation.unblock_button
                  : translation.block_user_button}
              </Text>
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: "Urbanist-Bold",
                  color: "#fff",
                }}
              >
                {route.params.chatId.split("_")[1] == route.params.blockedUser
                  ? translation.unblock_button
                  : translation.block_user_button}
              </Text>
            )}

            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refBlockRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",

                color: "#999999",
              }}
            >
              {translation.not_right_now}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 20 }}></View>
        </ScrollView>
      </RBSheet>
      <RBSheet
        ref={refClearChatRBSheet}
        height={Dimensions.get("window").height * 0.35}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            marginBottom: 20,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            padding: 15,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              style={{
                width: 50,
                height: 50,
                borderRadius: 4,
                marginBottom: 10,
              }}
              source={require("../../assets/warning.png")}
            />
          </View>
          <Text
            style={{
              color: "#0A0F26",
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            {translation.clear_chat}
          </Text>
          <Text
            style={{
              color: "#0A0F26",
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            {translation.clear_chat_description}
          </Text>

          <TouchableOpacity
            onPress={() => clearChat()}
            style={{
              flexDirection: "row",
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FF7300",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",
                color: "#fff",
              }}
            >
              {translation.clear_chat_button}
            </Text>
            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refClearChatRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 5,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: "Urbanist-Bold",

                color: "#999999",
              }}
            >
              {translation.not_right_now}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 20 }}></View>
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

export default singleMessageSettings;
