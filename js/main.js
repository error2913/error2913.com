// 加载状态处理
window.addEventListener('load', () => {
    document.querySelector('.loader').style.display = 'none';
});

// 点击事件处理
document.addEventListener('click', (e) => {
    const card = e.target.closest('.card')
    if (card) {
        const text = card.getAttribute('text');
        if (!text) {
            return;
        }
        copyToClipboard(text);
    }
});

// 卡片折叠功能
document.addEventListener("DOMContentLoaded", () => {
    const titles = document.querySelectorAll(".category__title");

    titles.forEach(title => {
        const cardGrid = title.nextElementSibling;
        cardGrid.dataset.originalHeight = cardGrid.scrollHeight;

        title.addEventListener("click", () => {
            if (cardGrid.style.maxHeight) {
                cardGrid.style.maxHeight = cardGrid.dataset.originalHeight + "px";
                let hasUnfolded = false;
                cardGrid.addEventListener("transitionend", () => {
                    if (!hasUnfolded) {
                        cardGrid.style.maxHeight = "";
                        hasUnfolded = true; 
                    }
                })
            } else {
                cardGrid.dataset.originalHeight = cardGrid.scrollHeight;
                cardGrid.style.maxHeight = cardGrid.dataset.originalHeight + "px";
                void cardGrid.offsetHeight; // 触发重绘
                cardGrid.style.maxHeight = "0";
            }
        });
    });
});

// 复制功能
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

// 显示Toast提示（比alert更美观）
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.className = 'toast';
    document.body.appendChild(toast);

    // 淡入淡出效果
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300)
    }, 1000);
}

// 返回顶部功能
document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 主题切换功能
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

function updateTheme(isDark) {
    document.body.classList.toggle('dark-mode', isDark);
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

updateTheme(currentTheme === 'dark');

themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    updateTheme(isDark);
});

// 更新日期
document.getElementById('update-date').textContent = new Date().toLocaleDateString();