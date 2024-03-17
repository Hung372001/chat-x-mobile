import {
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from "react-native";
import React, { useState, useRef, useEffect, useReducer } from "react";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { useIsFocused } from "@react-navigation/native";
import ListCard from "./home/listCard";
import * as CONSTANT from "./constant/constant";
import {
  updateSupportMessages,
  updateSupportAgents,
} from "./redux/mainListingSlice";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";

const adminSupport = () => {
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const supportMessages = useSelector((state) => state.listing.supportMessages);
  const supportAgents = useSelector((state) => state.listing.supportAgents);
  const isFocused = useIsFocused();
  const navigationforword = useNavigation();
  const [showPrivate, setShowPrivate] = useState(true);
  const [chatTab, setChatTab] = useState(true);
  const [search, setSearch] = useState("");
  const [searchAgent, setSearchAgent] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [offset, setOffset] = useState(0);
  const [showGroups, setShowGroups] = useState(true);
  const [spinner, setSpinner] = useState(true);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [loader, setLoader] = useState(false);
  const [newData, setNewData] = useState([]);

  const dispatch = useDispatch();

  const searchUsersData = (val) => {
    setSearch(val);
    setOffset(0);
    setSearchOn(!searchOn);
  };
  const searchUsersAgentData = (val) => {
    setSearchAgent(val);
    setOffset(0);
    setSearchOn(!searchOn);
  };
  useEffect(() => {
    if (isFocused) {
      fetchSupportChatMessages();
      fetchSupportAgents();
    }
  }, [isFocused, search, searchAgent]);

  const fetchSupportAgents = async () => {
    newData.length = 0;
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    const loginUsertype = await AsyncStorage.getItem("loginType");

    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-support-users?offset=0" +
        "&search=" +
        searchAgent +
        "&userId=" +
        JSON.parse(id) +
        "&userType=" +
        JSON.parse(loginUsertype),
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
        if (responseJson.type == "success") {
          setOffset(20);
          setSpinner(false);
          Object.entries(responseJson.supportUsers).map(([key, value]) => {
            newData.push(value);
          });
          dispatch(updateSupportAgents(JSON.parse(JSON.stringify(newData))));
          newData.length = 0;
          setRefreshFlatList(!refreshFlatlist);
        }
      })
      .catch((error) => {
        setSpinner(false);
        console.error(error);
      });
  };

  const fetchSupportChatMessages = async () => {
    newData.length = 0;
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    const loginUsertype = await AsyncStorage.getItem("loginType");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-support-messages-list?offset=0" +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id) +
        "&userType=" +
        JSON.parse(loginUsertype) +
        "&isSupportMember=" +
        settings?.chatSetting?.isSupportMember,
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
        if (responseJson.type == "success") {
          setOffset(20);
          setSpinner(false);
          Object.entries(responseJson.guppyMessageList).map(([key, value]) => {
            newData.push(value);
          });
          dispatch(updateSupportMessages(JSON.parse(JSON.stringify(newData))));
          newData.length = 0;
          setRefreshFlatList(!refreshFlatlist);
        }
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
    const loginUsertype = await AsyncStorage.getItem("loginType");

    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-support-messages-list?offset=" +
        offset +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id) +
        "&userType=" +
        JSON.parse(loginUsertype) +
        "&isSupportMember=" +
        settings?.chatSetting?.isSupportMember,
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
        if (responseJson.type == "success") {
          let storeData = JSON.parse(JSON.stringify(supportMessages));
          setOffset(offset + 20);
          setLoader(false);
          Object.entries(responseJson.guppyMessageList).map(([key, value]) => {
            storeData.push(value);
          });
          dispatch(
            updateSupportMessages(JSON.parse(JSON.stringify(storeData)))
          );
          setRefreshFlatList(!refreshFlatlist);
        }
      })
      .catch((error) => {
        setLoader(false);
        console.error(error);
      });
  };

  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (chatTab == true) {
        if (supportMessages.length >= 20) {
          loadMoreData();
          onEndReachedCalledDuringMomentum.current = true;
        }
      }
    }
  };
  const openMessageDetails = (item) => {
    navigationforword.navigate("messageDetail", {
      item: item,
      request: JSON.stringify(""),
      name: item.userName,
      image: item.userAvatar,
      chatId: item.chatId,
      receiverid: item.chatId.substring(0, item.chatId.length - 2),
      blockedUser: item.isBlocked,
      blockedId: item.blockedId,
      isOnline: item.isOnline,
      groupDetail: item.groupDetail,
      groupTitle: item.groupTitle,
      groupImage: item.groupImage,
      chatType: item.chatType.toString(),
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {settings?.chatSetting?.isSupportMember == false ? (
        <View
          style={{
            flexDirection: "row",
            paddingTop: 16.5,
          }}
        >
          {showPrivate && (
            <TouchableOpacity
              onPress={() => {
                setChatTab(true);
              }}
              style={{
                flexDirection: "row",
                borderBottomColor:
                  chatTab == true
                    ? settings?.chatSetting?.primaryColor
                    : "#ddd",
                borderBottomWidth: chatTab == true ? 1.5 : 0.6,
                alignItems: "center",
                justifyContent: "center",
                width: showGroups ? "50%" : "100%",
                paddingBottom: 15,
              }}
            >
              <Feather
                name={"users"}
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
                {translation.admin_support_agent_tab}
              </Text>
            </TouchableOpacity>
          )}
          {showGroups && (
            <TouchableOpacity
              onPress={() => {
                setChatTab(false);
              }}
              style={{
                flexDirection: "row",
                borderBottomColor:
                  chatTab == false
                    ? settings?.chatSetting?.primaryColor
                    : "#ddd",
                borderBottomWidth: chatTab == false ? 1.5 : 0.6,
                alignItems: "center",
                justifyContent: "center",
                width: showPrivate ? "50%" : "100%",
                paddingBottom: 15,
              }}
            >
              <Feather
                name={"message-circle"}
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
                {translation.admin_support_msgs_tab}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <>
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
                  color: settings?.chatSetting?.secondaryColor,
                  fontSize: 16,
                  lineHeight: 32,
                  letterSpacing: 0.5,
                  marginLeft: 15,
                  marginRight: 10,
                  fontFamily: "Urbanist-Bold",
                }}
              >
                {translation.customer_tab_txt}
              </Text>
            </View>
          </View>
        </>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: "#ddd",
          borderBottomWidth: 0.6,
          height: 62,
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
          value={
            settings?.chatSetting?.isSupportMember == false
              ? chatTab
                ? searchAgent
                : search
              : search
          }
          onChangeText={
            settings?.chatSetting?.isSupportMember == false
              ? chatTab
                ? searchUsersAgentData
                : searchUsersData
              : searchUsersData
          }
        />
      </View>

      {(
        settings?.chatSetting?.isSupportMember == false
          ? chatTab
            ? supportAgents && supportAgents.length >= 1
            : supportMessages && supportMessages.length >= 1
          : supportMessages && supportMessages.length >= 1
      ) ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={
              settings?.chatSetting?.isSupportMember == false
                ? chatTab
                  ? supportAgents
                  : supportMessages
                : supportMessages
            }
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
                  chat={item.messageType}
                  message={item.message}
                  sendTo={item.chatId}
                  unread={item.UnreadCount}
                  time={item.timeStamp}
                  blockedFriend={item.isBlocked}
                  chatType={item.chatType}
                  messageStatus={item.messageStatus}
                  groupDetail={item.groupDetail}
                  groupImage={item.groupImage}
                  userName={item.userName}
                  isOnline={item.isOnline}
                  item={item}
                  type={
                    settings?.chatSetting?.isSupportMember
                      ? ""
                      : chatTab
                      ? "start"
                      : ""
                  }
                  // isTyping={isTyping}
                  // typingId={typingId}
                  // typingSenderId={typingSenderId}
                  // typingType={typingType}
                  // typingName={typingName}
                  // typingText={typingText}
                  isTyping={""}
                  typingId={""}
                  typingSenderId={""}
                  typingType={""}
                  typingName={""}
                  typingText={""}
                />
              </TouchableOpacity>
            )}
          />
          {loader == true && (
            <View style={{ marginBottom: 20 }}>
              <BarIndicator
                count={5}
                size={20}
                color={settings?.chatSetting?.secondaryColor}
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
              color={settings?.chatSetting?.secondaryColor}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default adminSupport;
