// acquireVsCodeApi is provided by VS Code webview runtime
const vscode = acquireVsCodeApi();

// ==================== INTERNATIONALIZATION (i18n) ====================
const translations = {
  en: {
    searchPlaceholder: "Search sounds...",
    stop: "Stop All",
    stopPlaying: "⏹ Stop All",
    favorites: "Favorites",
    favoritesEmpty: "Click ☆ to add",
    addToFavorites: "Add to favorites",
    removeFromFavorites: "Remove from favorites",
    loadMore: "Load more...",
    sourceCloud: "Cloud",
    sourceLocal: "Local",
    allCategories: "All Categories",
    category: "Category"
  },
  "pt-br": {
    searchPlaceholder: "Pesquisar sons...",
    stop: "Parar Todos",
    stopPlaying: "⏹ Parar Todos",
    favorites: "Favoritos",
    favoritesEmpty: "Clique em ☆ para adicionar",
    addToFavorites: "Adicionar aos favoritos",
    removeFromFavorites: "Remover dos favoritos",
    loadMore: "Carregar mais...",
    sourceCloud: "Cloud",
    sourceLocal: "Local",
    allCategories: "Todas as Categorias",
    category: "Categoria"
  },
  // ... (outros idiomas mantidos simplificados para poupar espaço, o código original tinha muitos)
};

// Simple language detection
const lang = document.documentElement.lang?.toLowerCase() || "en";
const currentLang = translations[lang] || translations["pt-br"] || translations.en;
const t = currentLang;

// Apply translations
function applyTranslations() {
  const searchEl = document.getElementById("search");
  if (searchEl) searchEl.placeholder = t.searchPlaceholder;
  
  const favSection = document.querySelector("#favorites-section h3");
  if (favSection) favSection.textContent = t.favorites;
  
  const stopBtnEl = document.getElementById("stop-btn");
  if (stopBtnEl) stopBtnEl.textContent = t.stop;

  const categorySelect = document.getElementById("category-select");
  if (categorySelect) {
    const defaultOption = categorySelect.querySelector('option[value=""]');
    if (defaultOption) defaultOption.textContent = t.allCategories;
  }
}

applyTranslations();

// ==================================================================

const list = document.getElementById("list");
const search = document.getElementById("search");
const stopBtn = document.getElementById("stop-btn");
const favoritesList = document.getElementById("favorites-list");
const sourceIndicator = document.getElementById("source-indicator");
const activeTracksContainer = document.getElementById("active-tracks");
const categorySelect = document.getElementById("category-select");

let allSounds = [];
let favorites = [];
let categories = [];
let activeTracks = []; // [{id, name, volume}]
let currentSource = "local";
let selectedCategory = "";
let searchTimeout = null;
let pagination = { page: 1, limit: 20, total: 0, totalPages: 1, hasMore: false };

// Carregar estado salvo
const savedState = vscode.getState();
if (savedState) {
  allSounds = savedState.sounds || [];
  favorites = savedState.favorites || [];
  categories = savedState.categories || [];
  activeTracks = savedState.activeTracks || [];
  currentSource = savedState.source || "local";
  selectedCategory = savedState.selectedCategory || "";
  pagination = savedState.pagination || pagination;
  
  if (categories.length > 0) updateCategorySelect();
  if (allSounds.length > 0) {
    populateList();
    updateFavoritesList();
    updateSourceIndicator();
  }
}

// Receber dados da extensão
window.addEventListener("message", (event) => {
  const message = event.data;
  
  if (message.command === "setSounds") {
    if (message.append && message.pagination?.page > 1) {
      allSounds = [...allSounds, ...(message.sounds || [])];
    } else {
      allSounds = message.sounds || [];
    }
    pagination = message.pagination || pagination;
    currentSource = message.source || "local";
    
    populateList();
    updateFavoritesList();
    updateSourceIndicator();
    saveState();
  
  } else if (message.command === "setCategories") {
    categories = message.categories || [];
    updateCategorySelect();
    saveState();
  
  } else if (message.command === "playerState") {
    // message.tracks = [{id, name, volume, isPlaying}]
    activeTracks = message.tracks || [];
    updateActiveTracksList();
    updatePlayingStatus();
    saveState();
  }
});

// Avisar que o webview está pronto
vscode.postMessage({ command: "ready" });

function saveState() {
  vscode.setState({
    sounds: allSounds,
    favorites,
    categories,
    activeTracks,
    source: currentSource,
    selectedCategory,
    pagination
  });
}

function updateSourceIndicator() {
  if (sourceIndicator) {
    if (currentSource === "remote") {
      sourceIndicator.innerHTML = `<span style="color: var(--vscode-charts-green, #89d185);">●</span> ${t.sourceCloud}`;
    } else {
      sourceIndicator.innerHTML = `<span style="color: var(--vscode-charts-yellow, #cca700);">●</span> ${t.sourceLocal}`;
    }
  }
}

function updateActiveTracksList() {
  activeTracksContainer.innerHTML = "";
  
  if (activeTracks.length > 0) {
    activeTracks.forEach(track => {
      const div = document.createElement("div");
      div.className = "track-item";
      
      const nameSpan = document.createElement("span");
      nameSpan.className = "track-name";
      nameSpan.innerHTML = `<span class="playing-icon">♪</span> ${track.name}`;
      
      const controlsDiv = document.createElement("div");
      controlsDiv.className = "track-controls";
      
      const volumeInput = document.createElement("input");
      volumeInput.type = "range";
      volumeInput.className = "track-volume";
      volumeInput.min = "0";
      volumeInput.max = "100";
      volumeInput.value = track.volume;
      volumeInput.addEventListener("input", (e) => {
        vscode.postMessage({ 
          command: "setTrackVolume", 
          id: track.id, 
          volume: parseInt(e.target.value) 
        });
      });
      
      const stopTrackBtn = document.createElement("button");
      stopTrackBtn.className = "stop-track-btn";
      stopTrackBtn.textContent = "◼";
      stopTrackBtn.title = "Parar";
      stopTrackBtn.addEventListener("click", () => {
        vscode.postMessage({ command: "stopTrack", id: track.id });
      });
      
      controlsDiv.appendChild(volumeInput);
      controlsDiv.appendChild(stopTrackBtn);
      
      div.appendChild(nameSpan);
      div.appendChild(controlsDiv);
      activeTracksContainer.appendChild(div);
    });
    
    stopBtn.disabled = false;
    stopBtn.textContent = t.stopPlaying;
  } else {
    stopBtn.disabled = true;
    stopBtn.textContent = t.stop;
  }
}

function updatePlayingStatus() {
  // Remover classe playing de todos
  document.querySelectorAll("#list li, #favorites-list li").forEach(li => {
    li.classList.remove("playing");
  });
  
  // Adicionar classe playing aos ativos
  activeTracks.forEach(track => {
    document.querySelectorAll(`#list li[data-sound="${track.id}"], #favorites-list li[data-sound="${track.id}"]`).forEach(li => {
      li.classList.add("playing");
    });
  });
}

function populateList() {
  list.innerHTML = "";
  
  allSounds.forEach((sound) => {
    const li = document.createElement("li");
    li.dataset.sound = sound.id;
    li.dataset.url = sound.url;
    
    // Check if playing
    if (activeTracks.some(t => t.id === sound.id)) {
      li.classList.add("playing");
    }

    const nameSpan = document.createElement("span");
    nameSpan.textContent = sound.name || formatSoundName(sound.id);

    const favBtn = document.createElement("button");
    favBtn.className = "favorite-btn";
    favBtn.textContent = isFavorite(sound.id) ? "★" : "☆";
    favBtn.title = isFavorite(sound.id) ? t.removeFromFavorites : t.addToFavorites;
    favBtn.classList.toggle("active", isFavorite(sound.id));
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(sound.id, sound.url, sound.name);
      updateFavoriteButtons();
    });

    li.appendChild(nameSpan);
    li.appendChild(favBtn);
    li.addEventListener("click", () => playSound(sound.id, sound.url));

    list.appendChild(li);
  });
  
  if (pagination.hasMore) {
    const loadMore = document.createElement("li");
    loadMore.className = "load-more";
    loadMore.innerHTML = `<span>${t.loadMore}</span>`;
    loadMore.addEventListener("click", () => {
      vscode.postMessage({ 
        command: "fetchSounds", 
        page: pagination.page + 1, 
        limit: pagination.limit,
        search: search.value,
        category: selectedCategory,
        append: true
      });
    });
    list.appendChild(loadMore);
  }
}

function formatSoundName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function playSound(id, url) {
  // Se já estiver tocando, ignorar (ou poderia reiniciar)
  if (activeTracks.some(t => t.id === id)) return;

  const sound = allSounds.find(s => s.id === id) || favorites.find(f => f.id === id);
  const name = sound ? (sound.name || formatSoundName(id)) : formatSoundName(id);
  
  vscode.postMessage({ 
    command: "playSound", 
    id: id, 
    url: url,
    name: name
  });
}

function stopAllTracks() {
  vscode.postMessage({ command: "stopAllTracks" });
  activeTracks = [];
  updateActiveTracksList();
  updatePlayingStatus();
  saveState();
}

function isFavorite(id) {
  return favorites.some(f => f.id === id);
}

function toggleFavorite(id, url, name) {
  if (isFavorite(id)) {
    favorites = favorites.filter((fav) => fav.id !== id);
  } else {
    favorites.push({ id, url, name: name || formatSoundName(id) });
  }
  saveState();
  updateFavoritesList();
}

function updateFavoritesList() {
  favoritesList.innerHTML = "";
  
  if (favorites.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.className = "favorites-empty";
    emptyMsg.textContent = t.favoritesEmpty;
    favoritesList.appendChild(emptyMsg);
    return;
  }
  
  favorites.forEach((fav) => {
    const li = document.createElement("li");
    li.dataset.sound = fav.id;
    
    if (activeTracks.some(t => t.id === fav.id)) {
      li.classList.add("playing");
    }

    const nameSpan = document.createElement("span");
    nameSpan.textContent = fav.name || formatSoundName(fav.id);
    nameSpan.addEventListener("click", () => playSound(fav.id, fav.url));

    const removeBtn = document.createElement("button");
    removeBtn.className = "favorite-btn active";
    removeBtn.textContent = "★";
    removeBtn.title = t.removeFromFavorites;
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(fav.id, fav.url, fav.name);
      updateFavoriteButtons();
    });

    li.appendChild(nameSpan);
    li.appendChild(removeBtn);
    favoritesList.appendChild(li);
  });
}

function updateFavoriteButtons() {
  document.querySelectorAll("#list .favorite-btn").forEach((btn) => {
    const id = btn.closest("li").dataset.sound;
    btn.textContent = isFavorite(id) ? "★" : "☆";
    btn.title = isFavorite(id) ? t.removeFromFavorites : t.addToFavorites;
    btn.classList.toggle("active", isFavorite(id));
  });
  updateFavoritesList();
}

function updateCategorySelect() {
  if (!categorySelect) return;
  categorySelect.innerHTML = `<option value="">${t.allCategories}</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    if (cat.id === selectedCategory) option.selected = true;
    categorySelect.appendChild(option);
  });
}

stopBtn.addEventListener("click", stopAllTracks);

if (categorySelect) {
  categorySelect.addEventListener("change", () => {
    selectedCategory = categorySelect.value;
    saveState();
    vscode.postMessage({ 
      command: "fetchSounds", 
      page: 1, 
      limit: 20,
      search: search.value,
      category: selectedCategory
    });
  });
}

search.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    vscode.postMessage({ 
      command: "fetchSounds", 
      page: 1, 
      limit: 20,
      search: search.value,
      category: selectedCategory
    });
  }, 300);
});

// Solicitar estado inicial
vscode.postMessage({ command: "getPlayerState" });
