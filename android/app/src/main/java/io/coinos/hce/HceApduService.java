package io.coinos.hce;

import android.nfc.cardemulation.HostApduService;
import android.os.Bundle;
import android.util.Log;

import java.util.Arrays;

/**
 * Emulates an NFC Forum Type 4 Tag containing an NDEF URL record.
 * When a powered NFC reader (or another phone) taps this device,
 * it reads the NDEF message and can open the URL.
 */
public class HceApduService extends HostApduService {
    private static final String TAG = "HceApduService";

    // NDEF Tag Application AID
    private static final byte[] NDEF_AID = hexToBytes("D2760000850101");

    // File IDs
    private static final byte[] CC_FILE_ID = new byte[]{(byte) 0xE1, 0x03};
    private static final byte[] NDEF_FILE_ID = new byte[]{(byte) 0xE1, 0x04};

    // APDU command classes
    private static final byte SELECT_INS = (byte) 0xA4;
    private static final byte READ_BINARY_INS = (byte) 0xB0;

    // Status words
    private static final byte[] SW_OK = new byte[]{(byte) 0x90, 0x00};
    private static final byte[] SW_NOT_FOUND = new byte[]{(byte) 0x6A, (byte) 0x82};
    private static final byte[] SW_FUNC_NOT_SUPPORTED = new byte[]{(byte) 0x6A, (byte) 0x81};

    // Capability Container (15 bytes, read-only tag with 2048-byte NDEF file)
    private static final byte[] CC_FILE = new byte[]{
            0x00, 0x0F,       // CC length
            0x20,             // Mapping version 2.0
            0x00, (byte) 0xF6, // Max R-APDU size (246)
            0x00, 0x00,       // Max C-APDU size (0 = no write)
            0x04, 0x06,       // NDEF File Control TLV (type=4, length=6)
            (byte) 0xE1, 0x04, // NDEF file ID
            0x08, 0x00,       // Max NDEF file size (2048)
            0x00,             // Read access: open
            (byte) 0xFF      // Write access: denied
    };

    private static String currentUrl = "https://coinos.io";

    private enum SelectedFile { NONE, CC, NDEF }
    private SelectedFile selectedFile = SelectedFile.NONE;

    public static void setUrl(String url) {
        currentUrl = url;
        Log.d(TAG, "HCE URL set to: " + url);
    }

    public static String getUrl() {
        return currentUrl;
    }

    @Override
    public byte[] processCommandApdu(byte[] apdu, Bundle extras) {
        if (apdu == null || apdu.length < 4) {
            return SW_FUNC_NOT_SUPPORTED;
        }

        byte ins = apdu[1];

        if (ins == SELECT_INS) {
            return handleSelect(apdu);
        } else if (ins == READ_BINARY_INS) {
            return handleReadBinary(apdu);
        }

        return SW_FUNC_NOT_SUPPORTED;
    }

    private byte[] handleSelect(byte[] apdu) {
        byte p1 = apdu[2];

        // SELECT by AID (P1=0x04)
        if (p1 == 0x04) {
            if (apdu.length >= 12) {
                byte[] aid = Arrays.copyOfRange(apdu, 5, 5 + (apdu[4] & 0xFF));
                if (Arrays.equals(aid, NDEF_AID)) {
                    selectedFile = SelectedFile.NONE;
                    Log.d(TAG, "NDEF application selected");
                    return SW_OK;
                }
            }
            return SW_NOT_FOUND;
        }

        // SELECT by File ID (P1=0x00)
        if (p1 == 0x00 && apdu.length >= 7) {
            byte[] fileId = Arrays.copyOfRange(apdu, 5, 7);
            if (Arrays.equals(fileId, CC_FILE_ID)) {
                selectedFile = SelectedFile.CC;
                Log.d(TAG, "CC file selected");
                return SW_OK;
            } else if (Arrays.equals(fileId, NDEF_FILE_ID)) {
                selectedFile = SelectedFile.NDEF;
                Log.d(TAG, "NDEF file selected");
                return SW_OK;
            }
            return SW_NOT_FOUND;
        }

        return SW_FUNC_NOT_SUPPORTED;
    }

    private byte[] handleReadBinary(byte[] apdu) {
        int offset = ((apdu[2] & 0xFF) << 8) | (apdu[3] & 0xFF);
        int length = apdu[4] & 0xFF;

        byte[] fileData;
        switch (selectedFile) {
            case CC:
                fileData = CC_FILE;
                break;
            case NDEF:
                fileData = buildNdefFile();
                break;
            default:
                return SW_NOT_FOUND;
        }

        if (offset >= fileData.length) {
            return SW_NOT_FOUND;
        }

        int available = fileData.length - offset;
        int readLen = Math.min(length, available);
        byte[] response = new byte[readLen + 2];
        System.arraycopy(fileData, offset, response, 0, readLen);
        response[readLen] = (byte) 0x90;
        response[readLen + 1] = 0x00;
        return response;
    }

    private byte[] buildNdefFile() {
        byte[] ndefMessage = buildNdefUrlRecord(currentUrl);
        // NDEF file = 2-byte length prefix + NDEF message
        byte[] file = new byte[2 + ndefMessage.length];
        file[0] = (byte) ((ndefMessage.length >> 8) & 0xFF);
        file[1] = (byte) (ndefMessage.length & 0xFF);
        System.arraycopy(ndefMessage, 0, file, 2, ndefMessage.length);
        return file;
    }

    private byte[] buildNdefUrlRecord(String url) {
        // Determine URI prefix code
        byte prefixCode = 0x00;
        String payload = url;

        String[][] prefixes = {
                {"https://www.", "\u0002"},
                {"http://www.", "\u0001"},
                {"https://", "\u0004"},
                {"http://", "\u0003"},
        };

        for (String[] p : prefixes) {
            if (url.startsWith(p[0])) {
                prefixCode = (byte) p[1].charAt(0);
                payload = url.substring(p[0].length());
                break;
            }
        }

        byte[] payloadBytes = payload.getBytes();
        int payloadLen = 1 + payloadBytes.length; // prefix code + URI body

        // Short record format NDEF message
        // Flags: MB=1, ME=1, SR=1, TNF=0x01 (Well-Known) = 0xD1
        byte[] record = new byte[4 + payloadLen];
        record[0] = (byte) 0xD1;           // MB|ME|SR|TNF=Well-Known
        record[1] = 0x01;                   // Type length (1 byte for "U")
        record[2] = (byte) payloadLen;       // Payload length
        record[3] = 0x55;                    // Type: "U" (URI)
        record[4] = prefixCode;              // URI prefix code
        System.arraycopy(payloadBytes, 0, record, 5, payloadBytes.length);

        return record;
    }

    @Override
    public void onDeactivated(int reason) {
        Log.d(TAG, "HCE deactivated: " + reason);
        selectedFile = SelectedFile.NONE;
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}
