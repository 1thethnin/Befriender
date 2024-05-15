/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import React from 'react';
import ErrorBoundary from './src/components/error_boundary';

AppRegistry.registerHeadlessTask('RNCallKeepBackgroundMessage', () => ({ name, callUUID, handle }) => {
  // Make your call here
  console.log('RNCallKeepBackgroundMessage,', name, ',', callUUID, ',', handle);
  return Promise.resolve();
});

function HeadlessCheck({ isHeadless }) {
  
  console.reportErrorsAsExceptions = false;

  if (isHeadless) {
    console.log("Headless");
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
