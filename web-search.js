/**
 * Web Search Helper - DuckDuckGo Lite ( Key)
 * IncludesFree, No API: Web, Video, and Image search
 */

const WebSearch = {
    /**
     * Search the web - returns web pages
     */
    async search(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query);
        const url = `https://lite.duckduckgo.com/lite/?q=${encodedQuery}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const html = await response.text();
            return this.parseResults(html, maxResults);
        } catch (error) {
            console.error('Web search failed:', error);
            return [];
        }
    },
    
    /**
     * Search for videos - returns YouTube, TikTok, Vimeo links
     */
    async searchVideos(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query + " video tutorial");
        const url = `https://lite.duckduckgo.com/lite/?q=${encodedQuery}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const html = await response.text();
            const results = this.parseResults(html, maxResults * 2);
            
            // Filter for video-related domains
            return results.filter(r => 
                r.url.includes('youtube.com') ||
                r.url.includes('youtu.be') ||
                r.url.includes('tiktok.com') ||
                r.url.includes('vimeo.com') ||
                r.url.includes('video')
            ).slice(0, maxResults);
        } catch (error) {
            console.error('Video search failed:', error);
            return [];
        }
    },
    
    /**
     * Search for images - returns Unsplash/Pexels direct URLs
     */
    async searchImages(query, maxResults = 5) {
        const images = [];
        
        // Search Unsplash
        try {
            const unsplashUrl = `https://source.unsplash.com/random/10x?${encodeURIComponent(query)}`;
            // Note: Unsplash source API returns redirect, so we return search page URL
            images.push({
                title: `Unsplash search: ${query}`,
                url: `https://unsplash.com/search?q=${encodeURIComponent(query)}`,
                imageUrl: `https://source.unsplash.com/random/800x600?${encodeURIComponent(query)}`,
                source: 'Unsplash'
            });
        } catch (e) {}
        
        // Search Pexels
        try {
            images.push({
                title: `Pexels search: ${query}`,
                url: `https://www.pexels.com/search/${encodeURIComponent(query)}/`,
                imageUrl: null,
                source: 'Pexels'
            });
        } catch (e) {}
        
        // Search for specific stock photo sites
        try {
            const pixabayUrl = `https://pixabay.com/en/images/search/${encodeURIComponent(query)}/`;
            images.push({
                title: `Pixabay search: ${query}`,
                url: pixabayUrl,
                imageUrl: null,
                source: 'Pixabay'
            });
        } catch (e) {}
        
        return images;
    },
    
    /**
     * Search for YouTube tutorials specifically
     */
    async searchYouTube(query, maxResults = 5) {
        const encodedQuery = encodeURIComponent(query + " tutorial");
        const url = `https://lite.duckduckgo.com/lite/?q=${encodedQuery}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
            const html = await response.text();
            const results = this.parseResults(html, maxResults * 3);
            
            // Filter for YouTube
            return results.filter(r => 
                r.url.includes('youtube.com') ||
                r.url.includes('youtu.be')
            ).slice(0, maxResults);
        } catch (error) {
            console.error('YouTube search failed:', error);
            return [];
        }
    },
    
    /**
     * Parse DuckDuckGo Lite HTML results
     */
    parseResults(html, maxResults) {
        const results = [];
        const lines = html.split('\n');
        let currentResult = {};
        let resultCount = 0;
        
        for (const line of lines) {
            if (line.includes('>URL<') || line.includes('result-link')) {
                currentResult = {};
            }
            
            const urlMatch = line.match(/href="([^"]+)"/);
            if (urlMatch && urlMatch[1].startsWith('http')) {
                currentResult.url = urlMatch[1];
            }
            
            const textMatches = line.match(/>([^<]{5,100})</g);
            if (textMatches && textMatches.length > 0) {
                const potentialTitle = textMatches[0].replace(/[><]/g, '').trim();
                if (potentialTitle.length > 10 && potentialTitle.length < 100 && !currentResult.title) {
                    currentResult.title = potentialTitle;
                }
            }
            
            if (currentResult.title && currentResult.url && !currentResult.snippet) {
                results.push({
                    title: currentResult.title,
                    url: currentResult.url,
                    snippet: currentResult.snippet || ''
                });
                resultCount++;
                if (resultCount >= maxResults) break;
                currentResult = {};
            }
        }
        
        return results;
    },
    
    /**
     * Quick search with formatted output
     */
    async quickSearch(query, type = 'web') {
        let results;
        
        switch(type) {
            case 'video':
                results = await this.searchVideos(query, 5);
                break;
            case 'youtube':
                results = await this.searchYouTube(query, 5);
                break;
            case 'image':
                results = await this.searchImages(query, 5);
                break;
            default:
                results = await this.search(query, 5);
        }
        
        if (results.length === 0) {
            return `No results found for: "${query}"`;
        }
        
        let output = `🔍 ${type.toUpperCase()} results for: "${query}"\n\n`;
        
        if (type === 'image') {
            results.forEach((r, i) => {
                output += `${i + 1}. ${r.title}\n`;
                output += `   Source: ${r.source}\n`;
                output += `   ${r.url}\n`;
                output += `   Preview: ${r.imageUrl || 'N/A'}\n\n`;
            });
        } else {
            results.forEach((r, i) => {
                output += `${i + 1}. ${r.title}\n`;
                output += `   ${r.url}\n`;
                if (r.snippet) {
                    output += `   ${r.snippet.substring(0, 80)}...\n`;
                }
                output += '\n';
            });
        }
        
        return output;
    },
    
    /**
     * Get random motivational/background image
     */
    async getRandomImage(category = 'motivation') {
        const categories = {
            'motivation': 'motivation,sunset,mountain',
            'business': 'business,office,startup',
            'nature': 'nature,forest,ocean',
            'minimal': 'minimal,white,simple',
            'dark': 'dark,black,neon'
        };
        
        const tags = categories[category] || categories['motivation'];
        return {
            url: `https://source.unsplash.com/1920x1080/?${tags}`,
            source: 'Unsplash',
            searchUrl: `https://unsplash.com/search?q=${encodeURIComponent(tags)}`
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSearch;
}
