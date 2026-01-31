// Daily Briefing Dashboard - Interactive JavaScript
// CONFIGURE THIS FOR YOUR GITHUB REPO
const CONFIG = {
    githubRepo: 'YOUR_USERNAME/daily-briefing-dashboard',  // Change this!
    githubBranch: 'main',
    dataPath: 'data',
    useLocalFiles: false  // Set to true for local, false for GitHub Pages
};

// GitHub raw URL helper
function getRawUrl(path) {
    return `https://raw.githubusercontent.com/${CONFIG.githubRepo}/${CONFIG.githubBranch}/${path}`;
}

// For local development (when running server.js)
const LOCAL_BASE = 'http://localhost:3000';

// State
let state = {
    briefing: null,
    posts: [],
    tiktok: null
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    loadAllData();
    startAutoRefresh();
});

// Set current date
function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);
}

// Load all data
async function loadAllData() {
    const loadingElements = document.querySelectorAll('.loading');
    loadingElements.forEach(el => el.textContent = 'Loading...');

    try {
        const today = new Date();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[today.getMonth()];
        const year = today.getFullYear();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
        const shortDate = `${dayName}-${dateStr}`;

        // Load data from appropriate source
        if (CONFIG.useLocalFiles) {
            await loadBriefingLocal(month, year, shortDate);
            await loadSocialPostsLocal(month, year, shortDate);
            await loadTikTokLocal(month, year, shortDate);
        } else {
            await loadBriefing(month, year, shortDate);
            await loadSocialPosts(month, year, shortDate);
            await loadTikTok(month, year, shortDate);
        }

        // Load market data
        await loadMarketData();

        updateTimestamp();

    } catch (error) {
        console.error('Error loading data:', error);
        loadingElements.forEach(el => el.textContent = 'No data available');
    }
}

// ============ GITHUB PAGES VERSION ============

async function loadBriefing(month, year, shortDate) {
    const paths = [
        `${CONFIG.dataPath}/briefings/${month}-${year}/Week-*/${shortDate}.md`,
        `${CONFIG.dataPath}/briefings/${month}-${year}/${shortDate}.md`
    ];

    let content = null;
    
    for (const pattern of paths) {
        try {
            const url = getRawUrl(pattern);
            const response = await fetch(url);
            if (response.ok) {
                content = await response.text();
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (content) {
        parseAndRenderBriefing(content);
    } else {
        document.getElementById('briefing-content').innerHTML = `
            <div class="loading">No briefing available for today. Check back soon!</div>
        `;
    }
}

async function loadSocialPosts(month, year, shortDate) {
    const paths = [
        `${CONFIG.dataPath}/posts/${month}-${year}/Week-*/${shortDate}.csv`,
        `${CONFIG.dataPath}/posts/${month}-${year}/${shortDate}.csv`
    ];

    let posts = [];
    
    for (const pattern of paths) {
        try {
            const url = getRawUrl(pattern);
            const response = await fetch(url);
            if (response.ok) {
                const csv = await response.text();
                posts = parseCSV(csv);
                break;
            }
        } catch (e) {
            continue;
        }
    }

    renderSocialPosts(posts);
}

async function loadTikTok(month, year, shortDate) {
    const paths = [
        `${CONFIG.dataPath}/tiktok/${month}-${year}/Week-*/${shortDate}.md`,
        `${CONFIG.dataPath}/tiktok/${month}-${year}/${shortDate}.md`
    ];

    let content = null;
    
    for (const pattern of paths) {
        try {
            const url = getRawUrl(pattern);
            const response = await fetch(url);
            if (response.ok) {
                content = await response.text();
                break;
            }
        } catch (e) {
            continue;
        }
    }

    renderTikTok(content);
}

// ============ LOCAL VERSION ============

async function loadBriefingLocal(month, year, shortDate) {
    const paths = [
        `${LOCAL_BASE}/daily-briefings/${month}-${year}/Week-*/${shortDate}.md`,
        `${LOCAL_BASE}/daily-briefings/${month}-${year}/${shortDate}.md`
    ];

    let content = null;
    for (const url of paths) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                content = await response.text();
                break;
            }
        } catch (e) {
            continue;
        }
    }

    if (content) {
        parseAndRenderBriefing(content);
    } else {
        document.getElementById('briefing-content').innerHTML = `
            <div class="loading">No briefing available for today</div>
        `;
    }
}

async function loadSocialPostsLocal(month, year, shortDate) {
    const paths = [
        `${LOCAL_BASE}/buffer-posts/${month}-${year}/Week-*/${shortDate}.csv`,
        `${LOCAL_BASE}/buffer-posts/${month}-${year}/${shortDate}.csv`
    ];

    let posts = [];
    for (const url of paths) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                const csv = await response.text();
                posts = parseCSV(csv);
                break;
            }
        } catch (e) {
            continue;
        }
    }

    renderSocialPosts(posts);
}

async function loadTikTokLocal(month, year, shortDate) {
    const paths = [
        `${LOCAL_BASE}/tiktok-content/${month}-${year}/Week-*/${shortDate}.md`,
        `${LOCAL_BASE}/tiktok-content/${month}-${year}/${shortDate}.md`
    ];

    let content = null;
    for (const url of paths) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                content = await response.text();
                break;
            }
        } catch (e) {
            continue;
        }
    }

    renderTikTok(content);
}

// ============ PARSING & RENDERING ============

function parseCSV(csv) {
    const lines = csv.split('\n');
    const posts = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const match = line.match(/^"?([^"]*)"?,[^,]*,[^,]*,"?([^"]*)"?/);
        if (match) {
            posts.push({
                time: match[2]?.trim() || '12:00',
                text: match[1],
                status: 'draft'
            });
        }
    }
    
    return posts;
}

function parseAndRenderBriefing(content) {
    const topics = [];
    const lines = content.split('\n');
    let currentTopic = null;

    for (const line of lines) {
        if (line.startsWith('## ')) {
            if (currentTopic) topics.push(currentTopic);
            currentTopic = {
                title: line.replace('## ', '').trim(),
                icon: getTopicIcon(line),
                preview: ''
            };
        } else if (line.startsWith('### ') && currentTopic) {
            currentTopic.preview = line.replace('### ', '').trim();
        }
    }
    if (currentTopic) topics.push(currentTopic);

    const container = document.getElementById('briefing-content');
    container.innerHTML = `
        <div class="briefing-content">
            ${topics.map(topic => `
                <div class="briefing-topic">
                    <div class="topic-icon">${topic.icon}</div>
                    <div class="topic-title">${topic.title}</div>
                    <div class="topic-preview">${topic.preview || 'Click to read more'}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function getTopicIcon(title) {
    const icons = {
        'SPORTS': '🏈', 'TECH': '💻', 'TRAVEL': '✈️', 'FASHION': '👗',
        'LITERATURE': '📚', 'BOOKS': '📚', 'HEARING': '👂', 'CONTENT': '🎙️',
        'STOCK': '📈', 'CRYPTO': '🪙'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
        if (title.toUpperCase().includes(key)) return icon;
    }
    return '📰';
}

function renderSocialPosts(posts) {
    const container = document.getElementById('social-content');
    document.getElementById('post-count').textContent = `${posts.length} posts`;
    
    if (posts.length === 0) {
        container.innerHTML = `<div class="loading">No social posts for today yet. Check back at 6 PM!</div>`;
        return;
    }

    container.innerHTML = `
        <div class="posts-list">
            ${posts.map(post => `
                <div class="post-item">
                    <span class="post-time">${post.time}</span>
                    <span class="post-text">${post.text.substring(0, 100)}${post.text.length > 100 ? '...' : ''}</span>
                    <span class="post-status">${post.status}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTikTok(content) {
    const container = document.getElementById('tiktok-content');
    
    if (!content) {
        container.innerHTML = `<div class="loading">No TikTok content for today yet. Check back at 9 AM!</div>`;
        return;
    }

    const scriptMatch = content.match(/### 📝 SCRIPT[\s\S]*?(?=###|$)/i);
    const captionMatch = content.match(/### #️⃣ CAPTION[\s\S]*?(?=###|$)/i);
    const promptMatch = content.match(/### 📸 IMAGE PROMPT[\s\S]*?(?=###|$)/i);

    const script = scriptMatch ? scriptMatch[0].replace(/### 📝 SCRIPT/i, '').trim() : '';
    const caption = captionMatch ? captionMatch[0].replace(/#️⃣ CAPTION/i, '').trim() : '';
    const prompt = promptMatch ? promptMatch[0].replace(/### 📸 IMAGE PROMPT/i, '').trim() : '';

    container.innerHTML = `
        <div class="tiktok-content">
            ${script ? `<div class="tiktok-section"><h4>📝 Script</h4><p>${script.substring(0, 200)}...</p></div>` : ''}
            ${caption ? `<div class="tiktok-section"><h4>#️⃣ Caption</h4><p>${caption.substring(0, 150)}...</p></div>` : ''}
            ${prompt ? `<div class="tiktok-section"><h4>📸 Image Prompt</h4><p>${prompt.substring(0, 150)}...</p></div>` : ''}
        </div>
    `;
}

// Market data (placeholder)
async function loadMarketData() {
    updateMarketDisplay();
}

function updateMarketDisplay() {
    document.getElementById('sp500').textContent = '5,892.63';
    document.getElementById('sp500-change').textContent = '+0.45%';
    document.getElementById('sp500-change').className = 'ticker-change positive';
    
    document.getElementById('btc-price').textContent = '$92,450';
    document.getElementById('btc-change').textContent = '+2.3%';
    document.getElementById('btc-change').className = 'ticker-change positive';
    
    document.getElementById('eth-price').textContent = '$3,180';
    document.getElementById('eth-change').textContent = '+1.8%';
    document.getElementById('eth-change').className = 'ticker-change positive';
}

// Open folder (for local version only)
function openFolder(folderName) {
    if (CONFIG.useLocalFiles) {
        const paths = {
            'daily-briefings': `${LOCAL_BASE}/daily-briefings`,
            'buffer-posts': `${LOCAL_BASE}/buffer-posts`,
            'tiktok-content': `${LOCAL_BASE}/tiktok-content`
        };
        if (paths[folderName]) {
            window.open(paths[folderName]);
        }
    }
}

// Refresh data
function refreshData() {
    loadAllData();
}

// Update timestamp
function updateTimestamp() {
    const now = new Date();
    document.getElementById('last-updated').textContent = now.toLocaleTimeString();
}

// Auto refresh every 5 minutes
function startAutoRefresh() {
    setInterval(() => {
        loadAllData();
    }, 5 * 60 * 1000);
}
