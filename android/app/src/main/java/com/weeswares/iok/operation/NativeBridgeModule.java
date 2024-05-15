package com.weeswares.iok.operation;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class NativeBridgeModule extends ReactContextBaseJavaModule {

    public NativeBridgeModule(@Nullable ReactApplicationContext c) {
        super(c);
    }

    @NonNull
    @Override
    public String getName() {
        return "NativeBridge";
    }

    @ReactMethod
    public void dismissKeyguard(Activity activity) {
        KeyguardManager keyguardManager = (KeyguardManager) getReactApplicationContext().getSystemService(
                Context.KEYGUARD_SERVICE
        );
        boolean isLocked = keyguardManager.isKeyguardLocked();
        if (isLocked) {
            Log.d("CallKeepHelperModule", "screen locked");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                keyguardManager.requestDismissKeyguard(
                        activity,
                        new KeyguardManager.KeyguardDismissCallback() {
                            @Override
                            public void onDismissError() {
                                Log.d("CallKeepHelperModule", "onDismissError");
                            }

                            @Override
                            public void onDismissSucceeded() {
                                Log.d("CallKeepHelperModule", "onDismissSucceeded");
                            }

                            @Override
                            public void onDismissCancelled() {
                                Log.d("CallKeepHelperModule", "onDismissCancelled");
                            }
                        }
                );
            }
        } else {
            Log.d("CallKeepHelperModule", "unlocked");
        }
    }

    @ReactMethod
    public void startActivity() {
        Log.d("CallKeepHelperModule", "start activity");
        Context context = getReactApplicationContext();
        String packageName = context.getApplicationContext().getPackageName();
        Intent focusIntent = context.getPackageManager().getLaunchIntentForPackage(packageName).cloneFilter();
        focusIntent.putExtra("wake", true);
        Activity activity = getCurrentActivity();
        boolean isRunning = activity != null;

        if (isRunning) {
            Log.d("CallKeepHelperModule", "activity is running");
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            activity.startActivity(focusIntent);
            dismissKeyguard(activity);
        } else {
            Log.d("CallKeepHelperModule", "activity is not running, starting activity");
            focusIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK + Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            context.startActivity(focusIntent);
        }
    }
}