# ☀️ Daily Briefing Dashboard

A responsive, mobile-friendly dashboard for your daily briefings, social posts, and TikTok content.

## 🌐 Deploy for Free (Choose One)

### Option 1: Netlify (Easiest - Recommended)

1. **Create a GitHub repository**
   - Go to https://github.com/new
   - Name: `daily-briefing-dashboard`
   - Make it Public or Private
   - Click "Create repository"

2. **Push your code**
   ```bash
   cd daily-briefing-dashboard
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/daily-briefing-dashboard.git
   git push -u origin main
   ```

3. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your GitHub repo
   - Click "Deploy site"

4. **Your site is live!** 
   - URL: `https://your-app-name.netlify.app`

### Option 2: Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Click "Deploy"

### Option 3: GitHub Pages

1. Go to your repo Settings → Pages
2. Set source to "main" branch
3. Your site: `https://YOUR_USERNAME.github.io/daily-briefing-dashboard`

---

## 📁 Data Folder Structure

For the dashboard to work online, your data needs to be in the `data/` folder:

```
daily-briefing-dashboard/
├── data/
│   ├── briefings/
│   │   └── January-2026/
│   │       └── Week-1/
│   │           └── Friday-2026-01-30.md
│   ├── posts/
│   │   └── January-2026/
│   │       └── Week-1/
│   │           └── Friday-2026-01-30.csv
│   └── tiktok/
│       └── January-2026/
│           └── Week-1/
│               └── Friday-2026-01-30.md
├── index.html
├── styles.css
├── app.js
└── README.md
```

---

## 🔄 How to Update Content

### Method 1: GitHub (Recommended)

1. Copy files from your OneDrive:
   - `clawdbot/daily-briefings/...` → `data/briefings/...`
   - `clawdbot/buffer-posts/...` → `data/posts/...`
   - `clawdbot/tiktok-content/...` → `data/tiktok/...`

2. Commit and push:
   ```bash
   git add .
   git commit -m "Add Jan 30 content"
   git push
   ```

3. Netlify auto-deploys in seconds!

### Method 2: Netlify Drop (No Git)

1. Organize your files in the `data/` folder
2. Go to https://app.netlify.com/drop
3. Drag and drop your `daily-briefing-dashboard` folder
4. Your site updates instantly!

---

## ⚙️ Configure GitHub Repo URL

Before deploying, edit `app.js` and change this line:

```javascript
const CONFIG = {
    githubRepo: 'YOUR_USERNAME/daily-briefing-dashboard',  // ← Your GitHub username and repo name
    // ...
};
```

---

## 📱 Features

- 📰 Daily Briefing summary
- 📱 Today's social posts (Buffer)
- 🎬 Today's TikTok content (Buzz)
- 📈 Stock & crypto prices
- 📁 Quick access to folders
- 📅 Daily schedule
- 🔄 Auto-refresh every 5 minutes
- 📱 Fully responsive & mobile-friendly
- 🌙 Dark mode

---

## 💡 Tips

- Bookmark your Netlify URL for quick access
- The page auto-refreshes every 5 minutes
- All content is mobile-friendly
- Click "Refresh" to manually reload data

---

Built for your daily workflow! 🚀
