package io.coinos.hce;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Hce")
public class HcePlugin extends Plugin {

    @PluginMethod
    public void setUrl(PluginCall call) {
        String url = call.getString("url");
        if (url == null || url.isEmpty()) {
            call.reject("URL is required");
            return;
        }
        HceApduService.setUrl(url);
        call.resolve();
    }

    @PluginMethod
    public void getUrl(PluginCall call) {
        JSObject result = new JSObject();
        result.put("url", HceApduService.getUrl());
        call.resolve(result);
    }
}
