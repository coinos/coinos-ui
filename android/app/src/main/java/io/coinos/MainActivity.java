package io.coinos;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginHandle;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);

      WebView webView = bridge.getWebView();
      CookieManager cookieManager = CookieManager.getInstance();
      cookieManager.setAcceptCookie(true);
      webView.getSettings().setJavaScriptEnabled(true);
      webView.getSettings().setDomStorageEnabled(true);

      Intent intent = getIntent();
      if (intent != null && Intent.ACTION_VIEW.equals(intent.getAction())) {
          Uri data = intent.getData();
          if (data != null) {
              String url = data.toString();
              Bridge bridge = getBridge();
              
              if (bridge != null) {
                  String encodedUrl = Uri.encode(url);
                  String destinationUrl = "https://coinos.io/send/" + encodedUrl;

                  bridge.getWebView().post(() -> {
                      bridge.getWebView().loadUrl(destinationUrl);
                  });
              }
          }
      }
  }

  @Override
  public void onNewIntent(Intent intent) {
      super.onNewIntent(intent);
      setIntent(intent);
      if (intent != null && Intent.ACTION_VIEW.equals(intent.getAction())) {
          Uri data = intent.getData();
          if (data != null) {
              String url = data.toString();

              // Dispatch deep link when app is already open
              Bridge bridge = getBridge();
              if (bridge != null) {
                  String encodedUrl = Uri.encode(url);
                  String destinationUrl = "https://coinos.io/send/" + encodedUrl;

                  bridge.getWebView().post(() -> {
                      bridge.getWebView().loadUrl(destinationUrl);
                  });
              }
          }
      }
  }

  @Override
  public void onPause() {
    super.onPause();
    CookieManager.getInstance().flush();
  }

  @Override
  public void onBackPressed() {
      WebView webView = getBridge().getWebView();
      if (webView.canGoBack()) {
          webView.goBack();
      } else {
          super.onBackPressed(); // Default behavior, which minimizes the app
      }
  }
}
