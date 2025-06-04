# Plex Watcher

A lightweight Node.js + Docker-based watcher that monitors your Plex media directories and automatically triggers a full Plex library refresh when changes are detected (file add, modify, or delete). This is useful for automating library updates without having to manually click "Scan Library Files" every time.

Supports:
- Monitoring multiple folders
- Auto-debouncing rapid file events
- Dockerized for isolation and simplicity
- Environment-based configuration for portability

---

## 📦 Installation

### 1. Clone this repository

```bash
git clone https://github.com/yourusername/plex-watcher.git
cd plex-watcher
```

### 2. Set up your environment variables

Create a `.env` file in the root of the project:

```ini
PLEX_TOKEN=your_plex_token_here
PLEX_SERVER_URL=http://192.168.x.x:32400
WATCHED_DIR=/absolute/path/to/your/media
```
- `host.docker.internal` is the correct hostname to access services on the host from inside a Docker container on macOS/Windows.
- If you’re on Linux, you’ll use your machine’s local IP (`192.168.X.X`) or set up a user-defined bridge network.

#### Finding the Token
Finding the `PLEX_TOKEN` is pretty simple:

1. Sign in to your Plex account in [Plex Web App](https://app.plex.tv/)
2. Browse to a library item and [view the XML for it](https://support.plex.tv/articles/201998867-investigate-media-information-and-formats/)
3. Look in the URL and find the token as the `X-Plex-Token` value

---

<!-- ## 📁 Folder Structure

```
plex-watcher/
├── .env
├── index.js
├── timeStamp.js
├── Dockerfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

--- -->

## 🚀 Run

### Development (Local Machine)
```bash
npm install
npm start
```

### Docker

#### 1. Build the Docker image
```bash
docker build -t plex-watcher .
```

#### 2. Run with Docker Compose
```bash
docker-compose up -d
```

---

<!-- ## ⚙️ Customization

To monitor multiple libraries or paths, update your `.env` and `docker-compose.yml` as needed.

You can mount your media folder read-only by adding `:ro` to the volume mount:

```yaml
volumes:
  - ~/movies/mine:/data:ro
```

--- -->

<!-- ## 🔍 Future Ideas
- Auto-discover library IDs
- Better cross-platform support
- Integration with webhook-based triggers -->
