/**
 * @format
 */

import 'react-native';
import React from 'react';

import { create } from 'react-test-renderer';
import Receive from '../components/Receive';
import { ContextLoadedProvider } from '../app/context';

import {
  ErrorModalData,
  ReceivePageState,
  SendPageState,
  SendProgress,
  SyncStatusReport,
  ToAddr,
  TotalBalance,
  WalletSettings,
} from '../app/AppState';

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: '',
}));
jest.mock('react-native-tab-view', () => ({
  TabView: '',
  TabBar: '',
}));
jest.mock('react-native-option-menu', () => '');
jest.useFakeTimers();

// test suite
describe('Component Receive - test', () => {
  //snapshot test
  test('Receive - snapshot', () => {
    const state = {
      navigation: null,
      route: null,

      syncStatusReport: new SyncStatusReport(),
      addressPrivateKeys: new Map(),
      addressBook: [],
      transactions: null,
      sendPageState: new SendPageState(new ToAddr(0)),
      receivePageState: new ReceivePageState(),
      info: null,
      rescanning: false,
      wallet_settings: new WalletSettings(),
      syncingStatus: null,
      errorModalData: new ErrorModalData(),
      txBuildProgress: new SendProgress(),
      walletSeed: null,
      isMenuDrawerOpen: false,
      selectedMenuDrawerItem: '',
      aboutModalVisible: false,
      computingModalVisible: false,
      settingsModalVisible: false,
      infoModalVisible: false,
      rescanModalVisible: false,
      seedViewModalVisible: false,
      seedChangeModalVisible: false,
      seedBackupModalVisible: false,
      seedServerModalVisible: false,
      syncReportModalVisible: false,
      poolsModalVisible: false,
      newServer: null,
      uaAddress: 'UA',
      addresses: [
        {
          uaAddress: 'UA',
          address: 'UA',
          addressKind: 'u',
          containsPending: false,
          receivers: 'ozt',
        },
      ],
      translate: () => 'text translated',
      dimensions: {
        width: 200,
        height: 200,
        orientation: 'portrait',
        deviceType: 'tablet',
        scale: 1.5,
      } as {
        width: number;
        height: number;
        orientation: 'portrait' | 'landscape';
        deviceType: 'tablet' | 'phone';
        scale: number;
      },
      totalBalance: new TotalBalance(),
    };
    const receive = create(
      <ContextLoadedProvider value={state}>
        <Receive
          fetchTotalBalance={() => {}}
          setUaAddress={() => {}}
          toggleMenuDrawer={() => {}}
          startRescan={() => {}}
          syncingStatusMoreInfoOnClick={() => {}}
          poolsMoreInfoOnClick={() => {}}
        />
      </ContextLoadedProvider>,
    );
    expect(receive.toJSON()).toMatchSnapshot();
  });
});
