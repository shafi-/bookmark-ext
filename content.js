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

// Function to check if a link is bookmarked
function isBookmarked(url) {
  const bookmarks = JSON.parse(localStorage.getItem('linkBookmarks') || '[]');
  return bookmarks.includes(url);
}

// Function to toggle bookmark status
function toggleBookmark(url, button) {
  let bookmarks = JSON.parse(localStorage.getItem('linkBookmarks') || '[]');
  
  if (isBookmarked(url)) {
    bookmarks = bookmarks.filter(bookmark => bookmark !== url);
    button.classList.remove('active');
  } else {
    bookmarks.push(url);
    button.classList.add('active');
  }
  
  localStorage.setItem('linkBookmarks', JSON.stringify(bookmarks));
}

// Function to add bookmark buttons to all links
function addBookmarkButtons() {
  const links = document.querySelectorAll('a');
  
  links.forEach(link => {
    if (!link.querySelector('.bookmark-btn')) {
      const button = createBookmarkButton();
      if (isBookmarked(link.href)) {
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
  });
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
const alwaysShowIcons = localStorage.getItem('alwaysShowIcons') === 'true';
updateBookmarkIconVisibility(alwaysShowIcons);

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
