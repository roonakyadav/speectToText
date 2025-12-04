// commit 1
// getting the speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// load notes on page load
window.onload = () => {
    const stored = JSON.parse(localStorage.getItem('notes')) || [];
    console.log('Loaded notes from localStorage:', stored);
    notes = stored;
    updateNotes();
};

// setting up recognition
recognition.continuous = true;
recognition.interimResults = true;

// getting elements
const transcript = document.getElementById('transcript');
const charCounter = document.getElementById('char-counter');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const saveBtn = document.getElementById('save-btn');
const notesList = document.getElementById('notes-list');

// array for notes
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// character counter update
transcript.oninput = () => {
    charCounter.textContent = `Characters: ${transcript.value.length}`;
};

// mic status
recognition.onstart = () => {
    startBtn.textContent = 'Start Listening (● Listening)';
    startBtn.classList.add('listening');
};

recognition.onend = () => {
    startBtn.textContent = 'Start Listening';
    startBtn.classList.remove('listening');
};

// starting recognition
startBtn.onclick = () => {
    recognition.start();
};

// stopping recognition
stopBtn.onclick = () => {
    recognition.stop();
};

// handling results
recognition.onresult = (event) => {
    // putting text in textarea
    let text = '';
    for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
    }
    transcript.value = text;
    charCounter.textContent = `Characters: ${transcript.value.length}`;
};

// saving note
saveBtn.onclick = () => {
    if (transcript.value.trim()) {
        notes.push(transcript.value.trim());
        transcript.value = '';
        charCounter.textContent = 'Characters: 0';
        updateNotes();
    }
};

// download note function
function downloadNote(text, index) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `note-${timestamp}.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

// updating notes list
function updateNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
    notesList.innerHTML = '';
    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="note-item">
                <div class="note-content">
                    <span class="note-dot"></span>
                    <span class="note-text">${note}</span>
                </div>
                <div class="note-actions">
                    <button class="download-btn" onclick="downloadNote('${note.replace(/'/g, "\\'")}', ${index})">Download</button>
                    <button class="delete-btn" onclick="notes.splice(${index}, 1); updateNotes();">×</button>
                </div>
            </div>
        `;
        notesList.appendChild(li);
    });
}
