// Using BookmarkManager object from core.js

async function setupIconToggle(iconToggle) {
  const alwaysShowIcons = await BookmarkManager.getIconVisibilityPreference();
  iconToggle.checked = alwaysShowIcons;

  iconToggle.addEventListener('change', async function() {
    await BookmarkManager.setIconVisibilityPreference(this.checked);
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'toggleIconVisibility',
          alwaysShow: iconToggle.checked
        }).catch(error => {
          console.log('Could not send message to content script:', error);
          iconToggle.checked = !iconToggle.checked;
          localStorage.setItem('alwaysShowIcons', iconToggle.checked);
        });
      }
    });
  });
}

async function handleBookmarkRemoval(url) {
  await BookmarkManager.removeBookmark(url);
  displayBookmarks();

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'bookmarkRemoved',
        url: url
      }).catch(error => {
        console.log('Could not send message to content script:', error);
      });
    }
  });
}

async function renderBookmarkList(bookmarkList, bookmarks) {
  if (bookmarks.length === 0) {
    bookmarkList.innerHTML = '<div class="no-bookmarks">No bookmarks saved for this domain</div>';
    return;
  }

  bookmarkList.innerHTML = bookmarks.map(url => {
    try {
      const urlObj = new URL(url);
      return `
        <div class="bookmark-item">
          <a href="${url}" class="bookmark-link" target="_blank">${urlObj.hostname}${urlObj.pathname}</a>
          <button class="remove-btn" data-url="${url}">Remove</button>
        </div>
      `;
    } catch (e) {
      return '';
    }
  }).join('');

  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', async function() {
      await handleBookmarkRemoval(this.dataset.url);
    });
  });
}

async function displayBookmarks() {
  try {
    if (!BookmarkManager) {
      console.error('BookmarkManager not initialized');
      return;
    }

    const website = document.getElementById('website');
    const bookmarkList = document.getElementById('bookmarkList');
    const iconToggle = document.getElementById('iconToggle');

    if (!website || !bookmarkList || !iconToggle) {
      console.error('Required DOM elements not found');
      return;
    }

    await setupIconToggle(iconToggle);

    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      if (!tabs || !tabs[0]) {
        website.innerText = 'No active tab';
        return;
      }

      const currentUrl = new URL(tabs[0].url);
      const currentDomain = currentUrl.hostname;
      const bookmarks = await BookmarkManager.getBookmarksForDomain(currentDomain);

      website.innerText = currentDomain;
      await renderBookmarkList(bookmarkList, bookmarks);
    });
  } catch (error) {
    console.error('Error in displayBookmarks:', error);
    alert(`Error in displayBookmarks: ${error.message}`);
  }
}

// Initialize the popup
displayBookmarks();

// Initial display when popup is opened
document.addEventListener('DOMContentLoaded', displayBookmarks);
