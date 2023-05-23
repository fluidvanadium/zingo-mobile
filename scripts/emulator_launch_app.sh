#!/bin/bash

output_dir="android/app/build/outputs/emulator_output"

api_level=`cat ./${output_dir}/target_api_level.txt`
api_target=`cat ./${output_dir}/target_api.txt`
avd_device=`cat ./${output_dir}/target_avd_device.txt`
arch=`cat ./${output_dir}/target_arch.txt`

avd_name="${avd_device}-android-${api_level}_${api_target}_${arch}"
sdk="system-images;android-${api_level};${api_target};${arch}"

timeout_seconds=1800  # default timeout set to 30 minutes

function check_metro_server() {
    metro_status=$(cat ./${output_dir}/react-native_start.txt | grep Metro)
    if [[ "${metro_status}" == *"Metro"* ]]; then
        return 0;
    else
        return 1;
    fi
}

function wait_for() {
    timeout_seconds=$1
    shift 1
    until [ $timeout_seconds -le 0 ] || ("$@" &> /dev/null); do
        sleep 1
        timeout_seconds=$(( timeout_seconds - 1 ))
    done
    if [ $timeout_seconds -le 0 ]; then
        echo -e "\nError: Timeout" >&2
        exit 1
    fi
}

# Store emulator info and start logging
adb -s emulator-5555 shell getprop &> "${output_dir}/getprop.txt"
adb -s emulator-5555 shell cat /proc/meminfo &> "${output_dir}/meminfo.txt"
adb -s emulator-5555 shell cat /proc/cpuinfo &> "${output_dir}/cpuinfo.txt"
adb -s emulator-5555 shell logcat -v threadtime -b main &> "${output_dir}/logcat.txt" &

# Start react-native
if killall -9 node &> /dev/null; then
    echo -e "\nAll node processes killed."
    echo -e "\nRestarting react native..."
fi
nohup yarn react-native start |& tee "${output_dir}/react-native_start.txt" &

echo -e "\nWaiting for react-native/node/metro..."
wait_for $timeout_seconds check_metro_server

echo -e "\nLaunching App..."
adb shell am start -n "org.ZingoLabs.Zingo/org.ZingoLabs.Zingo.MainActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER &> "${output_dir}/launch_app.txt"

echo -e "\nOutputs saved: ${output_dir}"        

