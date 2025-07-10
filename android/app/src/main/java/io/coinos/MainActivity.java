package io.coinos;

import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowManager;
import androidx.core.view.ViewCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Parcelable;
import android.webkit.CookieManager;
import android.webkit.WebView;

import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;

import java.nio.charset.Charset;
import java.util.Arrays;

import io.coinos.nfcwriter.NfcWriterPlugin;

public class MainActivity extends BridgeActivity {
    private NfcAdapter nfcAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // ✅ Let Capacitor inflate its layout and wire everything
        super.onCreate(savedInstanceState);
        registerPlugin(NfcWriterPlugin.class);

        WebView webView = bridge.getWebView(); // This works *after* super.onCreate()

        // ✅ Ensure layout respects system bars
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            getWindow().clearFlags(WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS);
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }

        // ✅ Apply top inset padding if needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            webView.setOnApplyWindowInsetsListener((v, insets) -> {
                v.setPadding(0, insets.getSystemWindowInsetTop(), 0, 0);
                return insets.consumeSystemWindowInsets();
            });
        }

        // Other app setup
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);

        handleIntent(getIntent());
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        Uri data = null;

        if (Intent.ACTION_VIEW.equals(action)) {
            data = intent.getData();
        } else if ("android.nfc.action.NDEF_DISCOVERED".equals(action)) {
            Parcelable[] rawMsgs = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
            if (rawMsgs != null && rawMsgs.length > 0) {
                NdefMessage ndefMessage = (NdefMessage) rawMsgs[0];
                for (NdefRecord record : ndefMessage.getRecords()) {
                    if (record.getTnf() == NdefRecord.TNF_WELL_KNOWN &&
                        Arrays.equals(record.getType(), NdefRecord.RTD_URI)) {

                        byte[] payload = record.getPayload();
                        byte prefix = payload[0];
                        String uriPrefix = resolveUriPrefix(prefix);
                        String uriBody = new String(Arrays.copyOfRange(payload, 1, payload.length), Charset.forName("UTF-8"));
                        data = Uri.parse(uriPrefix + uriBody);
                        break;
                    }
                }
            }
        }

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

    private String resolveUriPrefix(byte prefix) {
        switch (prefix) {
            case 0x00: return "";
            case 0x01: return "http://www.";
            case 0x02: return "https://www.";
            case 0x03: return "http://";
            case 0x04: return "https://";
            case 0x05: return "tel:";
            case 0x06: return "mailto:";
            case 0x07: return "ftp://anonymous:anonymous@";
            case 0x08: return "ftp://ftp.";
            case 0x09: return "ftps://";
            case 0x0A: return "sftp://";
            case 0x0B: return "smb://";
            case 0x0C: return "nfs://";
            case 0x0D: return "ftp://";
            case 0x0E: return "dav://";
            case 0x0F: return "news:";
            case 0x10: return "telnet://";
            case 0x11: return "imap:";
            case 0x12: return "rtsp://";
            case 0x13: return "urn:";
            case 0x14: return "pop:";
            case 0x15: return "sip:";
            case 0x16: return "sips:";
            case 0x17: return "tftp:";
            case 0x18: return "btspp://";
            case 0x19: return "btl2cap://";
            case 0x1A: return "btgoep://";
            case 0x1B: return "tcpobex://";
            case 0x1C: return "irdaobex://";
            case 0x1D: return "file://";
            case 0x1E: return "urn:epc:id:";
            case 0x1F: return "urn:epc:tag:";
            case 0x20: return "urn:epc:pat:";
            case 0x21: return "urn:epc:raw:";
            case 0x22: return "urn:epc:";
            case 0x23: return "urn:nfc:";
            default: return "";
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
            super.onBackPressed();
        }
    }
}
