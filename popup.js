function displayBookmarks() {
  const website = document.getElementById('website');
  const bookmarkList = document.getElementById('bookmarkList');
  const iconToggle = document.getElementById('iconToggle');

  // Load saved preference
  const alwaysShowIcons = localStorage.getItem('alwaysShowIcons') === 'true';
  iconToggle.checked = alwaysShowIcons;

  // Add toggle event listener
  iconToggle.addEventListener('change', function() {
    localStorage.setItem('alwaysShowIcons', this.checked);
    // Send message to content script with error handling
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'toggleIconVisibility',
          alwaysShow: iconToggle.checked
        }).catch(error => {
          console.log('Could not send message to content script:', error);
          // Revert the toggle if message sending fails
          iconToggle.checked = !iconToggle.checked;
          localStorage.setItem('alwaysShowIcons', iconToggle.checked);
        });
      }
    });
  });

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (!tabs || !tabs[0]) {
      website.innerText = 'No active tab';
      return;
    }

    const currentUrl = new URL(tabs[0].url);
    const bookmarks = JSON.parse(localStorage.getItem('linkBookmarks') || '[]');

    website.innerText = currentUrl.hostname;

    if (bookmarks.length === 0) {
      bookmarkList.innerHTML = '<div class="no-bookmarks">No bookmarks saved yet</div>';
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

    // Add click handlers for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', function() {
        const url = this.dataset.url;
        const bookmarks = JSON.parse(localStorage.getItem('linkBookmarks') || '[]');
        const updatedBookmarks = bookmarks.filter(bookmark => bookmark !== url);
        localStorage.setItem('linkBookmarks', JSON.stringify(updatedBookmarks));
        displayBookmarks();

        // Notify content script about bookmark removal
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
      });
    });
  });
}

// Initialize the popup
displayBookmarks();

// Initial display when popup is opened
document.addEventListener('DOMContentLoaded', displayBookmarks);
