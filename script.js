// Speech-to-Text Pad Application

// Initialize speech recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Configure speech recognition settings
recognition.continuous = true;
recognition.interimResults = true;

// Array to store saved notes, loaded from localStorage
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Handle window load to initialize notes from storage
window.onload = function () {
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = storedNotes;
    updateNotesDisplay();
};

// Get references to DOM elements
const transcriptTextarea = document.getElementById('transcript');
const charCounterElement = document.getElementById('char-counter');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const saveBtn = document.getElementById('save-btn');
const notesListElement = document.getElementById('notes-list');

// Update character counter when user types in textarea
transcriptTextarea.oninput = function () {
    charCounterElement.textContent = `Characters: ${transcriptTextarea.value.length}`;
};

// Handle speech recognition start event
recognition.onstart = function () {
    startBtn.textContent = 'Start Listening (● Listening)';
    startBtn.classList.add('listening');
};

// Handle speech recognition end event
recognition.onend = function () {
    startBtn.textContent = 'Start Listening';
    startBtn.classList.remove('listening');
};

// Start speech recognition when start button is clicked
startBtn.onclick = function () {
    recognition.start();
};

// Stop speech recognition when stop button is clicked
stopBtn.onclick = function () {
    recognition.stop();
};

// Process speech recognition results
recognition.onresult = function (event) {
    let transcribedText = '';
    // Combine all recognized text parts
    for (let i = 0; i < event.results.length; i++) {
        transcribedText += event.results[i][0].transcript;
    }
    transcriptTextarea.value = transcribedText;
    charCounterElement.textContent = `Characters: ${transcriptTextarea.value.length}`;
};

// Save current note when save button is clicked
saveBtn.onclick = function () {
    const noteText = transcriptTextarea.value.trim();
    if (noteText) {
        notes.push(noteText);
        // Clear textarea and reset counter
        transcriptTextarea.value = '';
        charCounterElement.textContent = 'Characters: 0';
        // Update display and save to localStorage
        updateNotesDisplay();
    }
};

// Function to download a note as a text file
function downloadNote(text) {
    // Create a timestamped filename
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    // Create blob with the note text
    const blob = new Blob([text], { type: 'text/plain' });
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `note-${timestamp}.txt`;
    downloadLink.style.display = 'none';
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    // Clean up
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(downloadLink.href);
}

// Update the saved notes display and save to localStorage
function updateNotesDisplay() {
    // Save notes to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
    // Clear the existing notes list
    notesListElement.innerHTML = '';

    // Create list items for each note
    notes.forEach(function (note, index) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="note-item">
                <div class="note-content">
                    <span class="note-dot"></span>
                    <span class="note-text">${note}</span>
                </div>
                <div class="note-actions">
                    <button class="download-btn">Download</button>
                    <button class="delete-btn">×</button>
                </div>
            </div>
        `;

        // Add event listener for download button
        listItem.querySelector('.download-btn').addEventListener('click', function () {
            downloadNote(note);
        });

        // Add event listener for delete button
        listItem.querySelector('.delete-btn').addEventListener('click', function () {
            notes.splice(index, 1);
            updateNotesDisplay();
        });

        // Append the note item to the list
        notesListElement.appendChild(listItem);
    });
}
