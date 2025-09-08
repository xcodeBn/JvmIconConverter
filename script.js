// Helper function to convert data URL to Blob
function dataURLToBlob(dataURL) {
    try {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);

        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return new Blob([ab], { type: contentType });
    } catch (error) {
        console.error('Error converting data URL to blob:', error);
        return null;
    }
}

// Debug: Check if scripts loaded
console.log('🚀 Multiplatform Icon Converter loaded successfully');
console.log('📋 Secure context:', window.isSecureContext);
console.log('🔗 Protocol:', window.location.protocol);
console.log('📦 JSZip available:', typeof JSZip !== 'undefined');
console.log('💾 FileSaver available:', typeof saveAs !== 'undefined');

// Simple functionality test
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded, testing basic functionality...');

    // Test if basic elements exist
    const convertBtn = document.getElementById('convertBtn');
    const imageUpload = document.getElementById('imageUpload');
    const resultContainerTest = document.getElementById('resultContainer');
    const resultContentTest = document.getElementById('resultContent');

    console.log('🔍 Element check:');
    console.log('  - convertBtn:', convertBtn ? '✅ Found' : '❌ Missing');
    console.log('  - imageUpload:', imageUpload ? '✅ Found' : '❌ Missing');
    console.log('  - resultContainer:', resultContainerTest ? '✅ Found' : '❌ Missing');
    console.log('  - resultContent:', resultContentTest ? '✅ Found' : '❌ Missing');

    if (convertBtn && imageUpload && resultContainerTest && resultContentTest) {
        console.log('✅ All basic elements found');
    } else {
        console.error('❌ Some basic elements missing');
    }
});

// Platform-specific icon sizes
const MACOS_SIZES = [16, 32, 64, 128, 256, 512, 1024];
const WINDOWS_SIZES = [16, 24, 32, 48, 64, 128, 256];
const LINUX_SIZES = [256];

// DOM elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewContainer = document.getElementById('previewContainer');
const dropZone = document.getElementById('dropZone');
const convertBtn = document.getElementById('convertBtn');
const resetBtn = document.getElementById('resetBtn');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const filenameInput = document.getElementById('filenameInput');
const progressContainer = document.getElementById('progressContainer');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const imageSize = document.getElementById('imageSize');
const imageFormat = document.getElementById('imageFormat');
const removeImage = document.getElementById('removeImage');

// Store converted images
let convertedImages = {};

// Handle image upload and preview
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
});

// Drag and drop functionality
dropZone.addEventListener('click', function() {
    imageUpload.click();
});

dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateImageFile(file)) {
            imageUpload.files = files;
            handleImageFile(file);
        }
    }
});

// Handle image file processing
function handleImageFile(file) {
    if (!validateImageFile(file)) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        previewContainer.style.display = 'block';
        dropZone.style.display = 'none';

        // Update image info
        updateImageInfo(file);
    };
    reader.readAsDataURL(file);
}

// Validate image file
function validateImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('File size must be less than 10MB');
        return false;
    }

    return true;
}

// Update image information display
function updateImageInfo(file) {
    const format = file.type.split('/')[1].toUpperCase();
    const sizeKB = Math.round(file.size / 1024);
    const sizeText = sizeKB > 1024 ? `${Math.round(sizeKB / 1024 * 10) / 10} MB` : `${sizeKB} KB`;

    imageFormat.textContent = `Format: ${format}`;
    imageSize.textContent = `Size: ${sizeText}`;
}

// Remove image functionality
removeImage.addEventListener('click', function() {
    resetImage();
});

// Reset image
function resetImage(preserveResults = false) {
    imageUpload.value = '';
    imagePreview.src = '';
    previewContainer.style.display = 'none';
    dropZone.style.display = 'block';
    imageSize.textContent = 'Size: Loading...';
    imageFormat.textContent = 'Format: Loading...';
    
    if (!preserveResults) {
        resultContainer.style.display = 'none';
        resultContainer.classList.remove('persistent');
        convertedImages = {}; // Clear stored images
    }
    
    progressContainer.style.display = 'none';
}

// Handle convert button click
convertBtn.addEventListener('click', async function() {
    const file = imageUpload.files[0];
    if (!file) {
        alert('Please select an image first');
        return;
    }

    // Get custom filename
    const customName = filenameInput.value.trim() || 'app_icon';

    // Reset converted images
    convertedImages = {};

    // Show progress
    progressContainer.style.display = 'block';
    updateProgress(0, 'Starting conversion...');

    try {
        // Read the image file
        const img = await loadImage(file);
        updateProgress(10, 'Image loaded, processing...');

        // Convert for selected platforms
        const platforms = [];
        if (document.getElementById('macOS').checked) platforms.push('macOS');
        if (document.getElementById('windows').checked) platforms.push('windows');
        if (document.getElementById('linux').checked) platforms.push('linux');

        if (platforms.length === 0) {
            resultContent.innerHTML = '<div class="status-message status-error">Please select at least one platform</div>';
            progressContainer.style.display = 'none';
            return;
        }

        updateProgress(25, 'Processing platforms...');

        // Process each platform asynchronously
        const conversionPromises = platforms.map(async (platform, index) => {
            updateProgress(25 + (index / platforms.length) * 50, `Processing ${platform}...`);

            switch(platform) {
                case 'macOS':
                    await convertToMacOS(img, customName);
                    break;
                case 'windows':
                    await convertToWindows(img, customName);
                    break;
                case 'linux':
                    await convertToLinux(img, customName);
                    break;
            }
        });

        // Wait for all conversions to complete
        await Promise.all(conversionPromises);

        // Display results
        updateProgress(100, 'Conversion complete!');
        setTimeout(() => {
            progressContainer.style.display = 'none';
            displayResults(platforms);
            // Ensure results container stays visible
            resultContainer.style.display = 'block';
            resultContainer.style.visibility = 'visible';
            resultContainer.style.opacity = '1';
        }, 500);

    } catch (error) {
        console.error('Conversion failed:', error);
        resultContent.innerHTML = '<div class="status-message status-error">Conversion failed. Please try again.</div>';
        progressContainer.style.display = 'none';
    }
});

// Helper function to load image
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Convert image for macOS
async function convertToMacOS(img, customName) {
    const iconName = customName || imageUpload.files[0].name.split('.')[0];
    const sizes = MACOS_SIZES;

    convertedImages.macOS = {
        name: iconName,
        sizes: sizes,
        files: []
    };

    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const dataURL = canvas.toDataURL('image/png');
        convertedImages.macOS.files.push({
            name: `${iconName}_${size}x${size}.png`,
            data: dataURL,
            size: size
        });
    });

    // Create ICNS file from PNG files
    await createICNSFile(convertedImages.macOS.files, iconName);
}

// Convert image for Windows
async function convertToWindows(img, customName) {
    const iconName = customName || imageUpload.files[0].name.split('.')[0];
    const sizes = WINDOWS_SIZES;

    convertedImages.windows = {
        name: iconName,
        sizes: sizes,
        files: []
    };

    sizes.forEach(size => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const dataURL = canvas.toDataURL('image/png');
        convertedImages.windows.files.push({
            name: `${iconName}_${size}x${size}.png`,
            data: dataURL,
            size: size
        });
    });

    // Create ICO file from PNG files
    await createICOFile(convertedImages.windows.files, iconName);
}

// Convert image for Linux
async function convertToLinux(img, customName) {
    const iconName = customName || imageUpload.files[0].name.split('.')[0];
    const size = LINUX_SIZES[0];

    convertedImages.linux = {
        name: iconName,
        sizes: [size],
        files: []
    };

    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, size, size);

    const dataURL = canvas.toDataURL('image/png');
    convertedImages.linux.files.push({
        name: `${iconName}.png`,
        data: dataURL,
        size: size
    });

    // Linux doesn't need async file creation, so we return a resolved promise
    return Promise.resolve();
}

// Display conversion results
function displayResults(platforms) {
    console.log('🎯 Displaying results for platforms:', platforms);
    console.log('📦 Converted images:', convertedImages);
    console.log('🎨 Result container element:', resultContainer);
    console.log('📝 Result content element:', resultContent);

    if (!resultContainer) {
        console.error('❌ resultContainer element not found!');
        return;
    }

    if (!resultContent) {
        console.error('❌ resultContent element not found!');
        return;
    }

    resultContent.innerHTML = '';
    resultContainer.style.display = 'block';
    resultContainer.style.visibility = 'visible';
    resultContainer.style.opacity = '1';
    resultContainer.classList.add('persistent');
    // Force a reflow to ensure styles are applied
    resultContainer.offsetHeight;
    console.log('✅ Set resultContainer display to block');
    console.log('🎨 Result container computed style:', window.getComputedStyle(resultContainer).display);
    console.log('👁️ Result container visibility:', window.getComputedStyle(resultContainer).visibility);
    
    // Set up a MutationObserver to detect if something is trying to hide the results
    if (window.resultObserver) {
        window.resultObserver.disconnect();
    }
    window.resultObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const display = resultContainer.style.display;
                if (display === 'none') {
                    console.warn('⚠️ Something tried to hide the results container! Restoring visibility.');
                    resultContainer.style.display = 'block';
                    resultContainer.style.visibility = 'visible';
                    resultContainer.style.opacity = '1';
                }
            }
        });
    });
    window.resultObserver.observe(resultContainer, { attributes: true, attributeFilter: ['style'] });

    platforms.forEach(platform => {
        const platformData = convertedImages[platform];
        console.log(`🔍 Platform ${platform} data:`, platformData);

        if (!platformData || !platformData.files || platformData.files.length === 0) {
            console.error(`❌ No files found for platform ${platform}`);
            return;
        }

        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';

        let platformName = '';
        let fileExtension = '';
        switch(platform) {
            case 'macOS':
                platformName = 'macOS';
                fileExtension = '.icns';
                break;
            case 'windows':
                platformName = 'Windows';
                fileExtension = '.ico';
                break;
            case 'linux':
                platformName = 'Linux';
                fileExtension = '.png';
                break;
        }

        const file = platformData.files[0];
        console.log(`📄 File for ${platform}:`, file);

        resultItem.innerHTML = `
            <div>
                <div class="platform-name">${platformName} ${fileExtension}</div>
                <div class="platform-sizes">Sizes: ${platformData.sizes.join(', ')}</div>
                <div class="file-info">
                    <span class="filename">${file.name}</span>
                </div>
            </div>
            <a href="#" class="download-link" onclick="downloadPlatform('${platform}')">Download</a>
        `;

        resultContent.appendChild(resultItem);
    });

    // Show download all button if multiple platforms selected
    downloadAllBtn.style.display = platforms.length > 1 ? 'block' : 'none';

    console.log('✅ Results displayed successfully');
}

// Download files for a specific platform
function downloadPlatform(platform) {
    const platformData = convertedImages[platform];
    if (!platformData) return;

    if (platformData.files.length === 1) {
        // Single file download (ICNS, ICO, or PNG)
        const file = platformData.files[0];
        downloadFile(file.data, file.name);
    } else {
        // Multiple files - create ZIP (fallback for PNG files)
        createZip(platformData.files, `${platformData.name}_${platform}.zip`);
    }
}

// Download a single file
function downloadFile(dataURL, filename) {
    try {
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);

        // Trigger download
        link.click();

        // Clean up
        document.body.removeChild(link);

        console.log('✅ File download initiated:', filename);
    } catch (error) {
        console.error('❌ Download failed:', error);
        alert('Download failed. Please try again or check the browser console for details.');
    }
}

// Create and download ZIP file
function createZip(files, zipFilename) {
    const zip = new JSZip();
    
    files.forEach(file => {
        // Convert data URL to binary data
        const data = dataURLToBlob(file.data);
        zip.file(file.name, data);
    });
    
    // Generate and download the ZIP file
    zip.generateAsync({type:"blob"}).then(function(content) {
        downloadFile(URL.createObjectURL(content), zipFilename);
    });
}

// Download all selected platforms
downloadAllBtn.addEventListener('click', function() {
    const platforms = [];
    if (convertedImages.macOS) platforms.push('macOS');
    if (convertedImages.windows) platforms.push('windows');
    if (convertedImages.linux) platforms.push('linux');
    
    if (platforms.length === 0) return;
    
    // Create a ZIP with all platform folders
    const zip = new JSZip();
    const iconName = filenameInput.value.trim() || imageUpload.files[0].name.split('.')[0] || 'icon';
    
    platforms.forEach(platform => {
        const platformData = convertedImages[platform];
        if (!platformData) return;
        
        // Create a folder for each platform
        const platformFolder = zip.folder(platform);
        
        platformData.files.forEach(file => {
            const data = dataURLToBlob(file.data);
            platformFolder.file(file.name, data);
        });
    });
    
    // Generate and download the ZIP file
    zip.generateAsync({type:"blob"}).then(function(content) {
        downloadFile(URL.createObjectURL(content), `${iconName}_all_icons.zip`);
    });
});

// Create ICNS file from PNG files
function createICNSFile(pngFiles, iconName) {
    return new Promise((resolve) => {
        // For now, create a ZIP file with the iconset structure
        // In a real implementation, this would create a proper ICNS file
        const zip = new JSZip();

        pngFiles.forEach(file => {
            const data = dataURLToBlob(file.data);
            if (data) {
                zip.file(file.name, data);
            }
        });

        zip.generateAsync({type:"blob"}).then(function(content) {
            const icnsBlob = new Blob([content], {type: 'application/octet-stream'});
            const icnsURL = URL.createObjectURL(icnsBlob);

            // Replace the PNG files with the ICNS file
            convertedImages.macOS.files = [{
                name: `${iconName}.icns`,
                data: icnsURL,
                size: 'ICNS'
            }];
            resolve();
        }).catch(function(error) {
            console.error('Error creating ICNS file:', error);
            // Fallback: keep PNG files
            resolve();
        });
    });
}

// Create ICO file from PNG files
function createICOFile(pngFiles, iconName) {
    return new Promise((resolve) => {
        // For now, create a ZIP file with all PNG sizes
        // In a real implementation, this would create a proper ICO file
        const zip = new JSZip();

        pngFiles.forEach(file => {
            const data = dataURLToBlob(file.data);
            if (data) {
                zip.file(file.name, data);
            }
        });

        zip.generateAsync({type:"blob"}).then(function(content) {
            const icoBlob = new Blob([content], {type: 'application/octet-stream'});
            const icoURL = URL.createObjectURL(icoBlob);

            // Replace the PNG files with the ICO file
            convertedImages.windows.files = [{
                name: `${iconName}.ico`,
                data: icoURL,
                size: 'ICO'
            }];
            resolve();
        }).catch(function(error) {
            console.error('Error creating ICO file:', error);
            // Fallback: keep PNG files
            resolve();
        });
    });
}

// Update progress bar
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
}

// Handle reset button
resetBtn.addEventListener('click', function() {
    // Ask user if they want to keep the results
    if (resultContainer.style.display === 'block' && Object.keys(convertedImages).length > 0) {
        const keepResults = confirm('Do you want to keep the conversion results visible?');
        if (keepResults) {
            // Only reset the image input, not the results
            resetImage(true); // true = preserve results
            return;
        }
    }
    
    // Full reset
    resetImage(false); // false = clear everything
    filenameInput.value = 'app_icon';
    resultContainer.style.display = 'none';
    resultContainer.classList.remove('persistent');
    progressContainer.style.display = 'none';
    document.getElementById('macOS').checked = true;
    document.getElementById('windows').checked = true;
    document.getElementById('linux').checked = true;
    
    // Disconnect the observer when resetting
    if (window.resultObserver) {
        window.resultObserver.disconnect();
    }
});



// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        convertBtn.click();
    }

    // Escape to reset
    if (e.key === 'Escape') {
        resetBtn.click();
    }

    // Ctrl/Cmd + R to reset (prevent browser refresh)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        resetBtn.click();
    }
});

// Copy to clipboard functionality


function showCopySuccess() {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✅';
    btn.style.background = '#28a745';
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 1000);
}

function fallbackCopy(text) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        if (successful) {
            showCopySuccess();
        } else {
            alert('Copy failed. Please manually copy: ' + text);
        }

        document.body.removeChild(textArea);
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Copy failed. Please manually copy: ' + text);
    }
}