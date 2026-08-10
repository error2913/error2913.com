// ============================================================
// 站点数据配置 —— 需要接入真实数据时，只改这个文件即可
// ============================================================

const SITE_CONFIG = {
    // GitHub 用户名：开源项目卡片与 GitHub 动态均基于该账号抓取
    githubUser: 'error2913',

    // 博客订阅源（RSS/Atom）：填写真实地址后，“最新博客”分区会自动解析
    // 例如 Typecho: https://blog.error2913.com/feed/
    //      Hexo:    https://blog.error2913.com/atom.xml
    blogFeedUrl: 'https://blog.error2913.com/atom.xml',

    // 网易云歌单 ID（需要歌单在网页端开启“允许外链播放”）
    // 当前：无月的伴星喜欢的音乐（无月的伴星）
    neteasePlaylistId: '7426540110',

    // 网易云歌单名称（左下角迷你栏显示）
    neteasePlaylistName: '无月的伴星喜欢的音乐',
};

// 作品集条目：image 留空时自动生成渐变占位封面
const GALLERY_ITEMS = [
    {
        title: 'aiplugin4',
        description: '用于海豹核心的 AI 插件，为骰娘接入 AI 对话与绘图能力。',
        tags: ['TypeScript', 'SealDice'],
        url: 'https://github.com/error2913/aiplugin4',
        image: '',
    },
    {
        title: 'aiplugin4-backends',
        description: 'aiplugin4 配套后端服务：流式输出、图片转 base64、用量图表、网页读取与 Markdown 渲染。',
        tags: ['Python', 'FastAPI'],
        url: 'https://github.com/error2913/aiplugin4-backends',
        image: '',
    },
    {
        title: 'sealdice-js',
        description: '海豹 JS 插件合集：骰点、自定义指令与群聊交互。',
        tags: ['JavaScript', 'SealDice'],
        url: 'https://github.com/error2913/sealdice-js',
        image: '',
    },
    {
        title: 'QQ-add-group-verification',
        description: '低等级 QQ 号加群时要求进行验证，基于 OneBot v11 的入群验证机器人。',
        tags: ['Python', 'OneBot'],
        url: 'https://github.com/error2913/QQ-add-group-verification',
        image: '',
    },
    {
        title: 'sealdice-OCR-plugin',
        description: '海豹 OCR 识别插件，让骰娘拥有“看图说话”能力。',
        tags: ['JavaScript', 'SealDice'],
        url: 'https://github.com/error2913/sealdice-OCR-plugin',
        image: '',
    },
    {
        title: 'error2913.com',
        description: '本网站源码：个人主页与骰娘展示站。',
        tags: ['HTML', 'CSS', 'JavaScript'],
        url: 'https://github.com/error2913/error2913.com',
        image: '',
    },
];
