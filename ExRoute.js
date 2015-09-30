'use strict';

import type { Component, Navigator } from 'react-native';

export type ExRoute = {
  getTitle?: (navigator: Navigator, index: number, state: Object) => ?string;
  renderTitle?: (navigator: Navigator, index: number, state: Object) => ?Component;
  renderLeftButton?: (navigator: Navigator, index: number, state: Object) => ?Component;
  renderRightButton?: (navigator: Navigator, index: number, state: Object) => ?Component;
  renderBackButton?: (navigator: Navigator, index: number, state: Object) => ?Component;
  getSceneClass?: () => typeof Component;
  configureScene?: () => typeof Navigator.SceneConfigs.PushFromRight;
  renderScene?: (navigator: Navigator, onRef: Function) => Component;
};
