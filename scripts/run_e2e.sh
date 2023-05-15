killall node
nohup yarn react-native start > "out.yarn_react_native_start" &

yarn detox build -c android.emu.debug
yarn detox test -c android.emu.debug
