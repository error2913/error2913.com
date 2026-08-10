// ============================================================
// error2913.com 主脚本
// 依赖：js/config.js（站点数据配置）
// ============================================================

// ---------- 小工具 ----------
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    }[ch]));
}

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    if (!Number.isFinite(diff) || diff < 0) return '';
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    return new Date(isoString).toLocaleDateString();
}

// APlayer 实例（供主题切换时同步配色）
let activePlayer = null;

// ---------- 加载动画 ----------
window.addEventListener('load', () => {
    const loader = $('.loader');
    if (loader) loader.style.display = 'none';
});

// ---------- 复制到剪贴板 ----------
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            showToast(`已复制文本: ${text}`);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand('copy');
            if (successful) {
                showToast(`已复制文本: ${text}`);
            } else {
                showToast('复制失败');
            }
            document.body.removeChild(textarea);
        }
    } catch (err) {
        showToast('复制失败');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 1000);
}

// 卡片点击复制（保留原有行为：带 text 属性的卡片点击即复制）
document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const text = card.getAttribute('text');
    if (text) copyToClipboard(text);
});

// ---------- 卡片折叠（支持动态加载后高度变化） ----------
document.addEventListener('DOMContentLoaded', () => {
    $$('.category__title').forEach((title) => {
        const grid = title.nextElementSibling;
        if (!grid) return;
        let expanded = true;

        const expand = () => {
            grid.style.maxHeight = `${grid.scrollHeight}px`;
            grid.style.padding = '';
            grid.dataset.originalHeight = grid.scrollHeight;
            expanded = true;
            setTimeout(() => {
                if (expanded) grid.style.maxHeight = '';
            }, 350);
        };

        const collapse = () => {
            grid.dataset.originalHeight = grid.scrollHeight;
            grid.style.maxHeight = `${grid.scrollHeight}px`;
            grid.style.padding = '';
            requestAnimationFrame(() => {
                grid.style.maxHeight = '0';
                grid.style.padding = '0';
            });
            expanded = false;
        };

        title.addEventListener('click', () => {
            if (expanded) collapse();
            else expand();
        });
    });
});

// ---------- 返回顶部 ----------
const backToTop = $('#backToTop');
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ---------- 主题：手动选择 + 跟随系统 ----------
const themeToggle = $('#themeToggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_ORDER = ['dark', 'light', 'auto'];
let theme = localStorage.getItem('theme') || 'auto';

function applyTheme() {
    const isDark = theme === 'dark' || (theme === 'auto' && systemTheme.matches);
    document.body.classList.toggle('dark-mode', isDark);
    const icons = { dark: 'fa-moon', light: 'fa-sun', auto: 'fa-display' };
    themeToggle.innerHTML = `<i class="fas ${icons[theme]}"></i>`;
    themeToggle.title = theme === 'auto' ? '主题：跟随系统（点击切换）' : `主题：${theme === 'dark' ? '暗色' : '亮色'}（点击切换）`;
    localStorage.setItem('theme', theme);
    updatePlayerTheme();
}

if (themeToggle) {
    applyTheme();
    themeToggle.addEventListener('click', () => {
        theme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
        applyTheme();
    });
    // 跟随系统模式下，系统主题变化实时生效
    systemTheme.addEventListener('change', () => {
        if (theme === 'auto') applyTheme();
    });
}

// ---------- 侧边导航 ----------
const navToggle = $('#navToggle');
const sideNav = $('#sideNav');

function setNavOpen(open) {
    if (!sideNav) return;
    sideNav.classList.toggle('side-nav--open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.innerHTML = open ? '<i class="fas fa-xmark"></i>' : '<i class="fas fa-bars"></i>';
}

if (navToggle && sideNav) {
    navToggle.addEventListener('click', () => {
        setNavOpen(!sideNav.classList.contains('side-nav--open'));
    });

    $$('.side-nav__panel a').forEach((link) => {
        link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('click', (e) => {
        if (!sideNav.classList.contains('side-nav--open')) return;
        if (!sideNav.contains(e.target)) setNavOpen(false);
    });

    // 滚动时高亮当前分区
    const navLinks = $$('.side-nav__panel a');
    const sections = navLinks
        .map((link) => document.getElementById(link.dataset.section))
        .filter(Boolean);

    const sectionObserver = new IntersectionObserver((entries) => {
        const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;
        const id = visible[0].target.id;
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === id);
        });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach((section) => sectionObserver.observe(section));
}

// ---------- 开源项目（GitHub API） ----------
async function initProjects() {
    const grid = $('#projectGrid');
    if (!grid) return;
    try {
        const response = await fetch(
            `https://api.github.com/users/${SITE_CONFIG.githubUser}/repos?per_page=100&sort=updated`,
            { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        const repos = await response.json();

        // 普通仓库优先；Fork 的仓库仅在有人给 Star 时展示
        const picked = repos
            .filter((repo) => !repo.fork || repo.stargazers_count > 0)
            .sort(
                (a, b) =>
                    b.stargazers_count - a.stargazers_count ||
                    new Date(b.pushed_at) - new Date(a.pushed_at)
            )
            .slice(0, 9);

        grid.innerHTML = picked
            .map(
                (repo) => `
                <a class="card card--link card--project" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener">
                    <div class="project-card__head">
                        <span class="project-card__name"><i class="fab fa-github"></i>${escapeHtml(repo.name)}</span>
                        <span class="project-card__stars"><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                    </div>
                    <p class="project-card__desc">${escapeHtml(repo.description || '暂无描述')}</p>
                    <span class="project-card__lang">${
                        repo.language
                            ? `<i class="fas fa-code"></i>${escapeHtml(repo.language)}`
                            : '<i class="fas fa-code"></i>未标注语言'
                    }</span>
                </a>
            `
            )
            .join('');
    } catch (err) {
        grid.innerHTML = '<p class="empty-tip">项目加载失败，请稍后刷新重试。</p>';
    }
}

// ---------- 作品集 ----------
function placeholderCover(title, index) {
    const hue = (index * 137) % 360;
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        `<stop offset="0" stop-color="hsl(${hue},65%,55%)"/>` +
        `<stop offset="1" stop-color="hsl(${(hue + 40) % 360},70%,35%)"/>` +
        '</linearGradient></defs>' +
        '<rect width="640" height="400" fill="url(#g)"/>' +
        `<text x="50%" y="50%" font-family="Segoe UI, sans-serif" font-size="34" font-weight="bold" fill="rgba(255,255,255,0.9)" text-anchor="middle" dominant-baseline="middle">${escapeHtml(title)}</text>` +
        '</svg>';
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function initGallery() {
    const grid = $('#galleryGrid');
    if (!grid) return;
    grid.innerHTML = GALLERY_ITEMS.map((item, index) => `
        <a class="card card--link card--gallery" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
            <img src="${item.image || placeholderCover(item.title, index)}" alt="${escapeHtml(item.title)} 截图" loading="lazy">
            <div class="gallery-body">
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.description)}</p>
                <div class="gallery-tags">${item.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
            </div>
        </a>
    `).join('');
}

// ---------- 最新博客（RSS/Atom 解析，带 CORS 代理兜底） ----------
function parseFeed(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    if (doc.querySelector('parsererror')) return [];
    return Array.from(doc.querySelectorAll('item, entry'))
        .slice(0, 5)
        .map((el) => {
            const linkEl = el.querySelector('link');
            const link = linkEl
                ? linkEl.textContent.trim() || linkEl.getAttribute('href') || ''
                : '';
            const title = el.querySelector('title')?.textContent?.trim() || '';
            const date = el.querySelector('pubDate, updated, published')?.textContent?.trim() || '';
            return { title, link, date };
        })
        .filter((post) => post.title && post.link);
}

async function initBlog() {
    const list = $('#blogList');
    if (!list) return;
    try {
        const feedUrl = SITE_CONFIG.blogFeedUrl;
        let posts = null;
        // 先直连；被 CORS / 网络拦截时经 allorigins 代理重试
        for (const url of [
            feedUrl,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
        ]) {
            try {
                const res = await fetch(url);
                if (!res.ok) continue;
                posts = parseFeed(await res.text());
                if (posts && posts.length) break;
            } catch {
                // 尝试下一个源
            }
        }

        if (posts && posts.length) {
            list.innerHTML = posts
                .map(
                    (post) => `
                    <li>
                        <time>${post.date ? new Date(post.date).toLocaleDateString() : ''}</time>
                        <a href="${escapeHtml(post.link)}" target="_blank" rel="noopener">${escapeHtml(post.title)}</a>
                    </li>
                `
                )
                .join('');
        } else {
            list.innerHTML =
                '<li class="empty-tip">博客订阅源暂不可用：请在 js/config.js 的 blogFeedUrl 填入正确的 RSS/Atom 地址。</li>';
        }
    } catch {
        list.innerHTML = '<li class="empty-tip">博客文章加载失败，请稍后重试。</li>';
    }
}

// ---------- 活动日历 & 骰娘使用高峰时段 ----------
// 演示数据开关：接入真实骰娘日志/统计接口后改为 false，并在 loadActivityData() 中返回真实数据
const USE_DEMO_DATA = true;

const WEEKDAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const JS_DAY_TO_INDEX = (jsDay) => (jsDay + 6) % 7; // 0=周一 ... 6=周日

function demoActivityFor(dayIndex, hour) {
    // 工作日白天低、晚上高；周末全天偏活跃
    const isWeekend = dayIndex >= 5;
    const evening = hour >= 19 && hour <= 23;
    const morning = hour >= 8 && hour <= 11;
    const base =
        (isWeekend ? 0.55 : 0.3) + (evening ? 0.55 : 0) + (morning ? 0.15 : 0);
    // 确定性伪随机扰动，保证数据稳定可复现
    const noise = Math.sin(dayIndex * 31 + hour * 17) * 0.25 + 0.25;
    const value = Math.min(1, Math.max(0, base + noise * 0.2));
    return Math.round(value * 4); // 0-4
}

async function loadActivityData() {
    // TODO: 接入真实数据时替换这里，返回格式：
    // { days: [{ date: '2026-08-01', level: 0-4 }], hours: [{ weekday: 0-6(周一=0), hour: 0-23, level: 0-4 }] }
    if (!USE_DEMO_DATA) return null;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const dayIndex = JS_DAY_TO_INDEX(new Date(year, month, day).getDay());
        days.push({
            date: `${year}-${month + 1}-${day}`,
            level: demoActivityFor(dayIndex, (day * 7) % 24),
        });
    }

    const hours = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        for (let hour = 0; hour < 24; hour++) {
            hours.push({ weekday: dayIndex, hour, level: demoActivityFor(dayIndex, hour) });
        }
    }
    return { days, hours };
}

function topPeakHours(hours) {
    const totals = new Map();
    hours.forEach((h) => totals.set(h.hour, (totals.get(h.hour) || 0) + h.level));
    return [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hour]) => `${hour}时`);
}

function initCalendar(data) {
    const calendar = $('#activityCalendar');
    const peakBox = $('#peakHours');
    if (!calendar || !peakBox) return;

    if (!data) {
        calendar.innerHTML = '<span class="empty-tip">暂无活动数据：接入真实数据源后自动展示。</span>';
        peakBox.innerHTML = '';
        return;
    }

    // 本月热力日历（周一开头）
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstOffset = JS_DAY_TO_INDEX(new Date(year, month, 1).getDay());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const levelByDay = new Map(data.days.map((d) => [Number(d.date.split('-')[2]), d.level]));

    const cells = [];
    for (let i = 0; i < firstOffset; i++) {
        cells.push('<span class="cal-cell blank"></span>');
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const level = levelByDay.get(day) ?? 0;
        const isToday = day === now.getDate();
        cells.push(
            `<span class="cal-cell lv${level}${isToday ? ' today' : ''}" title="${month + 1}月${day}日 · 活跃度 ${level}">${day}</span>`
        );
    }
    calendar.innerHTML = WEEKDAY_NAMES.map((name) => `<span class="cal-weekday">${name}</span>`).join('') + cells.join('');

    // 高峰时段热力图（24 小时 × 7 天）
    const hourLevels = new Map(data.hours.map((h) => [h.weekday * 24 + h.hour, h.level]));
    const rows = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const cellsHtml = [];
        for (let hour = 0; hour < 24; hour++) {
            const level = hourLevels.get(dayIndex * 24 + hour) ?? 0;
            cellsHtml.push(
                `<span class="cell lv${level}" title="${WEEKDAY_NAMES[dayIndex]} ${hour}时 · 活跃度 ${level}"></span>`
            );
        }
        rows.push(
            `<div class="hour-row"><span class="hour-row-label">${WEEKDAY_NAMES[dayIndex]}</span>${cellsHtml.join('')}</div>`
        );
    }
    const axis = '<div class="hour-axis"><b>0时</b><b>6时</b><b>12时</b><b>18时</b><b>23时</b></div>';
    const peaks = topPeakHours(data.hours)
        .map((hour) => `<span class="peak-chip"><b>${hour}</b> · 高峰</span>`)
        .join('');
    peakBox.innerHTML = `<div class="hour-heatmap">${axis}${rows.join('')}</div><div class="peak-summary">${peaks}</div>`;
}

// ---------- 音乐播放器（左下角迷你悬浮，APlayer + Meting API） ----------
const METING_API_TEMPLATES = [
    (id) => `https://api.injahow.cn/meting/?server=netease&type=playlist&id=${id}`,
    (id) => `https://meting.mikus.ink/api?server=netease&type=playlist&id=${id}`,
];

// 媒体地址白名单：只允许 http/https，防止第三方接口返回任意 URL
// （javascript:、data:、file: 等一律拒绝）
function isSafeMediaUrl(value) {
    if (typeof value !== 'string' || !value) return false;
    try {
        const protocol = new URL(value, window.location.href).protocol;
        return protocol === 'https:' || protocol === 'http:';
    } catch {
        return false;
    }
}

async function fetchPlaylistSongs() {
    for (const build of METING_API_TEMPLATES) {
        try {
            const res = await fetch(build(SITE_CONFIG.neteasePlaylistId));
            if (!res.ok) continue;
            const list = await res.json();
            if (!Array.isArray(list) || !list.length) continue;
            // 兼容不同接口的字段命名（name/artist 与 title/author）
            return list
                .map((song) => ({
                    name: song.name || song.title || '未知歌曲',
                    artist: song.artist || song.author || '未知歌手',
                    url: isSafeMediaUrl(song.url) ? song.url : '',
                    cover: isSafeMediaUrl(song.pic || song.cover) ? (song.pic || song.cover) : '',
                }))
                .filter((song) => song.url);
        } catch {
            // 尝试下一个接口
        }
    }
    return null;
}

function getPlayerTheme() {
    const color = getComputedStyle(document.body).getPropertyValue('--secondary-color').trim();
    return color || '#3498db';
}

// 主题切换时同步播放器配色（进度条、按钮、列表光标等）
function updatePlayerTheme() {
    if (!activePlayer || typeof activePlayer.theme !== 'function') return;
    const color = getPlayerTheme();
    const total = activePlayer.list ? (activePlayer.list.audios || []).length : 0;
    if (total > 1) {
        for (let i = 0; i < total; i++) activePlayer.theme(color, i);
    } else {
        activePlayer.theme(color);
    }
}

function initMusicPlayer() {
    const widget = $('#music');
    const fab = $('#musicToggle');
    const closeBtn = $('#musicClose');
    if (!widget || !fab) return;

    const title = $('#musicTitle');
    if (title && SITE_CONFIG.neteasePlaylistName) {
        title.textContent = SITE_CONFIG.neteasePlaylistName;
    }

    let player = null;
    let loadFailed = false;

    const setExpanded = (expanded) => {
        widget.classList.toggle('music-widget--expanded', expanded);
        fab.setAttribute('aria-expanded', String(expanded));
        fab.innerHTML = expanded ? '<i class="fas fa-times"></i>' : '<i class="fas fa-music"></i>';
        fab.title = expanded ? '收起播放器' : '打开音乐播放器';
        localStorage.setItem('musicExpanded', expanded ? '1' : '0');
    };

    const ensurePlayer = async () => {
        if (player || loadFailed) return;
        const container = $('#musicPlayer');
        if (!container || typeof APlayer === 'undefined') {
            if (container) {
                container.innerHTML = '<p class="empty-tip">播放器组件未加载，请刷新重试。</p>';
            }
            loadFailed = true;
            return;
        }
        container.innerHTML = '<p class="empty-tip">正在加载歌单…</p>';
        const songs = await fetchPlaylistSongs();
        if (!songs || !songs.length) {
            container.innerHTML =
                `<p class="empty-tip">歌单加载失败：` +
                `<a href="https://music.163.com/playlist?id=${SITE_CONFIG.neteasePlaylistId}" target="_blank" rel="noopener">在网易云打开</a></p>`;
            loadFailed = true;
            return;
        }
        container.innerHTML = '';
        player = new APlayer({
            container,
            audio: songs,
            fixed: false,
            autoplay: false,
            theme: getPlayerTheme(),
            order: 'list',
            loop: 'all',
            preload: 'metadata',
            listMaxHeight: '320px',
        });
        activePlayer = player;
    };

    fab.addEventListener('click', async () => {
        const expanded = !widget.classList.contains('music-widget--expanded');
        setExpanded(expanded);
        if (expanded) await ensurePlayer();
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => setExpanded(false));
    }

    // 默认收起为小圆钮，不遮挡页面内容；记住用户的选择
    setExpanded(localStorage.getItem('musicExpanded') === '1');
    if (widget.classList.contains('music-widget--expanded')) ensurePlayer();
}

// ---------- GitHub 动态（最近提交记录） ----------
async function initGitHubActivity() {
    const list = $('#activityList');
    if (!list) return;
    try {
        const response = await fetch(
            `https://api.github.com/users/${SITE_CONFIG.githubUser}/events/public?per_page=30`,
            { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        const events = await response.json();
        const pushes = events.filter((e) => e.type === 'PushEvent').slice(0, 6);

        if (!pushes.length) {
            list.innerHTML = '<li class="empty-tip">暂无公开的推送记录。</li>';
            return;
        }

        list.innerHTML = pushes
            .map((event) => {
                const commits = (event.payload.commits || [])
                    .slice(0, 2)
                    .map((c) => c.message.split('\n')[0]);
                return `
                    <li class="activity-item">
                        <i class="fab fa-github"></i>
                        <div class="activity-item__body">
                            <a href="https://github.com/${escapeHtml(event.repo.name)}" target="_blank" rel="noopener">${escapeHtml(event.repo.name)}</a>
                            <p>${commits.map(escapeHtml).join('；')}</p>
                            <time>${timeAgo(event.created_at)}</time>
                        </div>
                    </li>
                `;
            })
            .join('');
    } catch {
        list.innerHTML = '<li class="empty-tip">GitHub 动态加载失败，请稍后刷新重试。</li>';
    }
}

// ---------- 初始化 ----------
document.addEventListener('DOMContentLoaded', async () => {
    initGallery();
    initMusicPlayer();

    const calendarData = await loadActivityData();
    initCalendar(calendarData);

    await Promise.allSettled([initProjects(), initBlog(), initGitHubActivity()]);

    // 动态内容加载完成后刷新折叠测量值
    $$('.category__title').forEach((title) => {
        const grid = title.nextElementSibling;
        if (grid && grid.dataset.originalHeight !== undefined) {
            grid.dataset.originalHeight = grid.scrollHeight;
        }
    });
});
