// Function to create bookmark button element
function createBookmarkButton() {
  const button = document.createElement('span');
  button.className = 'bookmark-btn';
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path class="bookmark-outline" d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
      <path class="bookmark-fill" d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
    </svg>`;
  return button;
}

// Using BookmarkManager object from core.js

// Function to toggle bookmark status
async function toggleBookmark(url, button) {
  try {
    const isCurrentlyBookmarked = await BookmarkManager.isBookmarked(url);
    
    if (isCurrentlyBookmarked) {
      await BookmarkManager.removeBookmark(url);
      button.classList.remove('active');
    } else {
      await BookmarkManager.addBookmark(url);
      button.classList.add('active');
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    // Revert any UI changes if operation failed
    button.classList.remove('active');
  }
}

// Function to add bookmark buttons to all links
async function addBookmarkButtons() {
  const links = document.querySelectorAll('a');
  
  for (const link of links) {
    if (!link.querySelector('.bookmark-btn')) {
      const button = createBookmarkButton();
      const isCurrentlyBookmarked = await BookmarkManager.isBookmarked(link.href);
      if (isCurrentlyBookmarked) {
        button.classList.add('active');
      }
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark(link.href, button);
      });
      
      link.style.position = 'relative';
      link.appendChild(button);
    }
  }
}

// Function to update bookmark icon visibility
function updateBookmarkIconVisibility(alwaysShow) {
  if (alwaysShow) {
    document.body.classList.add('show-icons');
  } else {
    document.body.classList.remove('show-icons');
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'toggleIconVisibility') {
    updateBookmarkIconVisibility(message.alwaysShow);
  } else if (message.type === 'bookmarkRemoved') {
    const buttons = document.querySelectorAll('.bookmark-btn');
    buttons.forEach(button => {
      const link = button.parentElement;
      if (link && link.href === message.url) {
        button.classList.remove('active');
      }
    });
  }
});

// Initial visibility setup
chrome.storage.local.get(['alwaysShowIcons'], (result) => {
  const alwaysShowIcons = result.alwaysShowIcons || false;
  updateBookmarkIconVisibility(alwaysShowIcons);
});

// Initial setup
addBookmarkButtons();

// Handle dynamically added content
const observer = new MutationObserver(() => {
  addBookmarkButtons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
