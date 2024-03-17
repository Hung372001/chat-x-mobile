import React from "react";
import { createStackNavigator, StackView } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AntIcon from "react-native-vector-icons/AntDesign";
import home from "../home/home";
import listCard from "../home/listCard";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// const TabStack = ({navigation}) => {
//   return (
//    <Tab.Navigator>
//     <Tab.Screen
//       name={home}
//       component={home} 
//       options={{
//         tabBarIcon: (props) => (
//           <AntIcon name="home" size={18} color={"000"} />
//         ),
//       }}
//     />
//   </Tab.Navigator> 
//   );
// }
const HomeStack = () => {
  return (
    <Stack.Navigator
    //headerMode='none'
    >
      <Stack.Screen name="home" component={home} />
    </Stack.Navigator>
  );
}

const HomeTab = () => {
  return (
    <Tab.Navigator

    >
      <Tab.Screen name="home" component={HomeStack} />
    </Tab.Navigator>
  );
}

const AppStack = () => {

  return (
    <>
      <Stack.Navigator>
        <Stack.Screen
          name="home"
          component={home}
          options={{
            headerShown: false
          }}
        />
        {/* <TabStack /> */}

      </Stack.Navigator>
    </>
    // <Drawer.Navigator>
    //   <Drawer.Screen name="home" component={HomeTab} />
    // </Drawer.Navigator>

  );
};

export default AppStack;
