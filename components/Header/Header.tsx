/* eslint-disable react-native/no-inline-styles */
import { faBars, faCheck, faInfo, faPlay, faStop } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useTheme } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ContextAppLoaded } from '../../app/context';
import { ThemeType } from '../../app/types';
import CurrencyAmount from '../Components/CurrencyAmount';
import PriceFetcher from '../Components/PriceFetcher';
import RegText from '../Components/RegText';
import ZecAmount from '../Components/ZecAmount';

type HeaderProps = {
  poolsMoreInfoOnClick?: () => void;
  syncingStatusMoreInfoOnClick?: () => void;
  toggleMenuDrawer?: () => void;
  setZecPrice?: (p: number, d: number) => void;
  title: string;
  noBalance?: boolean;
  noSyncingStatus?: boolean;
  noDrawMenu?: boolean;
  testID?: string;
};

const Header: React.FunctionComponent<HeaderProps> = ({
  poolsMoreInfoOnClick,
  syncingStatusMoreInfoOnClick,
  toggleMenuDrawer,
  setZecPrice,
  title,
  noBalance,
  noSyncingStatus,
  noDrawMenu,
  testID,
}) => {
  const context = useContext(ContextAppLoaded);
  const { translate, totalBalance, info, syncingStatus, currency, zecPrice, dimensions } = context;
  const { colors } = useTheme() as unknown as ThemeType;

  const syncStatusDisplayLine = syncingStatus.inProgress ? `(${syncingStatus.blocks})` : '';
  const balanceColor = colors.text;

  return (
    <>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingBottom: 0,
          backgroundColor: colors.card,
          zIndex: -1,
          paddingTop: 10,
        }}>
        <Image
          source={require('../../assets/img/logobig-zingo.png')}
          style={{ width: 80, height: 80, resizeMode: 'contain' }}
        />
        {noBalance && <View style={{ height: 20 }} />}
        {!noBalance && (
          <View
            style={{
              flexDirection: dimensions.orientation === 'portrait' ? 'row' : 'column-reverse',
              margin: dimensions.orientation === 'portrait' ? 0 : 10,
            }}>
            <ZecAmount
              currencyName={info.currencyName ? info.currencyName : ''}
              color={balanceColor}
              size={36}
              amtZec={totalBalance.total}
            />
            {totalBalance.total > 0 && (totalBalance.privateBal > 0 || totalBalance.transparentBal > 0) && (
              <TouchableOpacity onPress={() => poolsMoreInfoOnClick && poolsMoreInfoOnClick()}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.card,
                    borderRadius: 10,
                    margin: 0,
                    padding: 0,
                    marginLeft: dimensions.orientation === 'portrait' ? 5 : 0,
                    minWidth: 48,
                    minHeight: 48,
                  }}>
                  <RegText color={colors.primary}>{translate('history.pools')}</RegText>
                  <FontAwesomeIcon icon={faInfo} size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {currency === 'USD' && !noBalance && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CurrencyAmount
              style={{ marginTop: 0, marginBottom: 5 }}
              price={zecPrice.zecPrice}
              amtZec={totalBalance.total}
              currency={currency}
            />
            <View style={{ marginLeft: 5 }}>
              <PriceFetcher setZecPrice={setZecPrice} />
            </View>
          </View>
        )}

        {dimensions.orientation === 'landscape' && (
          <View style={{ width: '100%', height: 1, backgroundColor: colors.primary }} />
        )}

        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginVertical: 5,
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
            <RegText testID={testID} color={colors.money} style={{ paddingHorizontal: 5 }}>
              {title}
            </RegText>
          </View>
          {!noSyncingStatus && (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                padding: 1,
                borderColor: colors.primary,
                borderWidth: 1,
                borderRadius: 10,
                minWidth: 20,
                minHeight: 20,
              }}>
              {!syncStatusDisplayLine && syncingStatus.synced && (
                <View style={{ margin: 0, padding: 0 }}>
                  <FontAwesomeIcon icon={faCheck} color={colors.primary} />
                </View>
              )}
              {!syncStatusDisplayLine && !syncingStatus.synced && (
                <TouchableOpacity onPress={() => syncingStatusMoreInfoOnClick && syncingStatusMoreInfoOnClick()}>
                  <FontAwesomeIcon icon={faStop} color={colors.zingo} size={12} />
                </TouchableOpacity>
              )}
              {syncStatusDisplayLine && (
                <TouchableOpacity onPress={() => syncingStatusMoreInfoOnClick && syncingStatusMoreInfoOnClick()}>
                  <FontAwesomeIcon icon={faPlay} color={colors.primary} size={10} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {!noDrawMenu && (
        <View style={{ backgroundColor: colors.card, padding: 10, position: 'absolute' }}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={translate('menudrawer-acc')}
            onPress={toggleMenuDrawer}>
            <FontAwesomeIcon icon={faBars} size={48} color={colors.border} />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ padding: 15, position: 'absolute', right: 0, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 8, color: colors.border }}>{translate('version')}</Text>
        <Text style={{ fontSize: 8, color: colors.border }}>
          {'(' + dimensions.width + 'x' + dimensions.height + ')-' + dimensions.scale}
        </Text>
        <Text style={{ fontSize: 7, color: colors.border }}>
          {dimensions.orientation === 'landscape' ? translate('info.landscape') : translate('info.portrait')}
        </Text>
      </View>

      <View style={{ width: '100%', height: 1, backgroundColor: colors.primary }} />
    </>
  );
};

export default Header;
