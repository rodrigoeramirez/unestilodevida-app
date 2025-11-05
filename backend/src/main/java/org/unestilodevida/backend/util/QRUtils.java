package org.unestilodevida.backend.util;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.Path;
import java.util.Base64;

public class QRUtils {

    // Genera QR y devuelve como bytes
    public static byte[] generarQR(String texto, int ancho, int alto) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(texto, BarcodeFormat.QR_CODE, ancho, alto);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);

        return pngOutputStream.toByteArray();
    }

    // Genera QR y devuelve como String Base64 para mostrar en frontend
    public static String generarQRBase64(String texto, int ancho, int alto) throws WriterException, IOException {
        byte[] bytes = generarQR(texto, ancho, alto);
        return Base64.getEncoder().encodeToString(bytes);
    }
}
