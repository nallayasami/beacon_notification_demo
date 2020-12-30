/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TextInput,
  TouchableHighlight,
  PermissionsAndroid,
  DeviceEventEmitter,
  Platform,
  Button
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Beacons from 'react-native-beacons-manager';

import PushNotification from "react-native-push-notification";
import BackgroundService from 'react-native-background-actions';



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uuid: 'fda50693-a4e2-4fb1-afcf-3426064ca690',
      identifier: 'carepredict',
      beacons: [],
      message: '-',
      geodata: ''
    };
    this.stopBakgroundTask = this.stopBakgroundTask.bind(this);
    this.startBackgroundTask = this.startBackgroundTask.bind(this);
    this.refreshUUID = this.refreshUUID.bind(this);
  }

  configurePushNotification() {
    PushNotification.configure({
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  async startBackgroundTask() {
    const veryIntensiveTask = async (taskDataArguments) => {
      // Example of an infinite loop task
      const { delay } = taskDataArguments;
      await new Promise(async (resolve) => {
        // for (let i = 0; BackgroundService.isRunning(); i++) {
        //     console.log('some text');
        // }
      });
    };

    const options = {
      taskName: 'beaconNotificationDemo',
      taskTitle: 'Beacon Notification Demo',
      taskDesc: 'To check the background notification',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
      color: '#ff00ff',
      linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
      parameters: {
        delay: 1000,
      },
    };


    await BackgroundService.start(veryIntensiveTask, options);
  }

  async stopBakgroundTask() {
    // iOS will also run everything here in the background until .stop() is called
    await BackgroundService.stop();
  }

  async checkPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Wifi networks",
          message: "We need your permission in order to find wifi networks"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Thank you for your permission! :)");
      } else {
        console.log(
          "You will not able to retrieve wifi available networks list"
        );
      }
    } catch (err) {
      console.warn(err);
    }
  }

  async startBeaconMonitoring() {
    const { uuid, identifier } = this.state;
    const region = {
      uuid,
      identifier
    }
    Beacons.detectIBeacons();

    try {
      await Beacons.startRangingBeaconsInRegion(region)
      console.log(`Beacons ranging started succesfully!`)
    } catch (err) {
      console.log(`Beacons ranging not started, error: ${error}`)
    }

    // Print a log of the detected iBeacons (1 per second)
    DeviceEventEmitter.addListener('beaconsDidRange', (data) => {
      if (data.beacons && data.beacons.length > 0) {
        console.log('Found beacons!', data.beacons);
        PushNotification.localNotification({
          title: "Notfication from BLE",
          message: "Value from BLE: " + data.beacons[0].uuid,
        });
      }
    })
  }

  async componentDidMount() {

    this.configurePushNotification();

    // this.startBackgroundTask();
    // await BackgroundService.updateNotification({ taskDesc: 'New ExampleTask description' }); // Only Android, iOS will ignore this call

    if (Platform.OS === 'android') {
      await this.checkPermission();
      await this.startBeaconMonitoring();
    }
  }

  refreshUUID = () => {
    this.startBeaconMonitoring();
  };

  handleChange = (event) => {
    this.setState({ uuid: event });
    console.log(this.state.uuid);
  };

  render() {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.sectionContainer}>
              <Text style={{ fontSize: 18, paddingVertical: 10 }}>UUID</Text>
              <TextInput
                placeholder="UUID"
                onChangeText={this.handleChange}
                defaultValue={this.state.uuid}
                style={{
                  fontSize: 14,
                  textTransform: 'uppercase',
                  borderWidth: 1,
                  borderColor: '#adadad',
                  paddingVertical: 10,
                  paddingHorizontal: 5,
                  borderRadius: 5,
                }}
              />

              <View></View>

              <Button style={styles.button} onPress={() => this.refreshUUID()} title="Refresh"></Button>
              <Button style={styles.button} onPress={() => this.startBackgroundTask()} title="Start Background task"></Button>
              <Button style={styles.button} onPress={() => this.stopBakgroundTask()} title="Stop Background task"></Button>



            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignContent: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  button: {
    paddingVertical: 30,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignContent: 'center',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
