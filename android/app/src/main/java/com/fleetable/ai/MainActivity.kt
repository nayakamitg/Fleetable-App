package com.fleetable.ai

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "Fleetable"

  override fun onCreate(savedInstanceState: Bundle?) {
    // ✅ Native splash install
    installSplashScreen()

    super.onCreate(savedInstanceState)
    // splash immediately removed
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
