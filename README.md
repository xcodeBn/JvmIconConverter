# Multiplatform Icon Converter

A web-based tool to convert your application icons to the required formats for Compose Multiplatform applications on different platforms.

## Overview

This tool helps you convert a single high-resolution image (preferably 1024x1024 or higher) into the platform-specific icon formats required by Compose Multiplatform applications:

- macOS: `.icns` format
- Windows: `.ico` format
- Linux: `.png` format

## Features

- Convert a single image to multiple icon sizes for different platforms
- Download individual platform icons as PNG files
- Download all icons for selected platforms in a single ZIP file
- Clean, responsive user interface that works on both desktop and mobile devices

## How to Use

1. Select an image file using the "Select Image" button
2. Choose which platforms you want to generate icons for (macOS, Windows, Linux)
3. Click "Convert Icons" to generate the platform-specific icon sizes
4. Download individual platform icons or all icons at once using the "Download All" button

## Platform-Specific Details

### macOS (.icns)
Generates a single .icns file containing all required sizes: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024

### Windows (.ico)
Generates a single .ico file containing all required sizes: 16x16, 24x24, 32x32, 48x48, 64x64, 128x128, 256x256

### Linux (.png)
Generates a single 256x256 PNG file which is the standard size for Linux application icons.

## Using Icons in Your Compose Multiplatform Project

After generating the icons, you can use them in your Compose Multiplatform project by configuring your `build.gradle.kts`:

```kotlin
compose.desktop {
    application {
        nativeDistributions {
            macOS {
                iconFile.set(project.file("src/jvmMain/resources/icon.icns"))
            }
            windows {
                iconFile.set(project.file("src/jvmMain/resources/icon.ico"))
            }
            linux {
                iconFile.set(project.file("src/jvmMain/resources/icon.png"))
            }
        }
    }
}
```

## Technical Implementation

This webapp is built with:
- HTML5 for the structure
- CSS3 for styling
- JavaScript for image processing
- JSZip library for ZIP file creation

The image processing is done entirely in the browser using the Canvas API, so no server-side processing is required.

## Troubleshooting

If you encounter issues with the webapp (especially after deployment), check out the [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide for common solutions.

## License

MIT License