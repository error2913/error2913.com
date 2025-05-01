// 加载状态处理
window.addEventListener('load', () => {
    document.querySelector('.loader').style.display = 'none';
});

// 点击事件处理
document.addEventListener('click', (e) => {
    const cardProfile = e.target.closest('.card--profile')
    if (cardProfile) {
        const qqNumber = cardProfile.getAttribute('data-qq');
        if (!qqNumber) {
            return;
        }
        copyToClipboard(qqNumber);
    }
});

// 复制功能
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            showToast(`已复制QQ号: ${text}`);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const successful = document.execCommand('copy');
            if (successful) {
                showToast(`已复制QQ号: ${text}`); 
            } else {
                showToast('复制失败，请手动复制'); 
            }
            document.body.removeChild(textarea);
        }
    } catch (err) {
        showToast('复制失败，请手动复制');
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