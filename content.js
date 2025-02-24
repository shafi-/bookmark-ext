// Function to create bookmark button element
function createBookmarkButton() {
  const button = document.createElement('span');
  button.className = 'bookmark-btn';
  button.innerHTML = '🔖';
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
