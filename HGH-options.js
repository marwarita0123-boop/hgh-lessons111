// HGH-options.js – Global theme, direction, and language management
// Depends on HGH-i18n.js loaded beforehand.
(function() {
    'use strict';

    // ── Storage keys (shared across all HGH pages) ──
    var STORAGE_THEME = 'HGH-theme';
    var STORAGE_DIR   = 'HGH-dir';
    var STORAGE_LANG  = 'HGH-lang';

    // ── Helpers ──
    function getStored(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function setStored(key, value) {
        try { localStorage.setItem(key, value); } catch (e) {}
    }

    // ── Theme (dark/light) ──
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    function setTheme(theme) {
        applyTheme(theme);
        setStored(STORAGE_THEME, theme);
    }

    function getPreferredTheme() {
        var stored = getStored(STORAGE_THEME);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function handleThemeToggle() {
        var current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    // ── Direction (rtl/ltr) ──
    function applyDir(dir) {
        if (dir === 'ltr') {
            document.body.classList.add('HGH-History-ltr');
            document.documentElement.setAttribute('dir', 'ltr');
        } else {
            document.body.classList.remove('HGH-History-ltr');
            document.documentElement.setAttribute('dir', 'rtl');
        }
    }

    function setDir(dir) {
        applyDir(dir);
        setStored(STORAGE_DIR, dir);
    }

    // ── Language & Translation ──
    var currentLang = 'ar';
    var currentPageTranslations = {};

    function mergeTranslations(pageTranslations) {
        var merged = {};
        var langs = Object.keys(HGH_SHARED_TRANSLATIONS);
        langs.forEach(function(lang) {
            merged[lang] = Object.assign(
                {},
                HGH_SHARED_TRANSLATIONS[lang],
                pageTranslations[lang] || {}
            );
        });
        return merged;
    }

    function applyLanguage(lang) {
        if (!lang || !HGH_SHARED_TRANSLATIONS[lang]) {
            lang = 'ar';
        }
        currentLang = lang;

        var allTrans = mergeTranslations(currentPageTranslations);
        var t = allTrans[lang] || {};

        // Update DOM
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) el.textContent = t[key];
        });
        document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-title');
            if (t[key] !== undefined) el.setAttribute('title', t[key]);
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
            var key = el.getAttribute('data-i18n-aria');
            if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
        });

        document.documentElement.setAttribute('lang', lang);

        // Direction always follows language
        var dir = (lang === 'ar') ? 'rtl' : 'ltr';
        setDir(dir);

        var langSelect = document.getElementById('languageSelect');
        if (langSelect && langSelect.value !== lang) {
            langSelect.value = lang;
        }

        setStored(STORAGE_LANG, lang);
    }

    function getStoredLang() {
        return getStored(STORAGE_LANG) || 'ar';
    }

    // ── Initialization ──
    function initOptions(pageTranslations) {
        currentPageTranslations = pageTranslations || {};

        // 1. Apply theme (saved or system)
        applyTheme(getPreferredTheme());

        // 2. Apply language (which also sets direction)
        var lang = getStoredLang();
        applyLanguage(lang);

        // 3. Event listeners
        var themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', handleThemeToggle);
        }

        var langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.addEventListener('change', function() {
                applyLanguage(this.value);
            });
        }

        // 4. Listen for system theme changes when no manual preference saved
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (!getStored(STORAGE_THEME)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Expose global function
    window.HGH_initOptions = initOptions;
})();