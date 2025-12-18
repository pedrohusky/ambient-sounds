// acquireVsCodeApi is provided by VS Code webview runtime
const vscode = acquireVsCodeApi();

// ==================== INTERNATIONALIZATION (i18n) ====================
const translations = {
  en: {
    searchPlaceholder: "Search sounds...",
    stop: "Stop",
    stopPlaying: "⏹ Stop",
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
    stop: "Parar",
    stopPlaying: "⏹ Parar",
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

  es: {
    searchPlaceholder: "Buscar sonidos...",
    stop: "Parar",
    stopPlaying: "⏹ Parar",
    favorites: "Favoritos",
    favoritesEmpty: "Haz clic en ☆ para añadir",
    addToFavorites: "Añadir a favoritos",
    removeFromFavorites: "Quitar de favoritos",
    loadMore: "Cargar más...",
    sourceCloud: "Nube",
    sourceLocal: "Local",
    allCategories: "Todas las Categorías",
    category: "Categoría"
  },

  fr: {
    searchPlaceholder: "Rechercher des sons...",
    stop: "Arrêter",
    stopPlaying: "⏹ Arrêter",
    favorites: "Favoris",
    favoritesEmpty: "Cliquez sur ☆ pour ajouter",
    addToFavorites: "Ajouter aux favoris",
    removeFromFavorites: "Retirer des favoris",
    loadMore: "Charger plus...",
    sourceCloud: "Cloud",
    sourceLocal: "Local",
    allCategories: "Toutes les Catégories",
    category: "Catégorie"
  },

  de: {
    searchPlaceholder: "Sounds suchen...",
    stop: "Stoppen",
    stopPlaying: "⏹ Stoppen",
    favorites: "Favoriten",
    favoritesEmpty: "Klicken Sie auf ☆ zum Hinzufügen",
    addToFavorites: "Zu Favoriten hinzufügen",
    removeFromFavorites: "Aus Favoriten entfernen",
    loadMore: "Mehr laden...",
    sourceCloud: "Cloud",
    sourceLocal: "Lokal",
    allCategories: "Alle Kategorien",
    category: "Kategorie"
  },

  it: {
    searchPlaceholder: "Cerca suoni...",
    stop: "Ferma",
    stopPlaying: "⏹ Ferma",
    favorites: "Preferiti",
    favoritesEmpty: "Clicca su ☆ per aggiungere",
    addToFavorites: "Aggiungi ai preferiti",
    removeFromFavorites: "Rimuovi dai preferiti",
    loadMore: "Carica altro...",
    sourceCloud: "Cloud",
    sourceLocal: "Locale",
    allCategories: "Tutte le Categorie",
    category: "Categoria"
  },

  nl: {
    searchPlaceholder: "Geluiden zoeken...",
    stop: "Stop",
    stopPlaying: "⏹ Stop",
    favorites: "Favorieten",
    favoritesEmpty: "Klik op ☆ om toe te voegen",
    addToFavorites: "Toevoegen aan favorieten",
    removeFromFavorites: "Verwijderen uit favorieten",
    loadMore: "Meer laden...",
    sourceCloud: "Cloud",
    sourceLocal: "Lokaal",
    allCategories: "Alle Categorieën",
    category: "Categorie"
  },

  sv: {
    searchPlaceholder: "Sök ljud...",
    stop: "Stoppa",
    stopPlaying: "⏹ Stoppa",
    favorites: "Favoriter",
    favoritesEmpty: "Klicka på ☆ för att lägga till",
    addToFavorites: "Lägg till i favoriter",
    removeFromFavorites: "Ta bort från favoriter",
    loadMore: "Ladda mer...",
    sourceCloud: "Moln",
    sourceLocal: "Lokalt",
    allCategories: "Alla Kategorier",
    category: "Kategori"
  },

  pl: {
    searchPlaceholder: "Szukaj dźwięków...",
    stop: "Zatrzymaj",
    stopPlaying: "⏹ Zatrzymaj",
    favorites: "Ulubione",
    favoritesEmpty: "Kliknij ☆, aby dodać",
    addToFavorites: "Dodaj do ulubionych",
    removeFromFavorites: "Usuń z ulubionych",
    loadMore: "Załaduj więcej...",
    sourceCloud: "Chmura",
    sourceLocal: "Lokalne",
    allCategories: "Wszystkie Kategorie",
    category: "Kategoria"
  },

  tr: {
    searchPlaceholder: "Sesleri ara...",
    stop: "Durdur",
    stopPlaying: "⏹ Durdur",
    favorites: "Favoriler",
    favoritesEmpty: "Eklemek için ☆ tıkla",
    addToFavorites: "Favorilere ekle",
    removeFromFavorites: "Favorilerden kaldır",
    loadMore: "Daha fazla yükle...",
    sourceCloud: "Bulut",
    sourceLocal: "Yerel",
    allCategories: "Tüm Kategoriler",
    category: "Kategori"
  },

  ru: {
    searchPlaceholder: "Поиск звуков...",
    stop: "Стоп",
    stopPlaying: "⏹ Стоп",
    favorites: "Избранное",
    favoritesEmpty: "Нажмите ☆, чтобы добавить",
    addToFavorites: "Добавить в избранное",
    removeFromFavorites: "Удалить из избранного",
    loadMore: "Загрузить ещё...",
    sourceCloud: "Облако",
    sourceLocal: "Локально",
    allCategories: "Все Категории",
    category: "Категория"
  },

  ja: {
    searchPlaceholder: "サウンドを検索...",
    stop: "停止",
    stopPlaying: "⏹ 停止",
    favorites: "お気に入り",
    favoritesEmpty: "☆ をクリックして追加",
    addToFavorites: "お気に入りに追加",
    removeFromFavorites: "お気に入りから削除",
    loadMore: "さらに読み込む...",
    sourceCloud: "クラウド",
    sourceLocal: "ローカル",
    allCategories: "すべてのカテゴリ",
    category: "カテゴリ"
  },

  ko: {
    searchPlaceholder: "사운드 검색...",
    stop: "중지",
    stopPlaying: "⏹ 중지",
    favorites: "즐겨찾기",
    favoritesEmpty: "☆ 를 클릭하여 추가",
    addToFavorites: "즐겨찾기에 추가",
    removeFromFavorites: "즐겨찾기에서 제거",
    loadMore: "더 불러오기...",
    sourceCloud: "클라우드",
    sourceLocal: "로컬",
    allCategories: "모든 카테고리",
    category: "카테고리"
  },

  "zh-cn": {
    searchPlaceholder: "搜索声音...",
    stop: "停止",
    stopPlaying: "⏹ 停止",
    favorites: "收藏",
    favoritesEmpty: "点击 ☆ 添加",
    addToFavorites: "添加到收藏",
    removeFromFavorites: "从收藏中移除",
    loadMore: "加载更多...",
    sourceCloud: "云端",
    sourceLocal: "本地",
    allCategories: "所有分类",
    category: "分类"
  },

  "zh-tw": {
    searchPlaceholder: "搜尋聲音...",
    stop: "停止",
    stopPlaying: "⏹ 停止",
    favorites: "最愛",
    favoritesEmpty: "點擊 ☆ 以新增",
    addToFavorites: "加入最愛",
    removeFromFavorites: "從最愛移除",
    loadMore: "載入更多...",
    sourceCloud: "雲端",
    sourceLocal: "本機",
    allCategories: "所有分類",
    category: "分類"
  },

  ar: {
    searchPlaceholder: "ابحث عن الأصوات...",
    stop: "إيقاف",
    stopPlaying: "⏹ إيقاف",
    favorites: "المفضلة",
    favoritesEmpty: "اضغط ☆ للإضافة",
    addToFavorites: "أضف إلى المفضلة",
    removeFromFavorites: "إزالة من المفضلة",
    loadMore: "تحميل المزيد...",
    sourceCloud: "سحابة",
    sourceLocal: "محلي",
    allCategories: "جميع الفئات",
    category: "الفئة"
  },

  hi: {
    searchPlaceholder: "ध्वनियाँ खोजें...",
    stop: "रोकें",
    stopPlaying: "⏹ रोकें",
    favorites: "पसंदीदा",
    favoritesEmpty: "जोड़ने के लिए ☆ क्लिक करें",
    addToFavorites: "पसंदीदा में जोड़ें",
    removeFromFavorites: "पसंदीदा से हटाएं",
    loadMore: "और लोड करें...",
    sourceCloud: "क्लाउड",
    sourceLocal: "लोकल",
    allCategories: "सभी श्रेणियाँ",
    category: "श्रेणी"
  }
};


// Detect language from VS Code or browser
function detectLanguage() {
  const lang =
    document.documentElement.lang?.toLowerCase() ||
    navigator.language?.toLowerCase() ||
    "en";

  if (lang.startsWith("pt")) return "pt-br";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("it")) return "it";
  if (lang.startsWith("nl")) return "nl";
  if (lang.startsWith("sv")) return "sv";
  if (lang.startsWith("pl")) return "pl";
  if (lang.startsWith("tr")) return "tr";
  if (lang.startsWith("ru")) return "ru";
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("zh-tw")) return "zh-tw";
  if (lang.startsWith("zh")) return "zh-cn";
  if (lang.startsWith("ar")) return "ar";
  if (lang.startsWith("hi")) return "hi";

  return "en";
}


const currentLang = detectLanguage();
const t = translations[currentLang] || translations.en;

// Apply initial translations to static elements
function applyTranslations() {
  const searchEl = document.getElementById("search");
  if (searchEl) searchEl.placeholder = t.searchPlaceholder;
  
  const favSection = document.querySelector("#favorites-section h3");
  if (favSection) favSection.textContent = t.favorites;
  
  const stopBtnEl = document.getElementById("stop-btn");
  if (stopBtnEl && stopBtnEl.disabled) stopBtnEl.textContent = t.stop;
  
  // Update category select default option
  const categorySelect = document.getElementById("category-select");
  if (categorySelect) {
    const defaultOption = categorySelect.querySelector('option[value=""]');
    if (defaultOption) defaultOption.textContent = t.allCategories;
  }
}

// Apply translations when DOM is ready
applyTranslations();
// ==================================================================

const audio = document.getElementById("player");
const list = document.getElementById("list");
const search = document.getElementById("search");
const volumeControl = document.getElementById("volume");
const stopBtn = document.getElementById("stop-btn");
const favoritesList = document.getElementById("favorites-list");
const sourceIndicator = document.getElementById("source-indicator");
const nowPlaying = document.getElementById("now-playing");
const categorySelect = document.getElementById("category-select");

let allSounds = [];
let favorites = [];
let categories = [];
let currentPlaying = null;
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
  currentPlaying = savedState.currentPlaying || null;
  currentSource = savedState.source || "local";
  selectedCategory = savedState.selectedCategory || "";
  pagination = savedState.pagination || pagination;
  
  if (categories.length > 0) {
    updateCategorySelect();
  }
  
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
    // Se append=true, adicionar aos sons existentes
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
  }
});

// Avisar que o webview está pronto
vscode.postMessage({ command: "ready" });

function saveState() {
  vscode.setState({
    sounds: allSounds,
    favorites,
    categories,
    currentPlaying,
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

function populateList() {
  list.innerHTML = "";
  
  allSounds.forEach((sound) => {
    const li = document.createElement("li");
    li.dataset.sound = sound.id;
    li.dataset.url = sound.url;
    if (currentPlaying === sound.id) {
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
  
  // Adicionar botão "Carregar mais" se houver mais páginas
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
        append: true  // Indicar que deve adicionar aos sons existentes
      });
    });
    list.appendChild(loadMore);
  }
}

function formatSoundName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function playSound(id, url) {
  // Remover classe playing de todos
  document.querySelectorAll("#list li, #favorites-list li").forEach(li => {
    li.classList.remove("playing");
  });
  
  // Adicionar classe ao item atual
  const currentItem = document.querySelector(`#list li[data-sound="${id}"]`);
  if (currentItem) {
    currentItem.classList.add("playing");
  }
  
  currentPlaying = id;
  audio.src = url;
  audio.volume = volumeControl.value / 100;
  audio.play();
  saveState();
  
  // Atualizar estado do botão e nome do som tocando
  stopBtn.disabled = false;
  stopBtn.textContent = t.stopPlaying;
  updateNowPlaying(id);
}

function stopSound() {
  audio.pause();
  audio.currentTime = 0;
  currentPlaying = null;
  stopBtn.disabled = true;
  stopBtn.textContent = t.stop;
  updateNowPlaying(null);
  saveState();
  
  document.querySelectorAll("#list li, #favorites-list li").forEach(li => {
    li.classList.remove("playing");
  });
}

function updateNowPlaying(id) {
  if (!nowPlaying) return;
  
  if (id) {
    const sound = allSounds.find(s => s.id === id) || favorites.find(f => f.id === id);
    const name = sound ? (sound.name || formatSoundName(id)) : formatSoundName(id);
    nowPlaying.innerHTML = `<span class="now-playing-icon">♪</span> ${name}`;
    nowPlaying.classList.add("active");
  } else {
    nowPlaying.innerHTML = "";
    nowPlaying.classList.remove("active");
  }
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
    if (currentPlaying === fav.id) {
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

// Atualizar seletor de categorias
function updateCategorySelect() {
  if (!categorySelect) return;
  
  categorySelect.innerHTML = `<option value="">${t.allCategories}</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.id;
    option.textContent = cat.name;
    if (cat.id === selectedCategory) {
      option.selected = true;
    }
    categorySelect.appendChild(option);
  });
}

// Controles
volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value / 100;
});

stopBtn.addEventListener("click", stopSound);

// Evento de mudança de categoria
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

// Busca com debounce - envia para API
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

// Quando o áudio termina
audio.addEventListener("ended", () => {
  // Loop está ativo, então não deve chegar aqui
});

