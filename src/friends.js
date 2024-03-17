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
import Header from "./header/header";
import ListCard from "./home/listCard";
import { SearchBar } from "react-native-elements";
import RBSheet from "react-native-raw-bottom-sheet";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CONSTANT from "./constant/constant";
import { useIsFocused } from "@react-navigation/native";
import Pusher from "pusher-js/react-native";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { updateFriends } from "./redux/mainListingSlice";

const friends = ({ props, route }) => {
  const translation = useSelector((state) => state.setting.translations);
  const settings = useSelector((state) => state.setting.settings);
  const friends = useSelector((state) => state.listing.friends);
  const dispatch = useDispatch();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const navigationforword = useNavigation();
  const [search, setSearch] = useState("");
  const [searchOn, setSearchOn] = useState(false);
  const [offset, setOffset] = useState(0);
  const [spinner, setSpinner] = useState(true);
  const [newData, setNewData] = useState([]);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [loader, setLoader] = useState(false);
  const isFocused = useIsFocused();
  const [channelData, setChannelData] = useState({});

  useEffect(() => {
    fetchUserFriendsList();
  }, [searchOn]);

  useEffect(() => {
    if (isFocused) {
      setOffset(0);
    }
  }, [isFocused]);

  const fetchUserFriendsList = async () => {
    newData.length = 0;
    // setSpinner(true);
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-contacts?offset=0" +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id) +
        "&friendStatus=1",
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
        setOffset(20);
        setSpinner(false);
        Object.entries(responseJson.contacts).map(([key, value]) => {
          newData.push(value);
        });
        dispatch(updateFriends(JSON.parse(JSON.stringify(newData))));
        newData.length = 0;
        setRefreshFlatList(!refreshFlatlist);
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
    return (
      fetch(
        CONSTANT.BaseUrl +
          "load-guppy-contacts?offset=" +
          offset +
          "&search=" +
          search +
          "&userId=" +
          JSON.parse(id) +
          "&friendStatus=1",
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
          let storeData = JSON.parse(JSON.stringify(friends));
          Object.entries(responseJson.contacts).map(([key, value]) => {
            storeData.push(value);
          });
          dispatch(updateFriends(JSON.parse(JSON.stringify(storeData))));
          setRefreshFlatList(!refreshFlatlist);
          setLoader(false);
        })
        .catch((error) => {
          console.error(error);
        })
    );
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if (friends.length >= 20) {
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
              color: settings?.chatSetting?.secondaryColor,
              fontSize: 16,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 15,
              marginRight: 10,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.friends}
          </Text>
        </View>
      </View>
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
          style={{ paddingLeft: 15, paddingRight: 10 }}
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
          // keyboardType="email-address"
          textContentType="email_address"
          //autoCompleteType="email"
          // returnKeyType="next"
          value={search}
          onChangeText={searchUsersData}
        />
      </View>
      {friends && friends.length >= 1 ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={friends}
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
                onPress={() =>
                  navigationforword.navigate("messageDetail", {
                    item: item,
                    request: JSON.stringify(""),
                    name: item.userName,
                    image: item.userAvatar,
                    chatId: item.chatId,
                    receiverid: item.chatId.substring(
                      0,
                      item.chatId.length - 2
                    ),
                    blockedUser: item.isBlocked,
                    blockedId: item.blockedId,
                    channel: channelData,
                    isOnline: item.isOnline,
                    chatType: "1",
                  })
                }
              >
                <ListCard
                  clearChat={item.clearChat}
                  isSender={item.isSender}
                  image={item.userAvatar}
                  name={item.userName}
                  message={item.message}
                  unread={item.UnreadCount}
                  time={item.timeStamp}
                  blockedFriend={item.isBlocked}
                  chatType={"1"}
                  userName={item.userName}
                  activeMark={true}
                  isOnline={item.isOnline}
                  item={item}
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

export default friends;
