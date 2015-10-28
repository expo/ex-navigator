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
import type * as ExNavigator from './ExNavigator';
import type * as ExRoute from './ExRoute';

type BarStyles = {
  titleStyle?: any;
  barButtonTextStyle?: any;
  barButtonIconStyle?: any;
};

class NavigationBarRouteMapper {
  constructor(navigator: ExNavigator, styles: BarStyles) {
    this._navigator = navigator;
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
      return route.renderTitle(this._navigator, index, state);
    }

    if (!route.getTitle) {
      return null;
    }

    return (
      <Text style={[ExNavigatorStyles.barTitleText, this._titleStyle]}>
        {shortenTitle(route.getTitle(this._navigator, index, state))}
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
      return route.renderLeftButton(this._navigator, index, state);
    }

    if (index === 0) {
      return null;
    }

    let previousIndex = index - 1;
    let previousRoute = state.routeStack[previousIndex];
    return this._renderBackButton(previousRoute, this._navigator, previousIndex, state);
  }

  _renderBackButton(
    previousRoute: ExRoute,
    navigator: Navigator,
    previousIndex: number,
    state: Object
  ): ?React.Component {
    if (previousRoute.renderBackButton) {
      return previousRoute.renderBackButton(this._navigator, previousIndex, state);
    }

    let title;
    if (previousRoute.getTitle) {
      title = previousRoute.getTitle(this._navigator, previousIndex, state);
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
        onPress={() => this._navigator.pop()}
        style={[ExNavigatorStyles.barBackButton, styles.backButtonStyle]}>
        <ResponsiveImage
          sources={{
            2: {
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAqCAYAAACtMEtjAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAABxpRE9UAAAAAgAAAAAAAAAVAAAAKAAAABUAAAAVAAABCxhsNeEAAADXSURBVFgJvJM9C8JQDEUrIiLiIA7iIDj4/xcnB3HQwcFvHARBEAQREVF01vPA0vAGM6TxQmjSkHteHm2S+KiP7djHOnMdkL6/Mcxe55uNBCSFhe1y1QS31Dx+9vIiTX9AAjT0zVriEG8gazOkAGCjQGbWNYoYbP8B2SmQuXWTEgZ7b0gZwEGBLOibVGH6SMivKc7NkCqAkzekBuCsQMJ/ZFKd6QsRX5GszZAGgKsCWdE3qcn0jZAnj3MzpAXg7g1pA3gokDV9kzpMP4n4imRthnQBvLwhHwAAAP//RYcLnAAAAMpJREFUvdYrC8JQAMXxKzLEIAYxGCwGP7wOH/P9Kq4oaJjBYBAMQxBBRLHquWGwIPeUoxcOg134/1ibMcbUsRf2dqyBO8mpofLE/oJVAT0I1sS95FRQuWOuL/MlEiJl7EawlgorIXQlWFuFFRG6EKyrwgoInQkWqLA8QjHBeiosh9CJYH0V5iF0JNhAhWUROhBspMIyCO0JNlZiO4JNVJjtbAg2VWIrgs2U2JJgCyU2d2ChErKt4RdsrUaSXieFbZOXv3raf4woHf8AvbFKeXDI5jkAAAAASUVORK5CYII=',
              isStatic: true
            },
            3: {
              uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAA/CAYAAABjJtHDAAAAAXNSR0IArs4c6QAAAAlwSFlzAAAhOAAAITgBRZYxYAAAABxpRE9UAAAAAgAAAAAAAAAgAAAAKAAAACAAAAAfAAABetwkrnwAAAFGSURBVGgFzNfPSwJREMBxK0IiCKSDeAg8dAi8eOjgxUuHLv6rnaJDHTwZ6KVDWvkDIZAghKSi3xbkd8AHohA7wfhmYHjwnN357OyyrKlU/DiBUI/PWBScsfU7zdriz/F2qjOwAJS96HGOIIDm19OYusYfsAA9jgG8SAALwKNlAVdodKmACVDqzUNg12SYSJK1aa6iwRrZUcJa1MsFmYbA+mSSSYWapcDWQd16hKVBDZSwK+rNb+UGTe48wjZB3XuEbYEaKmHyejG/lRmaPHiEbYMaKWE31JtPLEuTR4+wHKhnj7AdUC8eYXlQr0pYm3rzZ2yXJm8eYXug3pUw+Roxn1iBJh8eYUVQnx5h+6C+PMJKoMZKWJd682esTJNvj7CDf8B6HLNKmsYhZ/8hw/d8klVg8l/BNCqc3SVMrlz7HnviGPOJTQAAAP//IwzskAAAAUVJREFUzdixSwJhHMZxRUQaxEEQXBwaXBpanFxcXJz6C6MijQwtLVSyJnHIIQeHiAbBIRBBIhQzS+v5EQdCoPcsj77w45YXvh9Oebk7j+dvHeAyx/y4nAX2HWJkK4PSN4YBHsl0CKUxXyTwGPtlK4USCzyR6RBKYmYY5ic+VQITiH2SwKwSuI/YlATmlMA9xD5I4JkSGEdsQgDtv3quBO4iNiaBeSUwhtiIBF4ogVHE3klgQQmMIPZGAotKYBixIQm8VAJDiA1I4JUSGESsTwLLSuAOYq8k8FoJDCDWI4E3SqAfsS4JrCiBPsReSGBVCfQi9kQCa2pghwTeKoHWeiSBdTXwgQTeqYENEnivBlrQ7UtTU42znh0b64CtTcCcZmkFsO1s2uTVnpDtm8vyXbSjZ2uWvYg7QDu07fDeqmVfq54x/2C/yunX41hxMv0AAAAASUVORK5CYII=',
              isStatic: true
            },
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
      return route.renderRightButton(this._navigator, index, state);
    }
  }
};

export default class ExRouteRenderer {
  constructor(navigator: ExNavigator, styles: BarStyles) {
    this._previousRoute = null;
    this.navigationBarRouteMapper = new NavigationBarRouteMapper(
      navigator,
      styles,
    );
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
  renderScene(route: ExRoute, navigator: ExNavigator): React.Component {
    if (route.renderScene) {
      let scene = route.renderScene(navigator);
      if (!scene) {
        return scene;
      }
      return cloneReferencedElement(scene, {
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
