export const projects = [
  {
    id: 'astrbot',
    title: 'AstrBot',
    description: '开源全能 Agent 聊天机器人平台，集成 QQ、微信、飞书、钉钉、Telegram 等主流即时通讯应用，支持多模态、Agent、MCP、知识库，拥有 1000+ 插件生态。',
    image: '/projects/astrbot.png',
    link: 'https://github.com/AstrBotDevs/AstrBot',
    stars: 0,
    tags: ['Python', 'Agent', 'Multi-Platform'],
    contributions: [
      {
        pr: 'https://github.com/AstrBotDevs/AstrBot/pull/4949',
        title: 'Provider-level proxy support & connection error logging',
        description: 'Added per-provider proxy configuration and detailed connection failure logs for OpenAI, Anthropic, Gemini, and multiple TTS providers.'
      }
    ]
  },
    {
    id: 'qq-music-api',
    title: 'Music API',
    description: '基于 Cloudflare Workers + D1 数据库的 QQ 音乐 API 服务，提供音乐数据、播放列表和搜索功能的编程接口。',
    image: '/projects/qq-music-api.png',
    link: 'https://github.com/tooplick/qq-music-api',
    stars: 0,
    tags: ['Cloudflare Workers', 'D1', 'API']
  },
  {
    id: 'nekro-agent',
    title: 'Nekro Agent',
    description: '高可扩展、高自由度、极简部署的 AI 聊天与代理执行 Bot。通过强大的提示词系统引导 AI 生成代码并在沙盒中执行，与真实环境交互。',
    image: '/projects/nekro-agent.webp',
    link: 'https://github.com/KroMiose/nekro-agent',
    stars: 0,
    tags: ['Python', 'AI Agent', 'Sandbox'],
    contributions: [
      {
        pr: 'https://github.com/KroMiose/nekro-agent/pull/269',
        title: 'Fix private chat file handling',
        description: 'Unified OneBot V11 file materialization, added NapCat API fallback for robust file receiving, and smart media-only message filtering.'
      }
    ]
  },
  {
    id: 'chaoxing',
    title: 'Chaoxing',
    description: '超星学习通自动化完成任务点工具，支持视频播放、课程进度和题库答题。以开源之力消灭付费刷课平台。',
    image: '/projects/chaoxing.jpg',
    link: 'https://github.com/Samueli924/chaoxing',
    stars: 0,
    tags: ['Python', 'Automation', 'Education'],
    contributions: [
      {
        pr: 'https://github.com/Samueli924/chaoxing/pull/586',
        title: 'LLM connectivity check at startup',
        description: 'Added startup API connection validation for AI and SiliconFlow question banks to catch misconfigurations before runtime.'
      }
    ]
  }
]
