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
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as CONSTANT from "./constant/constant";
import { useIsFocused } from "@react-navigation/native";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import { useSelector, useDispatch } from "react-redux";
import { updateBlockedUsers } from "./redux/mainListingSlice";

const blockedUser = ({ navigation }) => {
  const blockedUsers = useSelector((state) => state.listing.blockedUsers);
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const dispatch = useDispatch();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const isFocused = useIsFocused();
  const [newData, setNewData] = useState([]);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [searchOn, setSearchOn] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);
  const [dateTime, setDateTime] = useState("");

  useEffect(() => {
    fetchUserBlockedList();
  }, [searchOn]);

  useEffect(() => {
    if (isFocused) {
      setOffset(0);
    }
  }, [isFocused]);

  const fetchUserBlockedList = async () => {
    newData.length = 0;
    // setSpinner(true)
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-contacts?offset=0" +
        "&search=" +
        search +
        "&userId=" +
        JSON.parse(id) +
        "&friendStatus=3",
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
        setOffset(offset + 20);
        newData.length = 0;
        Object.entries(responseJson.contacts).map(([key, value]) => {
          newData.push(value);
        });
        dispatch(updateBlockedUsers(JSON.parse(JSON.stringify(newData))));
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
          let storeData = JSON.parse(JSON.stringify(blockedUsers));
          setOffset(offset + 20);
          Object.entries(responseJson.contacts).map(([key, value]) => {
            storeData.push(value);
          });
          dispatch(updateBlockedUsers(JSON.parse(JSON.stringify(storeData))));
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
      if (blockedUsers.length >= 20) {
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
            {translation.blocked_users}
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

      {blockedUsers && blockedUsers.length >= 1 ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            //   style={styles.TopRatedFlatlistStyle}
            data={blockedUsers}
            keyExtractor={(x, i) => i.toString()}
            extraData={refreshFlatlist}
            onEndReached={() => onEndReachedHandler()}
            onEndReachedThreshold={0.1}
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity activeOpacity={0.9}>
                <ListCard
                  item={item}
                  index={index}
                  image={item.userAvatar}
                  name={item.userName}
                  type={"unblock"}
                  sendTo={item.chatId}
                  status={fetchUserBlockedList}
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

export default blockedUser;
