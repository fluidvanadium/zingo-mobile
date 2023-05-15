These e2e tests depend on emulating or attaching a device.

1) setup android stack

2) build zingo-mobile
`$ ./scripts/setup.sh`

3) build emulator with x86_64 or another ABI
`$ ./scripts/emulate_app.sh -a x86_64 -s`

4) run e2e tests
`$ ./scripts/run_e2e.sh`

or to run with specifications:
check installed emulators with 
`$ emulator -list-avds`
compare to the configuration aliases in `.detoxrs`
pick a test called `e2e/TESTNAME.test.js`
`yarn detox build TESTNAME -c CONFIGURATION`
`yarn detox test TESTNAME -c CONFIGURATION`

