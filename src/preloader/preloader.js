import React , {useEffect} from 'react'
import { View , Image} from 'react-native'
import * as CONSTANT from "../constant/constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSelector, useDispatch } from "react-redux";
import { updateTab, updateChatTab } from "../redux/TabSlice";
import { updateSetting,updateTranslations } from "../redux/SettingSlice";

const preloader = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        getAppSettings()
    }, []);
    const getAppSettings = async () => {
        const id = await AsyncStorage.getItem("id");
        const response = await fetch(CONSTANT.BaseUrl + "get-app-guppy-setting?userId="+JSON.parse(id));
        const json = await response.json();
        dispatch(updateSetting(json.settings));
        dispatch(updateTranslations(json.settings.chatSetting.translations));
        dispatch(updateTab(json.settings.chatSetting.defaultActiveTab));
      };
    return (
        <View style={{backgroundColor:'#FF7300' , flex:1 , alignItems:'center' , justifyContent:'center'}}>
             <Image 
             resizeMode={"contain"}
             style={{width:120 , height:120}}
          source={require('../../assets/guppyGif.gif')}
        />
        </View>
    )
}

export default preloader
