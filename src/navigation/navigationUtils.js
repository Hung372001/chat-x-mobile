import {
  CommonActions,
  DrawerActions,
  StackActions,
} from "@react-navigation/native";
import * as React from 'react';

const config = {
  navigator: null,
};

export const navigationRef = React.createRef();

export function setNavigator(nav) {
  if (nav) {
    config.navigator = nav;
  }
  return nav;
}

export function getActiveRouteName(state) {
  if (state) {
    const route = state.routes[state.index];
    if (route.state) {
      return getActiveRouteName(route.state);
    }
    return route.name;
  }
}

export const screenTracking = (state) => {
  const currentRouteName = getActiveRouteName(state);
  console.log(`====== NAVIGATING to > ${currentRouteName}`);
};

export function replace(routeName, params) {
  if (navigationRef?.current?.isReady() && routeName) {
    navigationRef?.current?.dispatch(StackActions.replace(routeName, params));
  }
}

export function navigate(routeName, params) {
  if (navigationRef?.current?.isReady() && routeName) {
    navigationRef?.current?.dispatch(CommonActions.navigate(routeName, params));
  }
}

export function goBack() {
  if (navigationRef?.current?.isReady()) {
    let action = CommonActions.goBack();
    navigationRef?.current?.dispatch(action);
  }
}

export function popBack(index) {
  const popAction = StackActions.pop(index);
  navigationRef?.current?.dispatch(popAction);
}

export function push(routeName, params) {
  if (navigationRef?.current?.isReady() && routeName) {
    let action = StackActions.push(routeName, params);
    navigationRef?.current?.dispatch(action);
  }
}

export function resetTo(routeName, params) {
  if (navigationRef?.current?.isReady() && routeName) {
    let action = CommonActions.reset({
      index: 0,
      routes: [
        {
          name: routeName,
          params,
        },
      ],
    });
    navigationRef?.current?.dispatch(action);
  }
}
