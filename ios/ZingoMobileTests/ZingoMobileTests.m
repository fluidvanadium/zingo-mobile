#import <UIKit/UIKit.h>
#import <XCTest/XCTest.h>

#import <React/RCTLog.h>
#import <React/RCTRootView.h>

#import "RPCModule.h"
#import "rust.h"

#define TIMEOUT_SECONDS 600
#define TEXT_TO_LOOK_FOR @"Welcome to React"

@interface ZingoMobileTests : XCTestCase

@end

@implementation ZingoMobileTests

- (BOOL)findSubviewInView:(UIView *)view matching:(BOOL(^)(UIView *view))test
{
  if (test(view)) {
    return YES;
  }
  for (UIView *subview in [view subviews]) {
    if ([self findSubviewInView:subview matching:test]) {
      return YES;
    }
  }
  return NO;
}

- (void)testRendersWelcomeScreen
{
  UIViewController *vc = [[[RCTSharedApplication() delegate] window] rootViewController];
  NSDate *date = [NSDate dateWithTimeIntervalSinceNow:TIMEOUT_SECONDS];
  BOOL foundElement = NO;

  __block NSString *redboxError = nil;
#ifdef DEBUG
  RCTSetLogFunction(^(RCTLogLevel level, RCTLogSource source, NSString *fileName, NSNumber *lineNumber, NSString *message) {
    if (level >= RCTLogLevelError) {
      redboxError = message;
    }
  });
#endif

  while ([date timeIntervalSinceNow] > 0 && !foundElement && !redboxError) {
    [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];
    [[NSRunLoop mainRunLoop] runMode:NSRunLoopCommonModes beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.1]];

    foundElement = [self findSubviewInView:vc.view matching:^BOOL(UIView *view) {
      if ([view.accessibilityLabel isEqualToString:TEXT_TO_LOOK_FOR]) {
        return YES;
      }
      return NO;
    }];
  }

#ifdef DEBUG
  RCTSetLogFunction(RCTDefaultLogFunction);
#endif

  XCTAssertNil(redboxError, @"RedBox error: %@", redboxError);
  XCTAssertTrue(foundElement, @"Couldn't find element with text '%@' in %d seconds", TEXT_TO_LOOK_FOR, TIMEOUT_SECONDS);
}

-(void) testCorruptWalletBug_ServerOKNewWallet {
  RPCModule *rpcmodule = [RPCModule new];
  
  // delete the wallet file, clean scenario
  BOOL delete = [rpcmodule deleteExistingWallet];
  NSLog(@"Test Delete Wallet Cleaning %i", delete);
  
  // server OK
  // ****************************************************
  NSString *serverOK = @"https://mainnet.lightwalletd.com:9067";
  NSString *chainhint = @"main";
  // create a new wallet
  NSString *newWalletOK = [rpcmodule createNewWallet:(serverOK, chainhint)];
  NSLog(@"Test create New Wallet OK %@", newWalletOK);
  XCTAssertFalse([newWalletOK hasPrefix:@"Error"], @"Create New Wallet fails %@", newWalletOK);
  
  // save the wallet in internal storage
  [rpcmodule saveWalletInternal];
  
  // load wallet from file
  NSString *loadWalletOK = [rpcmodule loadExistingWallet:(serverOK, chainhint)];
  NSLog(@"Test Load Wallet OK %@", loadWalletOK);
  XCTAssertFalse([loadWalletOK hasPrefix:@"Error"], @"Load Wallet from file fails %@", loadWalletOK);
  
  // delete the wallet file
  BOOL deleteOK = [rpcmodule deleteExistingWallet];
  NSLog(@"Test Delete Wallet OK %i", deleteOK);
}

-(void) testCorruptWalletBug_ServerKONewWallet {
  RPCModule *rpcmodule = [RPCModule new];
  
  // delete the wallet file, clean scenario
  BOOL delete = [rpcmodule deleteExistingWallet];
  NSLog(@"Test Delete Wallet Cleaning %i", delete);
  
  // server KO
  // ****************************************************
  NSString *serverKO = @"https://zuul.free2z.cash:9067";
  NSString *serverOK = @"https://mainnet.lightwalletd.com:9067";
  NSString *chainhint = @"main";
  // create a new wallet, expecting ERROR.
  NSString *newWalletKO = [rpcmodule createNewWallet:(serverKO, chainhint)];
  NSLog(@"Test create New Wallet KO %@", newWalletKO);
  XCTAssertTrue([newWalletKO hasPrefix:@"Error"], @"Create New Wallet NOT fails, and it have to %@", newWalletKO);
  
  // save wallet in internal storage
  [rpcmodule saveWalletInternal];
  
  // load wallet from file, expecting ERROR.
  NSString *loadWalletKO = [rpcmodule loadExistingWallet:(serverKO, chainhint)];
  NSLog(@"Test create Load Wallet KO %@", loadWalletKO);
  XCTAssertTrue([newWalletKO hasPrefix:@"Error"], @"Load Wallet from file NOT fails, and it have to %@", newWalletKO);
  
  // load wallet from file, expecting CORRUPT WALLET BUG.
  NSString *loadWalletOK = [rpcmodule loadExistingWallet:(serverOK, chainhint)];
  NSLog(@"Test create Load Wallet KO %@", loadWalletOK);
  XCTAssertFalse([loadWalletOK hasPrefix:@"Error"], @"Load Wallet from file fails %@", loadWalletOK);
  
  // delete the wallet file
  BOOL deleteKO = [rpcmodule deleteExistingWallet];
  NSLog(@"Test Delete Wallet OK %i", deleteKO);
}

@end
