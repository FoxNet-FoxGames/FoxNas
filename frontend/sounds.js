/**
 * FOXNAS Sound & Event Injector
 */
const FoxSounds = {
    soundsDir: '/sounds/',
    // Liste der bekannten Sound-Events (optional, für schnellere Prüfung)
    events: [
        'LoginSuccess', 'LoginFailure', 'Copy', 'Download', 
        'GeneralError', 'MessageReceived', 'MessageSend', 
        'Paste', 'Upload'
    ],

    init() {
        console.log("FoxSounds: System wird initialisiert...");
        this.hookLogger();
    },

    // Überwacht console.log auf Keywords
    hookLogger() {
        const originalLog = console.log;
        const originalError = console.error;

        // Wir "kapern" console.log
        console.log = (...args) => {
            this.checkAndPlay(args);
            originalLog.apply(console, args);
        };

        // Wir "kapern" console.error für automatischen GeneralError Sound
        console.error = (...args) => {
            this.play('GeneralError');
            originalError.apply(console, args);
        };
    },

    checkAndPlay(args) {
        // Wir prüfen, ob einer der Argumente im Log exakt einem Sound-Event entspricht
        const msg = args[0];
        if (typeof msg === 'string') {
            // Wenn die Nachricht exakt so heißt wie ein Event, abspielen
            if (this.events.includes(msg)) {
                this.play(msg);
            }
        }
    },

    play(soundName) {
        const audio = new Audio(`${this.soundsDir}${soundName}.mp3`);
        audio.volume = 0.4;
        audio.play().catch(() => {
            // Stilles Scheitern, falls Browser Autoplay blockt
        });
    }
};

// Initialisierung
FoxSounds.init();