package com.olcan.ciphertranslator;

import android.graphics.Color;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Exposes the Android 12+ Material You system palette to the web layer.
 * The CSS layer applies these values as Material 3 color-role variables.
 */
@CapacitorPlugin(name = "MaterialYou")
public class MaterialYouPlugin extends Plugin {

    private static final int LIGHT_ERROR = 0xFFB3261E;
    private static final int LIGHT_ON_ERROR = 0xFFFFFFFF;
    private static final int LIGHT_ERROR_CONTAINER = 0xFFF9DEDC;
    private static final int LIGHT_ON_ERROR_CONTAINER = 0xFF410E0B;

    private static final int DARK_ERROR = 0xFFF2B8B5;
    private static final int DARK_ON_ERROR = 0xFF601410;
    private static final int DARK_ERROR_CONTAINER = 0xFF8C1D18;
    private static final int DARK_ON_ERROR_CONTAINER = 0xFFF9DEDC;

    @PluginMethod
    public void getPalette(PluginCall call) {
        JSObject result = new JSObject();
        boolean dynamic = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S;
        result.put("dynamic", dynamic);

        if (dynamic) {
            try {
                result.put("light", buildPalette(true));
                result.put("dark", buildPalette(false));
            } catch (RuntimeException error) {
                result.put("dynamic", false);
            }
        }

        call.resolve(result);
    }

    private JSObject buildPalette(boolean light) {
        // Android's system palette uses 0 = lightest and 1000 = darkest,
        // the inverse of Material's 0..100 tone scale.
        int primaryTone = light ? 40 : 80;
        int onPrimaryTone = light ? 100 : 20;
        int primaryContainerTone = light ? 90 : 30;
        int onPrimaryContainerTone = light ? 10 : 90;

        int surface = tone("neutral1", light ? 99 : 10);
        int onSurface = tone("neutral1", light ? 10 : 90);
        int surfaceVariant = tone("neutral2", light ? 90 : 30);
        int onSurfaceVariant = tone("neutral2", light ? 30 : 80);
        int outline = tone("neutral2", light ? 50 : 60);
        int outlineVariant = tone("neutral2", light ? 80 : 30);
        int inverseSurface = tone("neutral1", light ? 20 : 90);
        int inverseOnSurface = tone("neutral1", light ? 95 : 20);
        int inversePrimary = tone("accent1", light ? 80 : 40);

        int surfaceDim = light
            ? tone("neutral1", 90)
            : blend(surface, color("neutral1_1000"), 0.35);
        int surfaceBright = light
            ? tone("neutral1", 99)
            : blend(surface, color("neutral1_0"), 0.08);
        int surfaceContainerLowest = light
            ? tone("neutral1", 100)
            : blend(surface, color("neutral1_1000"), 0.25);
        int surfaceContainerLow = light
            ? blend(surface, tone("accent1", 40), 0.04)
            : surface;
        int surfaceContainer = light
            ? blend(surface, tone("accent1", 40), 0.06)
            : blend(surface, color("neutral1_0"), 0.04);
        int surfaceContainerHigh = light
            ? blend(surface, tone("accent1", 40), 0.09)
            : blend(surface, color("neutral1_0"), 0.07);
        int surfaceContainerHighest = light
            ? blend(surface, tone("accent1", 40), 0.12)
            : blend(surface, color("neutral1_0"), 0.10);

        JSObject palette = new JSObject();
        palette.put("primary", hex(tone("accent1", primaryTone)));
        palette.put("on-primary", hex(tone("accent1", onPrimaryTone)));
        palette.put("primary-container", hex(tone("accent1", primaryContainerTone)));
        palette.put("on-primary-container", hex(tone("accent1", onPrimaryContainerTone)));

        palette.put("secondary", hex(tone("accent2", primaryTone)));
        palette.put("on-secondary", hex(tone("accent2", onPrimaryTone)));
        palette.put("secondary-container", hex(tone("accent2", primaryContainerTone)));
        palette.put("on-secondary-container", hex(tone("accent2", onPrimaryContainerTone)));

        palette.put("tertiary", hex(tone("accent3", primaryTone)));
        palette.put("on-tertiary", hex(tone("accent3", onPrimaryTone)));
        palette.put("tertiary-container", hex(tone("accent3", primaryContainerTone)));
        palette.put("on-tertiary-container", hex(tone("accent3", onPrimaryContainerTone)));

        palette.put("error", hex(light ? LIGHT_ERROR : DARK_ERROR));
        palette.put("on-error", hex(light ? LIGHT_ON_ERROR : DARK_ON_ERROR));
        palette.put("error-container", hex(light ? LIGHT_ERROR_CONTAINER : DARK_ERROR_CONTAINER));
        palette.put("on-error-container", hex(light ? LIGHT_ON_ERROR_CONTAINER : DARK_ON_ERROR_CONTAINER));

        palette.put("background", hex(surface));
        palette.put("on-background", hex(onSurface));
        palette.put("surface", hex(surface));
        palette.put("on-surface", hex(onSurface));
        palette.put("surface-variant", hex(surfaceVariant));
        palette.put("on-surface-variant", hex(onSurfaceVariant));
        palette.put("outline", hex(outline));
        palette.put("outline-variant", hex(outlineVariant));
        palette.put("inverse-surface", hex(inverseSurface));
        palette.put("inverse-on-surface", hex(inverseOnSurface));
        palette.put("inverse-primary", hex(inversePrimary));
        palette.put("surface-dim", hex(surfaceDim));
        palette.put("surface-bright", hex(surfaceBright));
        palette.put("surface-container-lowest", hex(surfaceContainerLowest));
        palette.put("surface-container-low", hex(surfaceContainerLow));
        palette.put("surface-container", hex(surfaceContainer));
        palette.put("surface-container-high", hex(surfaceContainerHigh));
        palette.put("surface-container-highest", hex(surfaceContainerHighest));
        palette.put("scrim", "#000000");

        return palette;
    }

    private int tone(String palette, int materialTone) {
        int systemTone = 1000 - materialTone * 10;
        return color(palette + "_" + systemTone);
    }

    private int color(String name) {
        int resourceId = getContext()
            .getResources()
            .getIdentifier("system_" + name, "color", "android");

        if (resourceId == 0) {
            throw new IllegalStateException("Missing dynamic color resource: " + name);
        }

        return ContextCompat.getColor(getContext(), resourceId);
    }

    private String hex(int color) {
        return String.format("#%06X", 0xFFFFFF & color);
    }

    private int blend(int base, int overlay, double ratio) {
        double inverse = 1.0 - ratio;
        int red = (int) Math.round(Color.red(base) * inverse + Color.red(overlay) * ratio);
        int green = (int) Math.round(Color.green(base) * inverse + Color.green(overlay) * ratio);
        int blue = (int) Math.round(Color.blue(base) * inverse + Color.blue(overlay) * ratio);
        return Color.rgb(red, green, blue);
    }
}
