import React , {useEffect , useState} from 'react'
import { View, Image , Text , StatusBar , Platform, Alert } from 'react-native'
import Entypo from "react-native-vector-icons/Entypo";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const header = ({name ,show}) => {
    const navigationforword = useNavigation();
    const [primary , setPrimary] = useState("")
    const [secondry , setSecondry] = useState("")
    useEffect(() => {
        if (Platform.OS === "ios") {
            StatusBar.setBarStyle("light-content", true);
          } else {
            StatusBar.setBarStyle("light-content", true);
            StatusBar.setBackgroundColor(secondry);
          }
      }, []);

      useEffect(() => {
        setData()
      }, []);
    
    
      const setData = async()=>{
        const primaryColor = await AsyncStorage.getItem("primaryColor");
        const secondaryColor = await AsyncStorage.getItem("secondaryColor");
        setPrimary(primaryColor)
        setSecondry(secondaryColor)
      }
    return (
        <View style={{ height: 70, backgroundColor: secondry, flexDirection: 'row', justifyContent: 'space-between' }}>
 
            <View style={{flexDirection:'row' , alignItems:'center' , justifyContent:'center'}}>
                <Entypo
                      onPress={()=> navigationforword.navigate("profile")}
                      style={{ paddingHorizontal: 10 }}
                      name="menu"
                      type="menu"
                      color={"#fff"}
                      size={35}
                    />
                <Text style={{
                    color:'#fff',
                    fontWeight:'700',
                    fontSize:18,
                    fontFamily:'Urbanist-Regular'
                }}>{name}</Text>
            </View>
           {show &&
                <View style={{flexDirection:'row' , alignItems:'center' , justifyContent:'center'}}>
                    <Text onPress={()=> show()} style={{fontSize:14 , color:'#fff' , fontFamily:'Urbanist-Regular'  , fontWeight:'700' , marginRight:10 }}>Create group +</Text>
            </View>}
         
        </View>
    )
}

export default header
