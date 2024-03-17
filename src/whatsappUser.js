import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity
} from "react-native";
import React, { useState, useEffect ,useRef} from "react";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import * as CONSTANT from "./constant/constant";
import ListCard from "./home/listCard";
import WhatsappListCard from "./home/whatsappListCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { updateWhatsappChat } from "./redux/mainListingSlice";
import axios from "axios";
import {
  BarIndicator,
  UIActivityIndicator,
  SkypeIndicator,
} from "react-native-indicators";
import { NavigationContainer } from "@react-navigation/native";

const whatsappUser = () => {
  const whatsappChat = useSelector((state) => state.listing.whatsappChat);
  const settings = useSelector((state) => state.setting.settings);
  const translation = useSelector((state) => state.setting.translations);
  const navigationforword = useNavigation();
  const onEndReachedCalledDuringMomentum = useRef(true);
  const [refreshFlatlist, setRefreshFlatList] = useState(false);
  const [offset, setOffset] = useState(0);
  const [newData, setNewData] = useState([]);
  const dispatch = useDispatch();
  const [spinner, setSpinner] = useState(true);
  const [loader, setLoader] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOn, setSearchOn] = useState(false);

  useEffect(() => {
    fetchWhatsappUser();
  }, [search]);

  const fetchWhatsappUser = async () => {
    setOffset(0);
    newData.length = 0;
    const id = await AsyncStorage.getItem("id");
    const token = await AsyncStorage.getItem("token");
    return fetch(
      CONSTANT.BaseUrl +
        "load-guppy-whatsapp-users?offset=0" +
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
        setOffset(20);
        setSpinner(false);

        Object.entries(responseJson.userList).map(([key, value]) => {
          newData.push(value);
        });
        dispatch(updateWhatsappChat(JSON.parse(JSON.stringify(newData))));
       newData.length = 0
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
          "load-guppy-whatsapp-users?offset=" +
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
        //Sending the currect offset with get request
        .then((response) => response.json())
        .then((responseJson) => {
          setOffset(offset + 20);
          let storeData = JSON.parse(JSON.stringify(whatsappChat));
          Object.entries(responseJson.userList).map(([key, value]) => {
            storeData.push(value);
          });
          dispatch(updateWhatsappChat(JSON.parse(JSON.stringify(storeData))))
          setRefreshFlatList(!refreshFlatlist);
         
          setLoader(false);
        })
        .catch((error) => {
          console.error(error);
        })
    );
  };
  const searchUsersData = (val) => {
    newData.length= 0
    setRefreshFlatList(!refreshFlatlist)
    setSearch(val);
    setOffset(0);
    setSearchOn(!searchOn);
  };
  const onEndReachedHandler = () => {
    if (!onEndReachedCalledDuringMomentum.current) {
      if(whatsappChat.length >= 20)
      {
        loadMoreData();
        onEndReachedCalledDuringMomentum.current = true;
      }
  
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          paddingTop: 8,
          backgroundColor: "#22C55E",
          justifyContent:"space-between"
        }}
      >
        <View
          style={{
            flexDirection: "row",
            borderBottomColor: "#ddd",
            borderBottomWidth: 0.6,
            alignItems: "flex-start",
            justifyContent: "flex-start",
            paddingBottom: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              lineHeight: 32,
              letterSpacing: 0.5,
              marginLeft: 15,
              marginRight: 10,
              fontFamily: "Urbanist-Bold",
            }}
          >
            {translation.whatsap_list_title}
            
          </Text>
        </View>
        <FontAwesome style={{marginTop:-20,marginRight:-8}} name={"whatsapp"} size={50} color={"#ffffff50"} />
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
          textContentType="email_address"
          value={search}
          onChangeText={searchUsersData}
        />
      </View>
      <View
          style={{
            backgroundColor: "#F7F8FC",
            paddingVertical: 10,
            alignItems: "center",
            justifyContent: "center",
            borderBottomColor: "#ddd",
            borderBottomWidth: 0.6,
            paddingHorizontal:15
          }}
        >
          <Text
            style={{
              color: "#999999",
              fontSize: 13,
              lineHeight: 17,
              letterSpacing: 0.5,
              marginLeft: 10,
              marginRight: 10,
              textAlign:"center",
              fontFamily: "Urbanist-Medium",
            }}
          >
           {translation.list_respond_text}

          </Text>
        </View>
      {whatsappChat && whatsappChat.length >= 1 ? (
        <View style={{ flex: 1, backgroundColor: "#fff", marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={whatsappChat}
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
                    navigationforword.navigate("whatsappSupport", {
                      item: item
                    })
                  }
              >
                <WhatsappListCard
                  index={index}
                  item={item}
                  image={item.userAvatar}
                  name={item.userName}
                  whatsapp={true}
                  sendTo={item.chatId}
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
    </SafeAreaView>
  );
};

export default whatsappUser;

const styles = StyleSheet.create({});
