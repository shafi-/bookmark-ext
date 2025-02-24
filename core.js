// Core functionality for bookmark management

const BookmarkManager = {
  // Function to get bookmarks for a domain
  getBookmarksForDomain(domain) {
    return new Promise((resolve, reject) => {
      try {
        if (!chrome.storage || !chrome.storage.local) {
          console.error('Chrome storage API not available');
          reject(new Error('Chrome storage API not available'));
          return;
        }
        chrome.storage.local.get(['domainBookmarks'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
            return;
          }
          const domainBookmarks = result.domainBookmarks || {};
          const bookmarks = domainBookmarks[domain] || [];
          console.log(`Retrieved ${bookmarks.length} bookmarks for domain: ${domain}`);
          resolve(bookmarks);
        });
      } catch (error) {
        console.error('Error in getBookmarksForDomain:', error);
        reject(error);
      }
    });
  },

  // Function to check if a URL is bookmarked
  isBookmarked(url) {
    return new Promise((resolve) => {
      const domain = new URL(url).hostname;
      this.getBookmarksForDomain(domain).then(bookmarks => {
        resolve(bookmarks.includes(url));
      });
    });
  },

  // Function to add a bookmark
  addBookmark(url) {
    return new Promise((resolve, reject) => {
      try {
        const domain = new URL(url).hostname;
        chrome.storage.local.get(['domainBookmarks'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          let domainBookmarks = result.domainBookmarks || {};
          let bookmarks = domainBookmarks[domain] || [];
          if (!bookmarks.includes(url)) {
            bookmarks.push(url);
            domainBookmarks[domain] = bookmarks;
            chrome.storage.local.set({ domainBookmarks: domainBookmarks }, () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
              }
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Function to remove a bookmark
  removeBookmark(url) {
    return new Promise((resolve, reject) => {
      try {
        const domain = new URL(url).hostname;
        chrome.storage.local.get(['domainBookmarks'], (result) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }
          let domainBookmarks = result.domainBookmarks || {};
          let bookmarks = domainBookmarks[domain] || [];
          const updatedBookmarks = bookmarks.filter(bookmark => bookmark !== url);
          domainBookmarks[domain] = updatedBookmarks;
          chrome.storage.local.set({ domainBookmarks: domainBookmarks }, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            resolve(true);
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Function to get icon visibility preference
  getIconVisibilityPreference() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['alwaysShowIcons'], (result) => {
        resolve(result.alwaysShowIcons || false);
      });
    });
  },

  // Function to set icon visibility preference
  setIconVisibilityPreference(value) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ alwaysShowIcons: value }, () => {
        resolve(true);
      });
    });
  }
};

// Make only the BookmarkManager object globally available
window.BookmarkManager = BookmarkManager;
