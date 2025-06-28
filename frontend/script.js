document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("audioFile");
    const uploadButton = document.getElementById("uploadButton");
    const fileStatus = document.getElementById("fileStatus");
    const transcribedText = document.getElementById("transcribedText");
    const dropArea = document.getElementById("dropArea");

    let enterCount = 0; // Track Enter key presses

    // Handle Enter key press
    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default form submission

            if (enterCount === 0) {
                fileInput.click(); // Open file selection dialog
            } else if (enterCount === 1 && fileInput.files.length > 0) {
                uploadButton.click(); // Click "Upload" button
            }

            enterCount++;
        }
    });

    // Reset enter count when file is selected
    fileInput.addEventListener("change", function () {
        enterCount = 1; // Reset so next Enter click triggers upload
        transcribedText.innerText = "";
        transcribedText.style.display = "none";
    });

    // Upload audio file
    uploadButton.addEventListener("click", async function (event) {
        event.preventDefault();

        const file = fileInput.files[0];

        if (!file) {
            fileStatus.innerText = "Please select an audio file first.";
            return;
        }

        // Clear previous transcription
        transcribedText.innerText = "";
        transcribedText.style.display = "none";

        // Check file size limit
        if (file.size > 10 * 1024 * 1024) {
            fileStatus.innerText = "File is too large. Max size: 10MB.";
            return;
        }

        fileStatus.innerText = "Uploading...";
        const formData = new FormData();
        formData.append("audio", file);

        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://localhost:8000/upload", true);

            // Show upload progress
            xhr.upload.onprogress = function (event) {
                if (event.lengthComputable) {
                    let percentComplete = Math.round((event.loaded / event.total) * 100);
                    fileStatus.innerText = `Uploading... ${percentComplete}%`;
                }
            };

            xhr.onload = function () {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    fileStatus.innerText = "File uploaded successfully!";
                    transcribedText.innerText = data.transcription || "No transcription available";
                    transcribedText.style.display = "block";
                } else {
                    fileStatus.innerText = `Error: ${xhr.statusText}`;
                }
            };

            xhr.onerror = function () {
                fileStatus.innerText = "Error uploading file.";
            };

            xhr.send(formData);
        } catch (error) {
            console.error("Error:", error);
            fileStatus.innerText = "Error uploading file.";
        }
    });

    // Drag & Drop Support
    dropArea.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropArea.classList.add("dragging");
    });

    dropArea.addEventListener("dragleave", function () {
        dropArea.classList.remove("dragging");
    });

    dropArea.addEventListener("drop", function (event) {
        event.preventDefault();
        dropArea.classList.remove("dragging");

        fileInput.files = event.dataTransfer.files;

        // Reset enter count so pressing Enter uploads
        enterCount = 1;
        
        transcribedText.innerText = "";
        transcribedText.style.display = "none";
        fileStatus.innerText = "File selected. Click Upload.";
    });

    // Click on drop area to open file dialog
    dropArea.addEventListener("click", function () {
        fileInput.click();
    });
});