import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import ListCard from "./home/listCard";
import RBSheet from "react-native-raw-bottom-sheet";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CONSTANT from "./constant/constant";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import { useSelector, useDispatch } from "react-redux";
import { updatePostChat } from "./redux/mainListingSlice";
import Pusher from "pusher-js/react-native";
import SocketioService from "./socketio/socketio.service";

const chatHistory = ({ navigation }) => {
  const socketService = SocketioService;
  const postChat = useSelector((state) => state.listing.postChat);
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const dispatch = useDispatch();
  const navigationforword = useNavigation();
  const [spinner, setSpinner] = useState(true);
  const isFocused = useIsFocused();
  const [searchOn, setSearchOn] = useState(false);
  const [search, setSearch] = useState("");
  const [loader, setLoader] = useState(false);
  const [newData, setNewData] = useState([]);
  const [data, setData] = useState([]);
  const [channelData, setChannelData] = useState({});
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [offset, setOffset] = useState(0);
  const [mute, setMute] = useState(false);
  const [ring, setRing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingId, setTypingId] = useState("");
  const [typingType, setTypingType] = useState("");
  const [typingName, setTypingName] = useState("");
  const [typingSenderId, setTypingSenderId] = useState("");
  const [typingText, setTypingText] = useState("");

  useEffect(() => {
    fetchPostMessageHistory();
  }, [search]);

  useEffect(() => {
    if (isFocused) {
      fetchPostMessageHistory();
      setOffset(0);
      pusherData();
    }
  }, [isFocused]);

  if (settings?.chatSetting?.socketEnable == false) {
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

      channel.bind("isTyping", async function (mydata) {
        isTypingFunction(mydata);
        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      });
    }
  };

  const socketData = async () => {
    const token = await AsyncStorage.getItem("token");
    const id = await AsyncStorage.getItem("id");
    const socket = socketService.socketConnection(
      token,
      settings.chatSetting.socketHost,
      settings.chatSetting.socketPort
    );
    socketService.connectUser(JSON.parse(id));

    socket.on("isTyping", (mydata) => {
      isTypingFunction(mydata);
    });
  };

  const isTypingFunction = (mydata) => {
    let id = mydata.chatId.split("_")[0];
    setIsTyping(true);
    setTypingId(mydata.chatId);
    setTypingType(mydata.chatType);
    setTypingName(mydata.typingName);
    setTypingSenderId(mydata.senderId);
    setTypingText(mydata.text);
  };

  const fetchPostMessageHistory = async () => {
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-post-messages-list?offset=0" +
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
        
        setOffset(offset + 20);
        setSpinner(false);
        Object.entries(responseJson.guppyPostMessageList).map(
          ([key, value]) => {
            newData.push(value);
          }
        );
        dispatch(updatePostChat(JSON.parse(JSON.stringify(newData))));
        newData.length = 0;
        setRefreshFlatList(!refreshFlatlist);
        // setData(responseJson.guppyPostMessageList);
        // setNewData(responseJson.guppyPostMessageList);
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };

  const loadMoreData = async () => {
    setLoader(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-post-messages-list?offset=" +
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
        
        let storeData = JSON.parse(JSON.stringify(postChat));
        setOffset(offset + 20);
        setLoader(false);
        Object.entries(responseJson.guppyPostMessageList).map(
          ([key, value]) => {
            storeData.push(value);
          }
        );
        dispatch(updatePostChat(JSON.parse(JSON.stringify(storeData))));
        setRefreshFlatList(!refreshFlatlist);
      })
      .catch((error) => {
        setLoader(false);
        console.error(error);
      });
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (postChat.length >= 20) {
        loadMoreData();
        onEndReachedCalledDuringMomentum.current = true;
      }
    }
  };

  const searchUsersData = (val) => {
    setSearch(val);
    setOffset(0);
    setSearchOn(!searchOn);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          paddingTop: 8,
          backgroundColor: "#fff",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: "#ddd",
            borderBottomWidth: 0.6,
            alignItems: "flex-start",
            justifyContent: "flex-start",
            width: "100%",
            paddingBottom: 8,
          }}
        >
          <Text
            style={{
              color: settings.chatSetting.secondaryColor,
              fontSize: 16,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 15,
              marginRight: 10,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.post_chat}
          </Text>
        </View>
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
          keyboardType="email-address"
          textContentType="email_address"
          value={search}
          onChangeText={searchUsersData}
        />
      </View>
      {postChat.length >= 1 ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            //   style={styles.TopRatedFlatlistStyle}
            data={postChat}
            keyExtractor={(x, i) => i.toString()}
            extraData={refreshFlatlist}
            onEndReached={() => onEndReachedHandler()}
            onEndReachedThreshold={0.1}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigationforword.navigate("messageDetail", {
                    request: JSON.stringify(""),
                    name: item.postTitle,
                    image: item.postImage,
                    receiverid: item.chatId.substring(
                      0,
                      item.chatId.length - 4
                    ),
                    blockedUser: item.isBlocked,
                    chatId: item.chatId,
                    blockedId: item.blockedId,
                    channel: channelData,
                    isOnline: item.isOnline,
                    chatType: item.chatType.toString(),
                    postReceiverId: item.postReceiverId,
                    item: item,
                  })
                }
              >
                <ListCard
                  image={item.postImage}
                  name={item.postTitle}
                  chat={item.messageType}
                  message={item.message}
                  unread={item.UnreadCount}
                  chatType={item.chatType}
                  postId={item.postId}
                  time={item.timeStamp}
                  postImage={item.userAvatar}
                  messageStatus={item.messageStatus}
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
              <BarIndicator
                count={5}
                size={20}
                color={settings.chatSetting.secondaryColor}
              />
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
            <UIActivityIndicator
              size={35}
              color={settings.chatSetting.secondaryColor}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default chatHistory;
