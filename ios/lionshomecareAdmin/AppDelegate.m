#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <Firebase.h>
#import <RNFBMessagingModule.h>
#import "RNCallKeep.h"
#import <React/RCTLinkingManager.h>
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>
#import <PushKit/PushKit.h>
#import "RNVoipPushNotificationManager.h"

#import <FirebaseCore.h>
#import <FirebaseFirestore.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>


static void InitializeFlipper(UIApplication *application) {
  FlipperClient *client = [FlipperClient sharedClient];
  SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
  [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
  [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
  [client addPlugin:[FlipperKitReactPlugin new]];
  [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
  [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
#ifdef FB_SONARKIT_ENABLED
  InitializeFlipper(application);
#endif

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  [RNVoipPushNotificationManager voipRegistration];
  
//  NSDictionary *appProperties = [RNFBMessagingModule addCustomPropsToUserProps:nil withLaunchOptions:launchOptions];
  [RNCallKeep setup:@{
    @"appName": @"Befriender",
    @"maximumCallsPerCallGroup": @5,//Default: 1
    @"includesCallsInRecents": @YES,//default: yes
    //@"maximumCallGroups": @5,//default: 3
    //@"supportsVideo": @YES,//default: yes
  }];

 

  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"lionshomecareAdmin"
                                            initialProperties:nil];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}
- (BOOL)application:(UIApplication *)application
 continueUserActivity:(NSUserActivity *)userActivity
   restorationHandler:(void(^)(NSArray * __nullable restorableObjects))restorationHandler
 {
   return [RNCallKeep application:application
            continueUserActivity:userActivity
              restorationHandler:restorationHandler];
 }

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation
{
  return [RCTLinkingManager application:application openURL:url
                      sourceApplication:sourceApplication annotation:annotation];
}

//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNNotificationPresentationOptionSound | UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionBadge);
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
}

/* Add PushKit delegate method */

// --- Handle updated push credentials
- (void)pushRegistry:(PKPushRegistry *)registry didUpdatePushCredentials:(PKPushCredentials *)credentials forType:(PKPushType)type {
  // Register VoIP push token (a property of PKPushCredentials) with server
  NSLog(@"voip register token = %@ , %@", credentials, type);
  [RNVoipPushNotificationManager didUpdatePushCredentials:credentials forType:(NSString *)type];
}

- (void)pushRegistry:(PKPushRegistry *)registry didInvalidatePushTokenForType:(PKPushType)type
{
  // --- The system calls this method when a previously provided push token is no longer valid for use. No action is necessary on your part to reregister the push type. Instead, use this method to notify your server not to send push notifications using the matching push token.
}

// --- Handle incoming pushes
- (void)pushRegistry:(PKPushRegistry *)registry didReceiveIncomingPushWithPayload:(PKPushPayload *)payload forType:(PKPushType)type withCompletionHandler:(void (^)(void))completion {
  // Process the received push
  [RNVoipPushNotificationManager didReceiveIncomingPushWithPayload:payload forType:(NSString *)type];

  NSString *uuid = /* fetch for payload or ... */ [[[NSUUID UUID] UUIDString] lowercaseString];
  NSString *handle = @"caller number here";
  NSString *callerName = payload.dictionaryPayload[@"callerName"];
  NSDictionary *extra = [payload.dictionaryPayload valueForKeyPath:@"data"];

  NSLog(@"self.isForeground = %d", self.isForeground);
  if(!self.isForeground){

    NSLog(@"self.isForeground = report manually!");
    [RNCallKeep reportNewIncomingCall: uuid
                               handle: handle
                           handleType: @"generic"
                             hasVideo: YES
                  localizedCallerName: callerName
                      supportsHolding: YES
                         supportsDTMF: YES
                     supportsGrouping: YES
                   supportsUngrouping: YES
                          fromPushKit: YES
                              payload: extra
                withCompletionHandler: completion];
  }

  // --- this is optional, only required if you want to call `completion()` on the js side
  //[RNVoipPushNotificationManager addCompletionHandler:uuid completionHandler:completion];

  completion();
  
//  NSTimeInterval delayInSeconds = 0.5;
//  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delayInSeconds * NSEC_PER_SEC));
//  dispatch_after(popTime, dispatch_get_main_queue(), ^(void){
//    NSLog(@"Do some work");
//    if(extra != nil && extra[@"callID"] != nil ) {
//        NSString *callID = extra[@"callID"];
//        FIRFirestore *db = [FIRFirestore firestore];
//
//        [[[db collectionWithPath:@"calls"] documentWithPath:callID]
//            addSnapshotListener:^(FIRDocumentSnapshot *snapshot, NSError *error) {
//          if (snapshot == nil) {
//            NSLog(@"Error fetching document: %@", error);
//            return;
//          }
//          NSLog(@"Current data: %@", snapshot.data);
//
//          NSDictionary *data = snapshot.data;
//          //STATE_CALLING: 'calling',
//          //STATE_PICK_UP: 'pickup',
//          //STATE_RINGING: 'ringing',
//          //STATE_CONNECTING: 'connecting',
//
//          if (data != nil){
//            NSString *status = data[@"status"];
//            if([status isEqualToString:@"timeout"] || [status isEqualToString:@"rejected"]
//               || [status isEqualToString:@"ended"] || [status isEqualToString:@"canceled"]
//               || [status isEqualToString:@"busy"]) {
//              [RNCallKeep endCallWithUUID:uuid reason:1];
//            }
//          }
//        }];
//    }
//  });
  
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  NSLog(@"applicationWillEnterForeground");//...1//not reach in first launch
}

- (void)applicationDidBecomeActive:(UIApplication *)application {
  NSLog(@"applicationDidBecomeActive");//1//2
  self.isForeground = YES;
}

- (void)applicationWillResignActive:(UIApplication *)application {
  NSLog(@"applicationWillResignActive");//1
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
}

- (void)applicationDidEnterBackground:(UIApplication *)application {
  NSLog(@"applicationDidEnterBackground");//2
  self.isForeground = NO;
}

- (void)applicationWillTerminate:(UIApplication *)application {
  NSLog(@"applicationWillTerminate");//3
  self.isForeground = NO;
}
@end
