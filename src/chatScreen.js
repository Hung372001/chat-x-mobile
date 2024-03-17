import React, { useState, useRef, useEffect, useReducer } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ImageBackground,
} from "react-native";
import Header from "./header/header";
import ListCard from "./home/listCard";
import { SearchBar } from "react-native-elements";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RBSheet from "react-native-raw-bottom-sheet";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CONSTANT from "./constant/constant";
import { useIsFocused } from "@react-navigation/native";
import Pusher from "pusher-js/react-native";
import ImagePicker from "react-native-image-crop-picker";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import SoundPlayer from "react-native-sound-player";
import { useNavigation } from "@react-navigation/native";
import { updateChatTab } from "./redux/TabSlice";
import { useSelector, useDispatch } from "react-redux";
import { updateChat, updateGroupChat } from "./redux/mainListingSlice";
import { updateMessages,updateChatId } from "./redux/messagesSlice";
import { getUsers } from "./redux/userListSlice";
import SocketioService from "./socketio/socketio.service";
import Notification from "./components/Notification";

const chatScreen = () => {
  const socketService = SocketioService;
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const chat = useSelector((state) => state.listing.chat);
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const groupChat = useSelector((state) => state.listing.groupChat);
  const dispatch = useDispatch();
  const [chatTab, setChatTab] = useState(true);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const navigationforword = useNavigation();
  const isFocused = useIsFocused();
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [searchOn, setSearchOn] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const refCreateGroupRBSheet = useRef();
  const [spinner, setSpinner] = useState(true);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [refresh , setRefresh] = useState(false)
  const [newData, setNewData] = useState([]);
  const [newGroupData, setNewGroupData] = useState([]);
  const [groupData, setGroupData] = useState([]);

  const [loader, setLoader] = useState(false);
  const [channelData, setChannelData] = useState({});
  const [notificationBell, setNotificationBell] = useState("");
  const [mute, setMute] = useState(false);
  const [ring, setRing] = useState(false);
  const [update, setUpdate] = useState(false);
  const [image, setImage] = useState(null);
  const [user_avatar, setAvatar] = useState(null);
  const [chatPusher, setChatPusher] = useState("");
  const [disable, setDisable] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [dataArray, setDataArray] = useState([]);
  const [isTyping  , setIsTyping] = useState(false);
  const [typingId , setTypingId] = useState("")
  const [typingType , setTypingType] = useState("")
  const [typingName , setTypingName] = useState("")
  const [typingSenderId , setTypingSenderId] = useState("")
  const [typingText , setTypingText] = useState("")
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  if (settings.chatSetting.socketEnable == false) {
    useEffect(() => {
      pusherData();
    }, []);
  } else {
    useEffect(() => {
        socketData();
    }, []);
  }

  const pusherData = async () => {
    const id = await AsyncStorage.getItem("id");
    const pusherEnable = await AsyncStorage.getItem("pusherEnable");
    const key = await AsyncStorage.getItem("pusherKey");
    const cluster = await AsyncStorage.getItem("pusherCluster");

    if (pusherEnable == "true") {
      let pusher = new Pusher(key, {
        cluster: cluster,
        auth: {
          params: {
            userId: JSON.parse(id),
          },
        },
        authEndpoint: CONSTANT.BaseUrl + "channel-authorize",
      });

      let channel = pusher.subscribe("presence-user-" + JSON.parse(id));

      channel.bind("updateOnlineStatus", async function (mydata) {
        updateOnlineUsers(mydata);
      });

      channel.bind("isTyping", async function (mydata) {
        isTypingFunction(mydata)
        setTimeout(() => {
          setIsTyping(false)
        }, 3000);
      });

      channel.bind("updateUserOnlineFriends", async function (mydata) {
        updateOnlineFriends(mydata);
      });

      channel.bind("deleteMessage", async function (mydata) {

        deleteMessage(mydata)
      });

    }
  };

  const socketData = async () => {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    const socket = socketService.socketConnection(token , settings.chatSetting.socketHost , settings.chatSetting.socketPort);
    socketService.connectUser(JSON.parse(id));
    socket.on("updateOnlineStatus", (mydata) => {
      updateOnlineUsers(mydata);
    });
    socket.on("isTyping", (mydata) => {
      isTypingFunction(mydata)
    });
    socket.on("updateUserOnlineFriends", (mydata) => {
      updateOnlineFriends(mydata);
    });
    socket.on("deleteMessage", (mydata) => {
      deleteMessage(mydata)
    });
  };

  const deleteMessage =(mydata)=> {
    for(var j = 0; j < chat.length; j++){
      if(chat[j].messageId == mydata.messageId){
        chat[j].messageStatus = "2"
      }
    }
    dispatch(updateChat(JSON.parse(JSON.stringify(chat))));
    setRefreshFlatList(!refreshFlatlist)
    forceUpdate();
}

  const updateOnlineFriends = (mydata) => {
    forceUpdate();
    dataArray.length = 0
    Object.entries(mydata).map(([key, value]) => {
      dataArray.push(value);
    });
    setRefresh(!refresh);
    forceUpdate();
  };

  const updateOnlineUsers = (mydata) => {
    forceUpdate();
    if(dataArray.length == 0){
      dataArray.push(mydata);
    }
    else{
      for(var i = 0; i < dataArray.length; i++){
        if(dataArray[i].chatId == mydata.chatId ){
          setRefresh(!refresh)
          return;
        }else{
          if (i == dataArray.length - 1) {
          dataArray.push(mydata);
          setRefresh(!refresh)
          return;
          }
        }
      }
    }
 
    setRefresh(!refresh);
    forceUpdate();
  };

  const isTypingFunction = (mydata) => {
      setIsTyping(true)
      setTypingId(mydata.chatId)
      setTypingType(mydata.chatType)
      setTypingName(mydata.typingName)
      setTypingSenderId(mydata.senderId)
      setTypingText(mydata.text)
  };

  useEffect(() => {
    settings.chatSetting.enabledTabs.map((tab) => {
      if (tab == "private_chats") {
        setShowPrivate(true);
        setUpdate(!update)
      }
      if (tab == "groups") {
        setShowGroups(true);
        setUpdate(!update)
      }
    });
    if (isFocused) {
    fetchUserChatMessages();
    dispatch(getUsers())
    fetchUserProfile();
    }
  }, [searchOn, chatTab,isFocused]);

  useEffect(() => {
    if (showGroups && !showPrivate) {
      setChatTab(false);
    }
  }, [update]);

  useEffect(() => {
    if (isFocused) {
      setConversationMute();
      setOffset(0);
    }
  }, [isFocused]);
  useEffect(() => {
    SoundPlayer.addEventListener("FinishedPlaying", ({ success }) => {
      SoundPlayer.stop();
    });
  }, []);
  const setConversationMute = async () => {
    const chatMute = await AsyncStorage.getItem("notificationStatus");
    if (chatMute != null) {
      setRing(JSON.parse(chatMute));
    } else {
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
  
  const fetchUserProfile = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");

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
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const fetchUserChatMessages = async () => {
    var type;
    if (chatTab == true) {
      type = 1;
    } else {
      type = 2;
    }
    // setSpinner(true);
    newData.length = 0;
    newGroupData.length = 0;
    const notificationBellUrl = await AsyncStorage.getItem(
      "notificationBellUrl"
    );
    setNotificationBell(notificationBellUrl);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-messages-list?offset=0" +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id) +
        "&chatType=" +
        type,
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
      .then(async (responseJson) => {
        
        if(responseJson.type == "success")
        {
          setOffset(20);
          setSpinner(false);
          if (type == 1) {
            Object.entries(responseJson.guppyMessageList).map(([key, value]) => {
              newData.push(value);
            });
            dispatch(updateChat(JSON.parse(JSON.stringify(newData))));
            await AsyncStorage.setItem("updateChats",JSON.stringify(newData));
          } else {
            Object.entries(responseJson.guppyMessageList).map(([key, value]) => {
              newGroupData.push(value);
            });
            dispatch(updateGroupChat(JSON.parse(JSON.stringify(newGroupData))));
          }
          newData.length = 0;
          newGroupData.length = 0;
          setRefreshFlatList(!refreshFlatlist);
        }
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };
  const loadMoreData = async () => {
    var type = chatTab == true ? 1 : 2;
    setLoader(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return (
      fetch(
        CONSTANT.BaseUrl +
          "load-guppy-messages-list?offset=" +
          offset +
          "&search=" +
          search +
          "&userId=" +
          JSON.parse(id) +
          "&chatType=" +
          type,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + JSON.parse(token),
          },
        }
      )
        //Sending the currect offset with get request
        .then((response) => response.json())
        .then((responseJson) => {
          setOffset(offset + 20);
          let storeData = JSON.parse(JSON.stringify(chat))
          let storeDataGroup = JSON.parse(JSON.stringify(groupChat))
          if (type == 1) {
            Object.entries(responseJson.guppyMessageList).map(
              ([key, value]) => {
                storeData.push(value);
              }
            );
            dispatch(updateChat(JSON.parse(JSON.stringify(storeData))));
          } else {
            Object.entries(responseJson.guppyMessageList).map(
              ([key, value]) => {
                storeDataGroup.push(value);
              }
            );
            dispatch(updateGroupChat(JSON.parse(JSON.stringify(storeDataGroup))));
          }
          setLoader(false);
          setRefreshFlatList(!refreshFlatlist);
        })
        .catch((error) => {
          console.error(error);
        })
    );
  };

  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (chatTab == true) {
        if (chat.length >= 20) {
          loadMoreData();
          onEndReachedCalledDuringMomentum.current = true;
        }
      } else {
        if (groupChat.length >= 20) {
          loadMoreData();
          onEndReachedCalledDuringMomentum.current = true;
        }
      }
    }
  };

  const openMessageDetails = (item) => {
    dispatch(updateMessages([]))
    dispatch(updateChatId(""));
    navigationforword.navigate("messageDetail", {
      item:item,
      request: JSON.stringify(""),
      name: item.userName,
      image: item.userAvatar,
      chatId:item.chatId,
      receiverid: item.chatId.substring(0, item.chatId.length - 2),
      blockedUser: item.isBlocked,
      blockedId: item.blockedId,
      channel: channelData,
      isOnline: item.isOnline,
      groupDetail: item.groupDetail,
      groupTitle: item.groupTitle,
      groupImage: item.groupImage,
      chatType: item.chatType.toString(),
    });
  };
  const SelectUsers = () => {
    if (groupTitle != "") {
      refCreateGroupRBSheet.current.close();
      setGroupTitle("");
      navigationforword.navigate("createGroup" , {title : groupTitle , image : image , disableReplies : disable });
      setAvatar(null);
      setImage(null);
      setGroupTitle(''),
      setDisable(false)
    } else {
      refCreateGroupRBSheet.current.close();
      setShowAlert(true);
      setAlertType("error");
      setTitle("Oops!");
      setDesc("Must enter the name");
    }
  };
  const searchUsersData = (val) => {
    setSearch(val);
    setOffset(0);
    newData.length = 0;
    setSearchOn(!searchOn);
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
          paddingTop: 16.5,
        }}
      >
        {showPrivate && (
          <TouchableOpacity
            onPress={() =>{
            setChatTab(true)
            setRefreshFlatList(!refreshFlatlist)
            forceUpdate()
          }}
            style={{
              flexDirection: "row",
              borderBottomColor: chatTab == true ? settings.chatSetting.primaryColor : "#ddd",
              borderBottomWidth: chatTab == true ? 1.5 : 0.6,
              alignItems: "center",
              justifyContent: "center",
              width: showGroups ? "50%" : "100%",
              paddingBottom: 15,
            }}
          >
            <Feather
              name={"user"}
              size={15}
              color={chatTab == true ? "#1C1C1C" : "#999999"}
            />
            <Text
              style={{
                color: chatTab == true ? "#1C1C1C" : "#999999",
                fontSize: 15,
                lineHeight: 32,
                letterSpacing: 0.5,
                marginLeft: 10,
                marginRight: 10,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Private
            </Text>
            {/* <View
              style={{
                backgroundColor: "#EF4444",
                width: 6,
                height: 6,
                borderRadius: 6 / 2,
                marginBottom: 5,
              }}
            ></View> */}
          </TouchableOpacity>
        )}
        {showGroups && (
          <TouchableOpacity
            onPress={() => {
              setRefreshFlatList(!refreshFlatlist)
              setChatTab(false)
              forceUpdate()
            }}
            style={{
              flexDirection: "row",
              borderBottomColor: chatTab == false ? settings.chatSetting.primaryColor : "#ddd",
              borderBottomWidth: chatTab == false ? 1.5 : 0.6,
              alignItems: "center",
              justifyContent: "center",
              width: showPrivate ? "50%" : "100%",
              paddingBottom: 15,
            }}
          >
            <Feather
              name={"users"}
              size={15}
              color={chatTab == false ? "#1C1C1C" : "#999999"}
            />
            <Text
              style={{
                color: chatTab == false ? "#1C1C1C" : "#999999",
                fontSize: 15,
                lineHeight: 32,
                letterSpacing: 0.5,
                marginLeft: 10,
                marginRight: 10,
                fontFamily: "Urbanist-Bold",
              }}
            >
              Groups
            </Text>
            {/* <View
              style={{
                backgroundColor: "#EF4444",
                width: 6,
                height: 6,
                borderRadius: 6 / 2,
                marginBottom: 5,
              }}
            ></View> */}
          </TouchableOpacity>
        )}
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: "#ddd",
          borderBottomWidth: 0.6,
          height: 63,
        }}
      >
        <Feather
          style={{ paddingLeft: 20, paddingRight: 10 }}
          name="search"
          type="search"
          color={"#727372"}
          size={15}
        />
        <TextInput
          style={{
            flex: 1,
            height: 45,
            fontSize: 16,
            paddingHorizontal: 4,
            color: "#000",
          }}
          placeholder={translation.search}
          placeholderTextColor={"#727372"}
          autoCorrect={false}
          textContentType="email_address"
          value={search}
          onChangeText={searchUsersData}
        />
      </View>
      {(chatTab == false && settings.chatSetting.createGroup == true) && (
        <View
          style={{
            backgroundColor: "#F7F8FC",
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            borderBottomColor: "#ddd",
            borderBottomWidth: 0.6,
          }}
        >
          <Text
            style={{
              color: settings.chatSetting.secondaryColor,
              fontSize: 15,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 10,
              marginRight: 10,
              fontFamily: "Urbanist-Medium",
            }}
          >
            <Text
              onPress={() => refCreateGroupRBSheet.current.open()}
              style={{
                color: "#1DA1F2",
                fontSize: 15,
                lineHeight: 32,
                letterSpacing: 0.5,
                marginLeft: 10,
                marginRight: 10,
                fontFamily: "Urbanist-Medium",
              }}
            >
              {translation.click_here}
            </Text>{" "}
            {translation.create_group_txt}
          </Text>
        </View>
      )}
      {
        (chatTab == true && settings.chatSetting.hideOnlineUserList == false) &&
        <View style={{ borderBottomColor: "#ddd", borderBottomWidth: 0.6  }}>
        <FlatList
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          data={dataArray}
          extraData={refresh}
          keyExtractor={(x, i) => i.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={()=> openMessageDetails(item)}
              style={{
                alignItems: "center",
                marginTop: 15,
                marginBottom: 5,
              }}
            >
              <ImageBackground
                imageStyle={{ borderRadius: 50 / 2 }}
                style={{
                  width: 50,
                  height: 50,
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                }}
                source={{
                  uri:
                    item.userAvatar.slice(0, 5) == "https"
                      ? item.userAvatar
                      : "https:" + item.userAvatar,
                }}
              >
                <View
                  style={{
                    backgroundColor: "#22C55E",
                    width: 15,
                    height: 15,
                    borderRadius: 15 / 2,
                    borderColor: "#fff",
                    borderWidth: 3,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                ></View>
              </ImageBackground>
              <Text
                style={{
                  color: settings.chatSetting.secondaryColor,
                  fontSize: 14,
                  lineHeight: 32,
                  letterSpacing: 0.5,
                  marginLeft: 10,
                  marginRight: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                {item.userName}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      }
  

      {(chatTab ? ( chat && chat.length >= 1 ) : ( groupChat && groupChat.length >= 1 )) ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            //   style={styles.TopRatedFlatlistStyle}
            data={chatTab ? chat : groupChat}
            extraData={refreshFlatlist}
            keyExtractor={(x, i) => i.toString()}
            onEndReached={() => onEndReachedHandler()}
            onEndReachedThreshold={0.1}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => openMessageDetails(item)}
              >
                <ListCard
                  clearChat={item.clearChat}
                  isSender={item.isSender}
                  image={item.chatType == 2 ? item.groupImage : item.userAvatar}
                  name={item.chatType == 2 ? item.groupTitle : item.userName}
                  chat={item.messageType.toString()}
                  message={item.message}
                  unread={item.UnreadCount}
                  time={item.timeStamp}
                  blockedFriend={item.isBlocked}
                  chatType={item.chatType}
                  messageStatus={item.messageStatus}
                  groupDetail={item.groupDetail}
                  groupImage={item.groupImage}
                  userName={item.userName}
                  isOnline= {item.isOnline}
                  item={item}
                  isTyping={isTyping}
                  typingId={typingId}
                  typingSenderId={typingSenderId}
                  typingType={typingType}
                  typingName={typingName}
                  typingText={typingText}
                />
              </TouchableOpacity>
            )}
          />
          {loader == true && (
            <View style={{ marginBottom: 20 }}>
              <BarIndicator count={5} size={20} color={settings.chatSetting.secondaryColor} />
            </View>
          )}
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {spinner == false ? (
            <>
              <Image
                style={{
                  width: 90,
                  height: 90,
                  //borderRadius: 55 / 2
                }}
                source={require("../assets/gallery/Vector.png")}
              />
              <Text
            style={{
              color: "#999999",
              fontSize: 18,
              marginTop: 10,
              fontFamily: "Urbanist-Regular",
            }}
          >
            {translation.no_results}
          </Text>
            </>
          ) : (
            <UIActivityIndicator size={35} color={settings.chatSetting.secondaryColor} />
          )}
        </View>
      )}

      <RBSheet
        ref={refCreateGroupRBSheet}
        height={Dimensions.get("window").height * 0.45}
        // duration={250}
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
            borderRadius: 20,
            padding: 20,
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
                color: settings.chatSetting.secondaryColor,
                fontSize: 16,
                fontFamily: "Urbanist-Bold",
              }}
            >
              {translation.grp_title_txt}
            </Text>
            <Text style={{ color: settings.chatSetting.primaryColor }}>*</Text>
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
              marginVertical: 10,
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
              placeholder={translation.grp_title_placeholder_txt}
              placeholderTextColor="#807f7f"
              value={groupTitle}
              autoCorrect={false}
              onChangeText={(name) => setGroupTitle(name)}
            />
          </TouchableOpacity>
          <View
            style={{
              borderColor: "#DDDDDD",
              borderWidth: 1.5,
              borderStyle: "dashed",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {user_avatar == null && image == null ? (
              <>
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
                  source={require("../assets/placeholder.png")}
                />
              </TouchableOpacity>
              <Text
              style={{
                fontSize: 14,
                fontFamily: "Urbanist-Regular",
                marginLeft: 10,
                color: settings.chatSetting.secondaryColor,
              }}
            >
             {translation.click_here} {translation.grp_photo_dsc_txt}
            </Text>
              </>
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
                          Platform.OS === "ios" ? image.sourceURL : image.path,
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
                      source={{ uri: user_avatar }}
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
          <TouchableOpacity
            onPress={() => setDisable(!disable)}
            style={{
              marginVertical: 10,
              padding: 10,
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
                fontFamily: "Urbanist-Regular",
                marginLeft: 10,
                color: settings.chatSetting.secondaryColor,
              }}
            >
              {translation.disable_grp_txt}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => SelectUsers()}
            style={{
              marginVertical: 10,
              width: "100%",
              height: Dimensions.get("window").height / 15,
              backgroundColor: settings.chatSetting.primaryColor,
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
              {translation.grp_users_txt}
            </Text>
          </TouchableOpacity>
          <View style={{ height: 20 }}></View>
        </ScrollView>
      </RBSheet>
    </SafeAreaView>
  );
};

export default chatScreen;
