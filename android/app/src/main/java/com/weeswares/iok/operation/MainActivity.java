package com.weeswares.iok.operation;


import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Log;
import android.view.WindowManager;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.ReactActivity;

import io.wazo.callkeep.RNCallKeepModule;

public class MainActivity extends ReactActivity {

    private static final String TAG = "MainActivity";
    private static final int ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE = 120;

    public static void turnOnScreen(Activity activity) {
        activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN
                | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        PowerManager powerManager = (PowerManager) activity.getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.FULL_WAKE_LOCK |
                PowerManager.ACQUIRE_CAUSES_WAKEUP |
                PowerManager.ON_AFTER_RELEASE, "Operation::WakeLock");

        //acquire will turn on the display
        wakeLock.acquire(10 * 60 * 1000L /*10 minutes*/);
    }

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "lionshomecareAdmin";
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        if (intent.getExtras() != null && intent.getExtras().getBoolean("wake")) {
            wakeDevice();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        MainApplication.activityPaused();
    }

    @Override
    protected void onResume() {
        super.onResume();
        MainApplication.activityResumed();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            requestPermissionToBeAbleToLaunchActivityFromBackground();
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        Log.i(TAG, "onUserLeaveHint: about to go in picture in picture mode");
//        enterPictureInPictureMode();
    }

    private void wakeDevice() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            Log.d(TAG, "onCreate: set window flags for API level > 27");
            turnOnScreen(this);
            KeyguardManager keyguardManager = (KeyguardManager) getApplicationContext().getSystemService(Context.KEYGUARD_SERVICE);
            keyguardManager.requestDismissKeyguard(this, null);
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        } else {
            Log.d(TAG, "onCreate: onCreate:set window flags for API level < 27");
            getWindow().addFlags(
                    WindowManager.LayoutParams.FLAG_FULLSCREEN
                            | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                            | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                            | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
                RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    private void requestPermissionToBeAbleToLaunchActivityFromBackground() {
        // Check if Android M or higher
        if (Settings.canDrawOverlays(this)) return;// if it is already granted, then just return.
        // Show alert dialog to the user saying a separate permission is needed
        // Launch the settings activity if the user prefers
        Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + getPackageName()));
        startActivityForResult(intent, ACTION_MANAGE_OVERLAY_PERMISSION_REQUEST_CODE);
    }
}
