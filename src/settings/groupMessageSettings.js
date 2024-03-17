import React, { useState, useRef, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import ListCard from "../home/listCard";
import RBSheet from "react-native-raw-bottom-sheet";
import MultiSelect from "react-native-multiple-select";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CONSTANT from "../constant/constant";
import Feather from "react-native-vector-icons/Feather";
import ImagePicker from "react-native-image-crop-picker";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { SkypeIndicator } from "react-native-indicators";
import RNFetchBlob from "rn-fetch-blob";
import Spinner from "react-native-loading-spinner-overlay";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { updateTab } from "../redux/TabSlice";

groupMessageSettings = ({ route, navigation }) => {
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const refChangeTitleRBSheet = useRef();
  const refMuteRBSheet = useRef();
  const refLeavingRBSheet = useRef();
  const refDeleteRBSheet = useRef();
  const refReportRBSheet = useRef();
  const refMakeAnAdminRBSheet = useRef();
  const refClearChatRBSheet = useRef();
  const dispatch = useDispatch();
  const [groupTitle, setGroupTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [reportReason, setReportReason] = useState("");
  const [description, setDescription] = useState("");
  const [selectedReportData, setSelectedReportData] = useState([]);
  const [searchOn, setSearchOn] = useState(false);
  const [media, setMedia] = useState([]);
  const [muteStatus, setMuteStatus] = useState("");
  const [image, setImage] = useState(null);
  const [disable, setDisable] = useState(false);
  const [user_avatar, setAvatar] = useState(null);
  const [loader, setLoader] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [reportData, setreportData] = useState([]);
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState([]);
  const [selectedGroupAdminLeave, setSelectedGroupAdminLeave] = useState([]);
  const [checkAdmin, setCheckAdmin] = useState(null);
  const [checkUsers, setCheckUsers] = useState(null);
  const [selectedAdminitem, setSelectedAdminitem] = useState(false);
  const [selectedUseritem, setSelectedUseritem] = useState(false);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [data, setData] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [primary, setPrimary] = useState("");
  const [secondry, setSecondry] = useState("");
  const [groupRole, setGroupRole] = useState("0");
  const [notMember, setNotMember] = useState(false);
  const [memberCount, setMemberCount] = useState(10);

  useEffect(async () => {
    const id = await AsyncStorage.getItem("id");
    Object.entries(route.params.members).map(([key, value]) => {
      if (value.memberStatus == "1") {
        selectedGroupUsers.push(parseInt(value.userId));
      }
      if (value.groupRole != "0") {
        selectedGroupAdmin.push(parseInt(value.userId));
      }
      if (value.userId == JSON.parse(id)) {
        setGroupRole(value.groupRole);
      }
      setRefresh(!refresh);
    });
    setGroupTitle(route.params.groupTitle);
    if (route.params.groupDetail != null) {
      setDisable(route.params.groupDetail.disableReply);
    } else {
      setNotMember(true);
    }
    // fetchGroupUser();
    setColorData();
    fetchAttachmentData()
    groupUsersList();
  }, []);

  const groupUsersList = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "get-guppy-group-users?offset=" +
        offset +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id),
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

        setGroupData(responseJson.guppyGroupUsers);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const fetchAttachmentData = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "download-guppy-attachments?actionTo=" +
        route.params.friendId +
        "&groupId="+route.params.friendId+"&userId=" +
        JSON.parse(id) +
        "&postId=0",
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

  const searchUsersData = (val) => {
    setSearch(val);
  };

  const PushInArray = (item, index) => {
    setCheckUsers(index);
    if (selectedGroupUsers.includes(item.userId)) {
      const index = selectedGroupUsers.indexOf(item.userId);
      if (index > -1) {
        selectedGroupUsers.splice(index, 1);
        selectedGroupAdmin.splice(index, 1);
      }
      setSelectedUseritem(false);
    } else {
      selectedGroupUsers.push(item.userId);
      setSelectedUseritem(true);
    }
  };

  const PushInArrayAdmin = (item, index) => {
    setCheckAdmin(index);
    if (selectedGroupAdmin.includes(item.userId)) {
      const index = selectedGroupAdmin.indexOf(item.userId);
      if (index > -1) {
        selectedGroupAdmin.splice(index, 1);
      }
      setSelectedAdminitem(false);
    } else {
      selectedGroupAdmin.push(item.userId);
      setSelectedAdminitem(true);
    }
  };
  const PushInArrayAdminBeforeLeave = (item, index) => {
    setCheckAdmin(index);
    if (selectedGroupAdminLeave.includes(item.userId)) {
      const index = selectedGroupAdminLeave.indexOf(item.userId);
      if (index > -1) {
        selectedGroupAdminLeave.splice(index, 1);
      }
      setSelectedAdminitem(false);
    } else {
      selectedGroupAdminLeave.push(item.userId);
      setSelectedAdminitem(true);
    }
  };

  const choosePictureFromGallery = async () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 1200,
      mediaType: "photo",
    }).then((image) => {
      setImage(image);
    });
  };

  const setImageState = () => {
    setAvatar(null);
    setImage(null);
  };

  useEffect(() => {
    setMedia(route.params.mediaAttachments);
    Object.entries(route.params.members).map(([key, value]) => {
      data.push(value);
    });
    setColorData();
    reportReasonData();
  }, []);

  const setColorData = async () => {
    const primaryColor = await AsyncStorage.getItem("primaryColor");
    const secondaryColor = await AsyncStorage.getItem("secondaryColor");
    setPrimary(primaryColor);
    setSecondry(secondaryColor);
  };

  const updateMuteStatus = async () => {
    setLoader(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

    axios
      .post(
        CONSTANT.BaseUrl + "mute-guppy-notifications",
        {
          actionTo: route.params.friendId,
          userId: JSON.parse(id),
          groupId: route.params.friendId,
          postId: "",
          chatId: route.params.chatId,
          muteType: 0,
          chatType: "2",
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

  const reportReasonData = async () => {
    const notificationStatus = await AsyncStorage.getItem("notificationStatus");
    setMuteStatus(JSON.parse(notificationStatus));
    const primaryColor = await AsyncStorage.getItem("primaryColor");
    const secondaryColor = await AsyncStorage.getItem("secondaryColor");
    setPrimary(primaryColor);
    setSecondry(secondaryColor);
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

  const clearChat = async (val) => {
    // setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "clear-guppy-chat",
        {
          actionTo: 0,
          userId: JSON.parse(id),
          groupId: route.params.friendId,
          chatType: "2",
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
          // setSpinner(false);
          dispatch(updateTab("private_chats"));
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          // setSpinner(false);
        }
      })
      .catch((error) => {
        // setSpinner(false);
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
          chatId: route.params.chatId,
          chatType: "2",
          reportDesc: description,
          reportReason: selectedReportData[0],
          reportAgainst: groupTitle,
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

  const updateGroup = async () => {
    setSpinner(true);
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    let memberIds = [];
    let adminIds = [];

    for (var i = 0; i < selectedGroupUsers.length; i++) {
      if (selectedGroupUsers[i] != JSON.parse(id)) {
        memberIds.push(selectedGroupUsers[i]);
      }
    }
    for (var i = 0; i < selectedGroupAdmin.length; i++) {
      if (selectedGroupAdmin[i] != JSON.parse(id)) {
        adminIds.push(selectedGroupAdmin[i]);
      }
    }

    axios
      .post(
        CONSTANT.BaseUrl + "update-guppy-group",
        {
          userId: JSON.parse(id),
          groupId: route.params.friendId,
          disableReply: disable,
          groupTitle: groupTitle,
          groupImage: image,
          memberIds: memberIds.toString(),
          adminIds: adminIds.toString(),
          removeImage: "",
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
          // dispatch(updateTab("private_chats"))
          refChangeTitleRBSheet.current.close();
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
          setStatusLoader(false);
          setSpinner(false);
        }
      })
      .catch((error) => {
        setSpinner(false);
      });
  };

  const leaveGroup = async () => {
    setSpinner(true)
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "leave-guppy-group",
        {
          userId: JSON.parse(id),
          groupId: route.params.friendId,
          adminIds: selectedGroupAdminLeave,
          groupRole: groupRole,
          memberId: JSON.parse(id),
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
     setSpinner(false)
        refLeavingRBSheet.current.close()
        navigation.navigate("homeScreen");
      })
      .catch((error) => {
     setSpinner(false)
        // console.log(error);
      });
  };
  const deleteGroup = async () => {
    setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    axios
      .post(
        CONSTANT.BaseUrl + "delete-guppy-group",
        {
          userId: JSON.parse(id),
          groupId: route.params.friendId,
        },
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
      .then(async (response) => {
        setSpinner(false);

        if (response.status === 200) {
          refDeleteRBSheet.current.close();
          navigation.navigate("homeScreen");
        } else if (response.status === 203) {
        }
      })
      .catch((error) => {
        setSpinner(false);
        // console.log(error);
      });
  };

  const makeAnAdminSheet = () => {
    if (groupRole != "0") {
      refMakeAnAdminRBSheet.current.open();
    } else {
      leaveGroup();
    }
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
      });
  };

  return (
    <SafeAreaView>
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
            color: secondry,
            fontSize: 22,
            fontFamily: "Urbanist-Bold",
          }}
        >
          Settings
        </Text>
        <Entypo
          onPress={() => navigation.goBack()}
          name="cross"
          type="cross"
          color={secondry}
          size={25}
        />
      </View>
      <FlatList
        ListHeaderComponent={
          <>
            {route.params.groupDetail != null && (
              <>
                <View
                  style={{ borderBottomColor: "#ddd", borderBottomWidth: 1 }}
                >
                  <View style={{ marginLeft: 15 }}>
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
                    {groupRole != "0" && (
                      <Text
                        onPress={() => refChangeTitleRBSheet.current.open()}
                        style={{
                          color: "#3C57E5",
                          fontSize: 16,
                          marginTop: 15,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        Edit group preferences
                      </Text>
                    )}
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
                </View>
                <View style={{ padding: 15 }}>
                  <Text
                    style={{
                      color: "#999999",
                      fontSize: 18,
                      marginTop: 10,
                      marginBottom: 10,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    Group users
                  </Text>
                </View>
              </>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
        //   style={styles.TopRatedFlatlistStyle}
        data={data}
        keyExtractor={(x, i) => i.toString()}
        renderItem={({ item, index }) => (
          <>
            {item.memberStatus == 1 && (
              <>
                {index <= memberCount && (
                  <>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    // onPress={() => navigation.navigate("messageDetail")}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        alignContent: "center",
                        paddingVertical: 10,
                        marginLeft: 15,
                      }}
                    >
                      {item.userAvatar != "" ? (
                        <View>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 30 / 2,
                            }}
                            source={{
                              uri:
                                item.userAvatar.slice(0, 5) == "https"
                                  ? item.userAvatar
                                  : "https:" + item.userAvatar,
                            }}
                          />
                        </View>
                      ) : (
                        <View>
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 30 / 2,
                            }}
                            source={require("../../assets/placeholder.png")}
                          />
                        </View>
                      )}
                      <Text
                        style={{
                          marginLeft: 10,
                          color: secondry,
                          fontSize: 14,
                          fontFamily: "Urbanist-Bold",
                        }}
                      >
                        {item.userName}
                      </Text>
                      {item.groupRole != "0" && (
                        <Text
                          style={{
                            marginLeft: 10,
                            color: "#999999",
                            fontSize: 10,
                            fontFamily: "Urbanist-Bold",
                            borderColor: "#999999",
                            borderWidth: 0.6,
                            borderRadius: 3,
                            padding: 3,
                          }}
                        >
                          {item.groupRole != "2"
                            ? "Owner"
                            : item.groupRole != "1"
                            ? "Admin"
                            : null}
                        </Text>
                      )}

                      {item.type == "sent" && (
                        <View
                          style={{
                            padding: 5,
                            borderColor: "#DDDDDD",
                            borderWidth: 1,
                            borderRadius: 3,
                            marginLeft: 20,
                            paddingHorizontal: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: "#999999",
                              fontSize: 10,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            ADMIN
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                  {index == memberCount &&
                    <TouchableOpacity
                    onPress={()=> setMemberCount(memberCount+10)}
                  style={{
                    padding: 5,
                    borderRadius: 3,
                    alignItems:"center",
                    justifyContent:"center",
                    marginVertical: 10,
                    width:"100%"
                  }}
                >
                  <Text
                    style={{
                      color: "#3c57e5",
                      fontSize: 14,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    Load More
                  </Text>
                </TouchableOpacity>}
                </>
                )}
              </>
            )}
          </>
        )}
        ListFooterComponent={
          <>
            <View
              style={{
                padding: 15,
                borderBottomColor: "#ddd",
                borderBottomWidth: 1,
              }}
            >
              <View>
                <Text
                  style={{
                    color: "#999999",
                    fontSize: 18,
                    marginTop: 10,
                    fontFamily: "Urbanist-Bold",
                  }}
                >
                  Privacy settings
                </Text>
                {route.params.groupDetail != null && (
                  <Text
                    onPress={() => refLeavingRBSheet.current.open()}
                    style={{
                      color: "#EF4444",
                      fontSize: 16,
                      marginTop: 15,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    Leave group
                  </Text>
                )}

                {notMember && (
                  <Text
                    onPress={() => refDeleteRBSheet.current.open()}
                    style={{
                      color: "#EF4444",
                      fontSize: 16,
                      marginTop: 15,
                      fontFamily: "Urbanist-Bold",
                    }}
                  >
                    Delete group
                  </Text>
                )}

                <Text
                  onPress={() => refReportRBSheet.current.open()}
                  style={{
                    color: "#EF4444",
                    fontSize: 16,
                    marginTop: 15,
                    fontFamily: "Urbanist-Bold",
                  }}
                >
                  Report group
                </Text>
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
                  Clear chat
                </Text>
              </View>
            </View>
            <View style={{ paddingVertical: 15, marginHorizontal: 15 }}>
              <Text
                style={{
                  color: "#999999",
                  fontSize: 18,
                  marginTop: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                Media & attachments
              </Text>
              {media.length >= 1 && (
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
              <FlatList
                columnWrapperStyle={{ marginVertical: 5 }}
                showsVerticalScrollIndicator={false}
                numColumns={3}
                data={media}
                keyExtractor={(x, i) => i.toString()}
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
                            color={primary}
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
                            color={primary}
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
                    {media.length < 1 && (
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
              {/* {data.length >= 1 ? (
                <FlatList
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginVertical: 5,
                  }}
                  showsVerticalScrollIndicator={false}
                  numColumns={3}
                  data={data}
                  keyExtractor={(x, i) => i.toString()}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        activeOpacity={0.5}
                        //onPress={() => navigation.navigate("imagePreview")}
                        style={{ width: "30%" }}
                      >
                        <Image
                          style={{
                            width: "100%",
                            height: 100,
                            borderRadius: 4,
                          }}
                          source={item.image}
                        />
                      </TouchableOpacity>
                    );
                  }}
                />
              ) : (
                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 30,
                  }}
                >
                  <Image
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 4,
                      marginBottom: 10,
                    }}
                    source={require("../../assets/placeholder.png")}
                  />
                  <Text
                    style={{
                      color: "#999999",
                      textAlign: "center",
                      fontFamily: "Urbanist-Regular",
                      fontSize: 15,
                    }}
                  >
                    No attachments to show
                  </Text>
                </View>
              )} */}
            </View>
          </>
        }
      />
      <RBSheet
        ref={refMuteRBSheet}
        height={Dimensions.get("window").height * 0.45}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: secondry,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Mute conversation
          </Text>
          <Text
            style={{
              color: secondry,
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            How long you would like to {"\n"} put on mute this group?
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            <Text
              style={{
                color: secondry,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Select Duration
            </Text>
            <Text style={{ color: primary }}>*</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              justifyContent: "space-between",
            }}
          >
            <MultiSelect
              onSelectedItemsChange={(value) => setDuration(value)}
              uniqueKey="name"
              items={data}
              selectedItems={duration}
              borderBottomWidth={0}
              single={true}
              searchInputPlaceholderText={"Please select duration"}
              selectText={"Please select duration"}
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
              displayKey="name"
              submitButtonText={"Submit"}
            />
          </View>

          <TouchableOpacity
            onPress={() => refMuteRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Mute Now
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refMuteRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              borderColor: "#ddd",
              borderWidth: 3,
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
              Cancel for Now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
      <RBSheet
        ref={refChangeTitleRBSheet}
        height={Dimensions.get("window").height * 0.85}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
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
              color: secondry,
              fontSize: 22,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Edit group
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            <Text
              style={{
                color: secondry,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Group title
            </Text>
            <Text style={{ color: primary }}>*</Text>
          </View>

          <TouchableOpacity
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              borderColor: "#ddd",
              borderWidth: 1,
              marginVertical: 5,
            }}
          >
            <TextInput
              style={{
                fontSize: 16,
                paddingHorizontal: 10,
                height: Dimensions.get("window").height / 15,
                width: "100%",
                color: "#323232",
                fontFamily: "Urbanist-Regular",
                marginTop: 10,
                marginBottom: 10,
              }}
              underlineColorAndroid="transparent"
              name={"groupTitle"}
              placeholder={"Add group title here"}
              placeholderTextColor="#807f7f"
              value={groupTitle}
              onChangeText={(name) => setGroupTitle(name)}
            />
          </TouchableOpacity>

          {route.params.groupDetail != null && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 25,
                }}
              >
                <Text
                  style={{
                    color: secondry,
                    fontSize: 16,
                    fontFamily: "Urbanist-Bold",
                    marginBottom: 10,
                  }}
                >
                  Group image
                </Text>
                <Text style={{ color: primary }}>*</Text>
              </View>
              <View
                style={{
                  borderColor: "#DDDDDD",
                  borderWidth: 1.5,
                  borderStyle: "dashed",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {route.params.groupDetail.groupImage == "" && image == null ? (
                  <TouchableOpacity
                    onPress={() => choosePictureFromGallery()}
                    activeOpacity={0.9}
                    style={{
                      backgroundColor: "#F7F7F7",
                      padding: 10,
                      borderRadius: 3,
                      width: 60,
                      marginBottom: 20,
                      marginTop: 30,
                    }}
                  >
                    <Image
                      style={{
                        width: 35,
                        height: 35,
                      }}
                      source={require("../../assets/placeholder.png")}
                    />
                  </TouchableOpacity>
                ) : (
                  <>
                    {image != null ? (
                      <View
                        activeOpacity={0.9}
                        style={{
                          height: 200,
                          width: "65%",
                          backgroundColor: "#F7F7F7",
                          borderRadius: 10,
                          marginBottom: 20,
                          marginTop: 30,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          //resizeMode="contain"
                          style={{
                            width: "100%",
                            height: "80%",
                            //alignSelf: "center",
                          }}
                          source={{
                            uri:
                              Platform.OS === "ios"
                                ? image.sourceURL
                                : image.path,
                          }}
                        />
                        <TouchableOpacity
                          onPress={() => setImageState()}
                          style={{
                            backgroundColor: "#EF4444",
                            width: "100%",
                            height: "20%",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 16,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            Remove
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View
                        activeOpacity={0.9}
                        style={{
                          height: 200,
                          width: "65%",
                          backgroundColor: "#F7F7F7",
                          borderRadius: 10,
                          marginBottom: 20,
                          marginTop: 30,
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          //resizeMode="contain"
                          style={{
                            width: "100%",
                            height: "80%",
                            //alignSelf: "center",
                          }}
                          source={{
                            uri:
                              route.params.groupDetail.groupImage.slice(0, 5) ==
                              "https"
                                ? route.params.groupDetail.groupImage
                                : "https:" +
                                  route.params.groupDetail.groupImage,
                          }}
                        />

                        <TouchableOpacity
                          onPress={() => setImageState()}
                          style={{
                            backgroundColor: "#EF4444",
                            width: "100%",
                            height: "20%",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 16,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            {translation.remove}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
                <View style={{ flexDirection: "row", marginBottom: 30 }}>
                  <Text
                    style={{
                      fontFamily: "Urbanist-Regular",
                      color: "#000",
                      fontSize: 14,
                    }}
                  >
                    {translation.upload_photo}
                  </Text>
                </View>
              </View>
            </>
          )}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            <Text
              style={{
                color: secondry,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
                marginBottom: 10,
              }}
            >
              Update group users
            </Text>
            <Text style={{ color: primary }}>*</Text>
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={groupData}
            extraData={refresh}
            keyExtractor={(x, i) => i.toString()}
            listKey={(x, i) => i.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => PushInArray(item, index)}
                style={{ backgroundColor: "#fff" }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: 5,
                    marginVertical: 5,
                    alignItems: "center",
                    alignContent: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#fff",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",

                      alignContent: "center",
                    }}
                  >
                    {selectedGroupUsers.includes(item.userId) ? (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: "#22C55E",
                          borderRadius: 4,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FontAwesome
                          name="check"
                          type="check"
                          color={"#fff"}
                          size={14}
                        />
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderColor: "#DDDDDD",
                          borderWidth: 1,
                          borderRadius: 4,
                        }}
                      ></View>
                    )}
                    <Image
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 30 / 2,
                        marginLeft: 10,
                      }}
                      source={{
                        uri:
                          item.userAvatar.slice(0, 5) == "https"
                            ? item.userAvatar
                            : "https:" + item.userAvatar,
                      }}
                    />
                    <Text
                      style={{
                        marginLeft: 10,
                        color: secondry,
                        fontSize: 14,
                        fontFamily: "Urbanist-Bold",
                      }}
                    >
                      {item.userName}
                    </Text>
                  </View>
                  {/* {selectedGroupUsers.includes(item) ?
                <Ionicons
                    onPress ={{}}
                    style={{ paddingHorizontal: 10,marginLeft:5 }}
                    name="ios-checkmark-sharp"
                    type="ios-checkmark-sharp"
                    color={"#22C55E"}
                    size={25}
                />:null} */}
                  {selectedGroupUsers.includes(item.userId) ? (
                    <>
                      {selectedGroupAdmin.includes(item.userId) ? (
                        <TouchableOpacity
                          onPress={() => PushInArrayAdmin(item, index)}
                          style={{
                            backgroundColor: "#22C55E",
                            borderRadius: 4,
                            paddingHorizontal: 10,
                            paddingVertical: 5,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FontAwesome
                            style={{}}
                            name="check"
                            type="check"
                            color={"#fff"}
                            size={12}
                          />
                          <Text
                            style={{
                              color: "#ffff",
                              marginLeft: 5,
                              fontSize: 12,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            ADMIN
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => PushInArrayAdmin(item, index)}
                          style={{
                            borderColor: "#999999",
                            borderWidth: 0.5,
                            paddingHorizontal: 10,
                            borderRadius: 4,
                            paddingVertical: 5,
                            flexDirection: "row",
                          }}
                        >
                          <Text
                            style={{
                              color: "#999999",
                              fontSize: 12,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            MAKE ADMIN
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />

          {route.params.groupDetail != null && (
            <TouchableOpacity
              onPress={() => setDisable(!disable)}
              style={{
                marginVertical: 10,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {disable ? (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: "#22C55E",
                    borderRadius: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FontAwesome
                    style={{}}
                    name="check"
                    type="check"
                    color={"#fff"}
                    size={14}
                  />
                </View>
              ) : (
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderColor: "#DDDDDD",
                    borderWidth: 1,
                    borderRadius: 4,
                  }}
                ></View>
              )}
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: 10,
                  fontFamily: "Urbanist-Regular",
                  color: "#0A0F26",
                }}
              >
                Make disable replies of this group
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => updateGroup()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Save and update
            </Text>
            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refChangeTitleRBSheet.current.close()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: "#FFFFFF",
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              borderColor: "#ddd",
              borderWidth: 3,
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
              Cancel for Now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
      <RBSheet
        ref={refLeavingRBSheet}
        height={Dimensions.get("window").height * 0.35}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
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
              color: secondry,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Leaving group?
          </Text>
          <Text
            style={{
              color: secondry,
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            Are you sure you want to {"\n"} leave “{groupTitle}”?
          </Text>

          <TouchableOpacity
            onPress={() =>
              selectedGroupAdmin.length == 1 ? makeAnAdminSheet() : leaveGroup()
            }
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Yes! leave now
            </Text>
            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refLeavingRBSheet.current.close()}
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
              Not right now
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <RBSheet
          ref={refMakeAnAdminRBSheet}
          height={Dimensions.get("window").height * 0.65}
          duration={250}
          customStyles={{
            container: {
              paddingLeft: 15,
              paddingRight: 15,
              backgroundColor: "transparent",
            },
          }}
        >
          <View
            style={{
              backgroundColor: secondry,
              height: "100%",
              height: 60,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
              paddingHorizontal: 15,
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: "row",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 22,
                fontFamily: "Urbanist-Bold",
                textAlign: "center",
              }}
            >
              {translation.before_leave_heading}
            </Text>
            <Entypo
              onPress={() => refMakeAnAdminRBSheet.current.close()}
              name="cross"
              type="cross"
              color={"#fff"}
              size={25}
            />
          </View>

          <ScrollView
            style={{
              backgroundColor: "#fff",
              height: "100%",
              padding: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 10,
              }}
            >
              <Text
                style={{
                  color: secondry,
                  fontSize: 16,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                Assign a new group admin
              </Text>
              <Text style={{ color: primary }}>*</Text>
            </View>

            <FlatList
              showsVerticalScrollIndicator={false}
              data={data}
              extraData={refresh}
              keyExtractor={(x, i) => i.toString()}
              listKey={(x, i) => i.toString()}
              renderItem={({ item, index }) => (
                <>
                  {item.groupRole == "0" ? (
                    <TouchableOpacity
                      activeOpacity={0.5}
                      style={{ backgroundColor: "#fff" }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          paddingVertical: 5,
                          marginVertical: 5,
                          alignItems: "center",
                          alignContent: "center",
                          justifyContent: "space-between",
                          backgroundColor: "#fff",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",

                            alignContent: "center",
                          }}
                        >
                          <Image
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 30 / 2,
                              marginLeft: 10,
                            }}
                            source={{
                              uri:
                                item.userAvatar.slice(0, 5) == "https"
                                  ? item.userAvatar
                                  : "https:" + item.userAvatar,
                            }}
                          />
                          <Text
                            style={{
                              marginLeft: 10,
                              color: secondry,
                              fontSize: 14,
                              fontFamily: "Urbanist-Bold",
                            }}
                          >
                            {item.userName}
                          </Text>
                        </View>
                        <>
                          {selectedGroupAdminLeave.includes(item.userId) ? (
                            <TouchableOpacity
                              onPress={() =>
                                PushInArrayAdminBeforeLeave(item, index)
                              }
                              style={{
                                backgroundColor: "#22C55E",
                                borderRadius: 4,
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FontAwesome
                                style={{}}
                                name="check"
                                type="check"
                                color={"#fff"}
                                size={12}
                              />
                              <Text
                                style={{
                                  color: "#ffff",
                                  marginLeft: 5,
                                  fontSize: 12,
                                  fontFamily: "Urbanist-Bold",
                                }}
                              >
                                ADMIN
                              </Text>
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity
                              onPress={() =>
                                PushInArrayAdminBeforeLeave(item, index)
                              }
                              style={{
                                borderColor: "#999999",
                                borderWidth: 0.5,
                                paddingHorizontal: 10,
                                borderRadius: 4,
                                paddingVertical: 5,
                                flexDirection: "row",
                              }}
                            >
                              <Text
                                style={{
                                  color: "#999999",
                                  fontSize: 12,
                                  fontFamily: "Urbanist-Bold",
                                }}
                              >
                                MAKE ADMIN
                              </Text>
                            </TouchableOpacity>
                          )}
                        </>
                      </View>
                    </TouchableOpacity>
                  ) : null} 
                </>
              )}
            />

            <TouchableOpacity
             onPress={() => leaveGroup()}
              style={{
                marginTop: 10,
                width: "100%",
                height: Dimensions.get("window").height / 15,
                backgroundColor: primary,
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
                Set admin and leave the group
              </Text>
              {spinner && (
                <View style={{ marginLeft: 15 }}>
                  <SkypeIndicator count={7} size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </ScrollView>
        </RBSheet>
      </RBSheet>
      <RBSheet
        ref={refDeleteRBSheet}
        height={Dimensions.get("window").height * 0.35}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
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
              color: secondry,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Delete Now
          </Text>
          <Text
            style={{
              color: secondry,
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            Are you sure you want to{"\n"}delete this group?
          </Text>

          <TouchableOpacity
            onPress={() => deleteGroup()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Yes! remove right now
            </Text>
            {spinner && (
              <View style={{ marginLeft: 15 }}>
                <SkypeIndicator count={7} size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => refDeleteRBSheet.current.close()}
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
              Not right now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
      <RBSheet
        ref={refReportRBSheet}
        height={Dimensions.get("window").height * 0.65}
        duration={250}
        customStyles={{
          container: {
            paddingLeft: 15,
            paddingRight: 15,
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
          style={{
            backgroundColor: "#fff",
            height: "100%",
            borderRadius: 15,
            padding: 15,
          }}
        >
          <Text
            style={{
              color: secondry,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Report now
          </Text>
          <Text
            style={{
              color: secondry,
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            Please fill the report form below {"\n"} so we can review.
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 25,
            }}
          >
            <Text
              style={{
                color: secondry,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Title the issue
            </Text>
            <Text style={{ color: primary }}>*</Text>
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
                color: secondry,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Emplain issue in detail
            </Text>
            <Text style={{ color: primary }}>*</Text>
          </View>
          <TextInput
            style={{
              fontSize: 15,
              padding: 5,
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
            placeholder={"Add description"}
            placeholderTextColor="#807f7f"
            value={description}
            onChangeText={(description) => setDescription(description)}
          />
          <TouchableOpacity
            onPress={() => submitreport()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Submit report
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
              borderRadius: 5,
              borderColor: "#ddd",
              borderWidth: 3,
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
              Cancel for Now
            </Text>
          </TouchableOpacity>
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
            backgroundColor: "transparent",
          },
        }}
      >
        <ScrollView
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
              color: secondry,
              fontSize: 24,
              fontFamily: "Urbanist-Bold",
              textAlign: "center",
            }}
          >
            Clear chat
          </Text>
          <Text
            style={{
              color: secondry,
              fontSize: 15,
              fontFamily: "OpenSans-Regular",
              textAlign: "center",
              lineHeight: 28,
            }}
          >
            Are you sure you want to {"\n"} clear your chat history?
          </Text>

          <TouchableOpacity
            onPress={() => clearChat()}
            style={{
              marginTop: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: primary,
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
              Yes! clear all
            </Text>
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
              Not right now
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

export default groupMessageSettings;
