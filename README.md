# 🦊 FoxNas v1.0 – Personal Cloud Storage

**FoxNas** ist ein leichtgewichtiges, webbasiertes NAS-System (Network Attached Storage) von **FoxNet**. Es kombiniert High-End-Design mit Funktionalität für **Streaming** und **Entwicklung**.

---

## ⚖️ Lizenz & Rechte

Dieses Projekt ist Eigentum von **FoxNet**. Alle Rechte liegen bei **FoxNet**.

* **Nutzung:** Die private Nutzung auf eigenen Servern sowie die öffentliche Nutzung als NAS-System ist gestattet.
* **Öffentliche Nutzung:** Bei öffentlicher Nutzung ist eine **Namensnennung zwingend erforderlich**. Ein Footer mit dem Hinweis

  > *"FoxNas powered by FoxNet"*

  muss gut sichtbar eingebunden sein.
* **Contribution:** Commits, Pull Requests und aktives Mitprogrammieren am Repository sind ausdrücklich erwünscht!

---

## ✨ Aktuelle Features (v1.0)

* **Neon UI**
  Voller Fokus auf Neon-Ästhetik (`#00f2ff` & `#ff0055`).

* **Smart Streaming**
  Dedizierte Player für Video, Audio und Bilder.

* **FoxNas IDE**
  Texteditor mit Syntax-Highlighting und Live-Preview.

* **Portable**
  Einfach in das Root-Verzeichnis eines externen Gehäuses kopieren und starten.

---

## 🔐 Login (Standard)

```text
User:     admin
Passwort: fox
```

---

## 🗺 Roadmap

### 📽 1. VideoStream Evolution

* **1.01** – Interaktive Zeitleiste (Click-to-Seek) mit Thumbnail-Vorschau und Zeitanzeige beim Hovern.
* **1.02** – Temporäre Einblendung der Gesamtzeit bei Zeitssprüngen (Vor/Zurück).

---

### ✍️ 2. Editor Upgrades

* **2.01** – Noch keine weiteren Pläne.

---

### 🖥 3. FoxNas

* **3.01** – View-Fix (Optimierung der Ansichtslogik).

* **3.02** – Multi-Storage Support
  Kommunikation zwischen Hauptserver und externen Gehäusen für die Auswahl mehrerer Festplatten.

* **3.07** – Uploading
  Das man auch sieht was gerade hochläd, wielange noch und wanns fertig ist.

* **3.08** – Admin-Konsole
  Live-Output von Datei-Aktionen (Upload/Download/IPs) und Chat-Integration in der Serverkonsole.

* **3.09** – Virtual Desktop
  Ein komplettes virtuelles OS im FoxNas-Design.

  * Wählbarer Hintergrund & Schnellzugriffe
  * Startmenü mit Power-Features & Abmeldung
  * Globale Suche und verschiebbare Fenster (Explorer-Fenster)

* **3.11** – Deep Permissions
  Granulare Rechte (Lesen/Schreiben/Ändern). Umstellung auf user-basierte `config.json` unter:

  ```text
  /users/%username%
  ```

* **3.12** – Background Music
  Globaler Audio-Player im Footer. Automatischer Pause-Modus bei Video-Start.

* **3.13** – UI-Glitch-Personalisierung
  Ein-/Ausschaltbar pro User.

* **3.14** – Permissions
  Die Permissions funktionabel machen.

---

## 🚀 Installation

1. Inhalt in das Root-Verzeichnis deines Datenträgers kopieren.
2. npm install 
3. Server ausführen **start.bat** (zeigt beim Start die IP-Adresse für den Netzwerkzugriff an).
4. Einloggen und loslegen.

---

© **FoxNet** – FoxNas
