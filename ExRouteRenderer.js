'use strict';

import React from 'react-native';
let {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} = React;
import ResponsiveImage from '@exponent/react-native-responsive-image';

import autobind from 'autobind-decorator';
import invariant from 'invariant';
import cloneReferencedElement from 'react-native-clone-referenced-element';

import ExNavigatorStyles from './ExNavigatorStyles';
import ExSceneConfigs from './ExSceneConfigs';
import Layout from './Layout';

import type { Navigator } from 'react-native';
import type * as ExRoute from './ExRoute';

type BarStyles = {
  titleStyle?: any;
  barButtonTextStyle?: any;
  barButtonIconStyle?: any;
};

class NavigationBarRouteMapper {
  constructor(styles: BarStyles) {
    this._titleStyle = styles.titleStyle;
    this._barButtonTextStyle = styles.barButtonTextStyle;
    this._barButtonIconStyle = styles.barButtonIconStyle;
  }

  Title(
    route: ExRoute,
    navigator: Navigator,
    index: number,
    state: Object
  ): ?React.Component {
    if (route.renderTitle) {
      return route.renderTitle(navigator, index, state);
    }

    if (!route.getTitle) {
      return null;
    }

    return (
      <Text style={[ExNavigatorStyles.barTitleText, this._titleStyle]}>
        {shortenTitle(route.getTitle(navigator, index, state))}
      </Text>
    );
  }

  LeftButton(
    route: ExRoute,
    navigator: Navigator,
    index: number,
    state: Object
  ): ?React.Component {

    if (route.renderLeftButton) {
      return route.renderLeftButton(navigator, index, state);
    }

    if (index === 0) {
      return null;
    }

    let previousIndex = index - 1;
    let previousRoute = state.routeStack[previousIndex];
    return this._renderBackButton(previousRoute, navigator, previousIndex, state);
  }

  _renderBackButton(
    previousRoute: ExRoute,
    navigator: Navigator,
    previousIndex: number,
    state: Object
  ): ?React.Component {
    if (previousRoute.renderBackButton) {
      return previousRoute.renderBackButton(navigator, previousIndex, state);
    }

    let title;
    if (previousRoute.getTitle) {
      title = previousRoute.getTitle(navigator, previousIndex, state);
    }

    if (title) {
      var buttonText =
        <Text style={[
          ExNavigatorStyles.barButtonText,
          ExNavigatorStyles.barBackButtonText,
          this._barButtonTextStyle,
        ]}>
          {title}
        </Text>;
    }

    return (
      <TouchableOpacity
        touchRetentionOffset={ExNavigatorStyles.barButtonTouchRetentionOffset}
        onPress={() => navigator.pop()}
        style={[ExNavigatorStyles.barBackButton, styles.backButtonStyle]}>
        <ResponsiveImage
          sources={{
            2: {uri: 'http://static.exp.host/NavigationBarBack@2x.png'},
            3: {uri: 'http://static.exp.host/NavigationBarBack@3x.png'},
          }}
          style={[
            ExNavigatorStyles.barButtonIcon,
            styles.backIcon,
            this._barButtonIconStyle,
          ]}
        />
        {buttonText}
      </TouchableOpacity>
    );
  }

  RightButton(
    route: ExRoute,
    navigator: Navigator,
    index: number,
    state: Object
  ): ?React.Component {
    if (route.renderRightButton) {
      return route.renderRightButton(navigator, index, state);
    }
  }
};

export default class ExRouteRenderer {
  constructor(styles: BarStyles) {
    this._previousRoute = null;
    this.navigationBarRouteMapper = new NavigationBarRouteMapper(styles);
  }

  @autobind
  configureScene(route: ExRoute): Object {
    if (route.configureScene) {
      let sceneConfig = route.configureScene();
      if (sceneConfig) {
        return sceneConfig;
      }
    }

    if (Platform.OS === 'android') {
      return ExSceneConfigs.Fade;
    } else {
      return ExSceneConfigs.PushFromRight;
    }
  }

  @autobind
  renderScene(route: ExRoute, navigator: Navigator): React.Component {
    if (route.renderScene) {
      return cloneReferencedElement(route.renderScene(navigator), {
        ref: component => { route.scene = component; },
      });
    }
    invariant(
      route.getSceneClass,
      'The route must implement renderScene or getSceneClass',
    );
    let Component = route.getSceneClass();
    return (
      <Component
        ref={component => { route.scene = component; }}
        navigator={navigator}
      />
    );
  }

  @autobind
  onWillFocus(event) {
    let { data: { route } } = event;
    if (route.onWillFocus) {
      route.onWillFocus(event);
    }
    // The component isn't mounted yet if this is the first time it's rendered
    if (route.scene && route.scene.componentWillFocus) {
      route.scene.componentWillFocus(event);
    }

    if (this._previousRoute && this._previousRoute.onWillBlur) {
      this._previousRoute.onWillBlur(event);
    }
  }

  @autobind
  onDidFocus(event) {
    let { data: { route } } = event;
    if (route.onDidFocus) {
      route.onDidFocus(event);
    }
    if (route.scene.componentDidFocus) {
      route.scene.componentDidFocus(event);
    }

    if (this._previousRoute && this._previousRoute.onDidBlur) {
      this._previousRoute.onDidBlur(event);
    }
    this._previousRoute = route;
  }
};

// Long titles will run into the left and right button text or overflow even
// further and just generally look gross so we try to limit the damage by
// shortening the title text.
//
// iOS does this by moving the title to take up the available space (to the
// left or right if the buttons leave space), and then ellipsising as necessary
// by measuring the actual text, etc. We can eventually but for now, we'll just
// limit titles to at most 18 characters.
function shortenTitle(title) {
  if (title.length > 18) {
    return title.substr(0, 18) + '…';
  } else {
    return title;
  }
}

let styles = StyleSheet.create({
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 13,
    height: 21,
    marginTop: 11 + Layout.pixel,
    marginLeft: 8,
  },
});

export default ExRouteRenderer;
