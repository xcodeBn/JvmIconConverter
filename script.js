// Helper function to convert data URL to Blob
function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: contentType });
}

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
function resetImage() {
    imageUpload.value = '';
    imagePreview.src = '';
    previewContainer.style.display = 'none';
    dropZone.style.display = 'block';
    imageSize.textContent = 'Size: Loading...';
    imageFormat.textContent = 'Format: Loading...';
    resultContainer.style.display = 'none';
    progressContainer.style.display = 'none';
}

// Handle convert button click
convertBtn.addEventListener('click', function() {
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

    // Read the image file
    const reader = new FileReader();
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
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

            // Process each platform
            let completed = 0;
            platforms.forEach(platform => {
                switch(platform) {
                    case 'macOS':
                        convertToMacOS(img, customName);
                        break;
                    case 'windows':
                        convertToWindows(img, customName);
                        break;
                    case 'linux':
                        convertToLinux(img, customName);
                        break;
                }
                completed++;
                updateProgress(25 + (completed / platforms.length) * 50, `Processing ${platform}...`);
            });

            // Display results
            setTimeout(() => {
                updateProgress(100, 'Conversion complete!');
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                    displayResults(platforms);
                }, 500);
            }, 1000);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Convert image for macOS
function convertToMacOS(img, customName) {
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
    createICNSFile(convertedImages.macOS.files, iconName);
}

// Convert image for Windows
function convertToWindows(img, customName) {
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
    createICOFile(convertedImages.windows.files, iconName);
}

// Convert image for Linux
function convertToLinux(img, customName) {
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
}

// Display conversion results
function displayResults(platforms) {
    resultContent.innerHTML = '';
    
    platforms.forEach(platform => {
        const platformData = convertedImages[platform];
        if (!platformData) return;
        
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
        
        resultItem.innerHTML = `
            <div>
                <div class="platform-name">${platformName} ${fileExtension}</div>
                <div class="platform-sizes">Sizes: ${platformData.sizes.join(', ')}</div>
                <div class="file-info">
                    <span class="filename">${platformData.files[0].name}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${platformData.files[0].name}')" title="Copy filename">📋</button>
                </div>
            </div>
            <a href="#" class="download-link" onclick="downloadPlatform('${platform}')">Download</a>
        `;
        
        resultContent.appendChild(resultItem);
    });
    
    // Show download all button if multiple platforms selected
    downloadAllBtn.style.display = platforms.length > 1 ? 'block' : 'none';
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
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    // For now, create a ZIP file with the iconset structure
    // In a real implementation, this would create a proper ICNS file
    const zip = new JSZip();

    pngFiles.forEach(file => {
        const data = dataURLToBlob(file.data);
        zip.file(file.name, data);
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
    });
}

// Create ICO file from PNG files
function createICOFile(pngFiles, iconName) {
    // For now, create a ZIP file with all PNG sizes
    // In a real implementation, this would create a proper ICO file
    const zip = new JSZip();

    pngFiles.forEach(file => {
        const data = dataURLToBlob(file.data);
        zip.file(file.name, data);
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
    });
}

// Update progress bar
function updateProgress(percent, text) {
    progressFill.style.width = `${percent}%`;
    progressText.textContent = text;
}

// Handle reset button
resetBtn.addEventListener('click', function() {
    resetImage();
    filenameInput.value = 'app_icon';
    resultContainer.style.display = 'none';
    progressContainer.style.display = 'none';
    document.getElementById('macOS').checked = true;
    document.getElementById('windows').checked = true;
    document.getElementById('linux').checked = true;
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
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅';
        btn.style.background = '#28a745';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    });
}