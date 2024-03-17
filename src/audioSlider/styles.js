import { StyleSheet, Platform } from "react-native";

export const styles = StyleSheet.create({
  rowContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
  },
  iconContainer: {
    width:'10%',
    // alignSelf: "center",
    position: "relative",
  },
  playBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  sliderContainer: {
    flexDirection:'row',
    justifyContent:'space-between',
    // backgroundColor:'#000',
    width: "100%",
    paddingBottom:10
  },
  slider: {
    height: 25,
    width: "100%",
    marginBottom: 3,
    // justifyContent:'center' ,
  },
  durationContainer: { flexDirection: "row", justifyContent: "space-between" },
  actionsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
  },
  crossLine: {
    position: "absolute",
    transform: [ {rotate: "-60deg"} ],
    top: 10,
    left: -5,
    width: 30,
    height: 1,
    borderBottomColor: '#FF7300',
    borderBottomWidth: 2,
  },
  volumeControlContainer: {
    width:'20%',
    alignItems: "center",
    justifyContent:"flex-end",
    flexDirection:'row'
  },
  volumeSlider: {
    width: '50%',
  },
  timeText: {
    color: '#999',
    fontSize: 10,
  },
  playIcon: { height: 17.5, width: 17.5, resizeMode: 'contain' },
});
