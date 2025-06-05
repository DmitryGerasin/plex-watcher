const axios = require('axios');
const chokidar = require('chokidar');
const { DateTime } = require("luxon");
const fs = require('fs');

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_SERVER_URL = process.env.PLEX_SERVER_URL || 'http://host.docker.internal:32400'; // For Docker on Mac/Windows
const DEBOUNCE_DELAY = parseInt(process.env.DEBOUNCE_DELAY, 10) || 30000; // Default to 30000ms if undefined or invalid
const WATCH_PATH = process.env.WATCH_PATH || "/data"; //  Volume mounted in the container; this is where Plex also looks

function timeStamp() {
   const now = DateTime.local().setLocale('en');
   return `[${now.toFormat('yyyy-MM-dd HH:mm:ss.SSS')}]`;
}

if (!fs.existsSync(WATCH_PATH)) {
   console.error(`${timeStamp()} ❌ WATCH_PATH "${WATCH_PATH}" does not exist or is inaccessible.`);
   process.exit(1);
}

let debounceTimer = null;

const getLibraryIDs = async () => {
   try {
      const response = await axios.get(`${PLEX_SERVER_URL}/library/sections?X-Plex-Token=${PLEX_TOKEN}`);
      return response.data.MediaContainer.Directory.map(lib => lib.key);
   } catch (err) {
      console.error(`${timeStamp()} ❌ Failed to fetch library IDs:`, err.message);
      return []; // Return an empty array if the request fails
   }
};

const watcher = chokidar.watch(WATCH_PATH, {
   /**
    * The regex pattern matches dotfiles (files starting with a dot) in any directory.
    * (^|[\/\\]) ensures it matches dotfiles at the root or within subdirectories.
    */
   ignored: /(^|[\/\\])\../,
   persistent: true,
   ignoreInitial: true,
});

const triggerScan = async () => {
   const libraryIds = await getLibraryIDs();
   for (const id of libraryIds) {
      const url = `${PLEX_SERVER_URL}/library/sections/${id}/refresh?X-Plex-Token=${PLEX_TOKEN}`;
      console.log(`${timeStamp()} 🔄 Triggering scan for Plex library section ${id}...`);
      try {
         await axios.get(url);
      } catch (err) {
         console.error(`${timeStamp()} ❌ Failed to scan library ${id}:`, err.message);
      }
   }
};

const resetDebounce = () => {
   if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
   }
   debounceTimer = setTimeout(() => {
      debounceTimer = null; // Reset the timer flag after execution
      triggerScan();
   }, DEBOUNCE_DELAY);
};

watcher
   .on('add', resetDebounce)
   .on('change', resetDebounce)
   .on('unlink', resetDebounce)
   .on('addDir', resetDebounce)
   .on('unlinkDir', resetDebounce);

console.log(`${timeStamp()} 📺  Watching ${WATCH_PATH} for Plex changes with a debounce delay of ${DEBOUNCE_DELAY/1000}s...`);
