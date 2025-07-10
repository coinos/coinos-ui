// src/android/NfcWriterPlugin.java
package io.coinos.nfcwriter;

import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.nfc.NfcAdapter.ReaderCallback;
import android.os.Bundle;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NfcWriter")
public class NfcWriterPlugin extends Plugin {
  private NfcAdapter nfcAdapter;

  @Override
  public void load() {
    super.load();
    nfcAdapter = NfcAdapter.getDefaultAdapter(getContext());
  }

  @PluginMethod
  public void enableExclusiveNfcMode(PluginCall call) {
    if (nfcAdapter == null) {
      call.reject("NFC adapter not available");
      return;
    }

    nfcAdapter.enableReaderMode(
      getActivity(),
      new ReaderCallback() {
        @Override
        public void onTagDiscovered(Tag tag) {
          Log.d("NfcWriter", "Tag discovered");
          bridge.getWebView().post(() -> {
            bridge.getWebView().evaluateJavascript(
              "window.dispatchEvent(new CustomEvent('nativeNfcTagDiscovered'))",
              null
            );
          });
        }
      },
      NfcAdapter.FLAG_READER_NFC_A |
      NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK |
      NfcAdapter.FLAG_READER_NO_PLATFORM_SOUNDS,
      null
    );

    call.resolve();
  }

  @PluginMethod
  public void disableExclusiveNfcMode(PluginCall call) {
    if (nfcAdapter != null) {
      nfcAdapter.disableReaderMode(getActivity());
    }
    call.resolve();
  }
}
