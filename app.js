/**
 * Clean & Simple PDF Viewer
 * Responsive optimization for Mobile, iPad, and Desktop
 */

document.addEventListener('DOMContentLoaded', () => {
  const TOTAL_PAGES = 14;
  let currentPage = 1;
  let isFitScreen = false; // Default to Expanded (Fit Width) mode

  // DOM Elements
  const scrollArea = document.getElementById('scrollArea');
  const pagesStream = document.getElementById('pagesStream');
  const sidebar = document.getElementById('sidebar');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');

  const pageInput = document.getElementById('pageInput');
  const totalPagesText = document.getElementById('totalPagesText');
  const btnPrevHeader = document.getElementById('btnPrevHeader');
  const btnNextHeader = document.getElementById('btnNextHeader');

  const btnFitScreen = document.getElementById('btnFitScreen');
  const btnFitWidth = document.getElementById('btnFitWidth');

  const btnPrint = document.getElementById('btnPrint');
  const btnFullscreen = document.getElementById('btnFullscreen');

  totalPagesText.textContent = TOTAL_PAGES;
  pageInput.max = TOTAL_PAGES;

  // On iPad / Tablets / Mobile (width <= 1024px), sidebar is closed by default to give full screen to document
  const isTabletOrMobile = window.innerWidth <= 1024;
  if (isTabletOrMobile) {
    sidebar.classList.add('hidden');
    btnToggleSidebar.classList.remove('active');
  } else {
    sidebar.classList.remove('hidden');
    btnToggleSidebar.classList.add('active');
  }

  // 1. Render all 14 Document Pages
  const pageNodes = [];
  const thumbNodes = [];

  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const pageNumStr = i.toString().padStart(2, '0');
    const imageSrc = `pages/page_${pageNumStr}.jpg`;
    const thumbSrc = `thumbnails/thumb_${pageNumStr}.jpg`;

    // Main Page Element
    const pageCard = document.createElement('div');
    pageCard.className = 'page-card';
    pageCard.id = `page-${i}`;
    pageCard.dataset.page = i;

    pageCard.innerHTML = `
      <img src="${imageSrc}" alt="Page ${i}" loading="${i <= 3 ? 'eager' : 'lazy'}">
      <div class="page-number-tag">Page ${i}</div>
    `;

    pagesStream.appendChild(pageCard);
    pageNodes.push(pageCard);

    // Sidebar Thumbnail Element
    const thumbItem = document.createElement('div');
    thumbItem.className = `thumb-item ${i === 1 ? 'active' : ''}`;
    thumbItem.id = `thumb-${i}`;
    thumbItem.dataset.page = i;

    thumbItem.innerHTML = `
      <div class="thumb-img-box">
        <img src="${thumbSrc}" alt="Page ${i} Thumbnail" loading="lazy">
      </div>
      <span class="thumb-label">Page ${i}</span>
    `;

    thumbItem.addEventListener('click', () => {
      scrollToPage(i);
      if (window.innerWidth <= 1024) {
        sidebar.classList.add('hidden');
        btnToggleSidebar.classList.remove('active');
      }
    });

    sidebar.appendChild(thumbItem);
    thumbNodes.push(thumbItem);
  }

  // 2. Scroll-to-Page Method
  function scrollToPage(pageNum) {
    if (pageNum < 1) pageNum = 1;
    if (pageNum > TOTAL_PAGES) pageNum = TOTAL_PAGES;
    const target = document.getElementById(`page-${pageNum}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // 3. Scroll Spy (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    let bestEntry = null;
    let maxRatio = 0;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        bestEntry = entry;
      }
    });

    if (bestEntry) {
      const pageIndex = parseInt(bestEntry.target.dataset.page, 10);
      setActivePage(pageIndex);
    }
  }, {
    root: scrollArea,
    threshold: [0.15, 0.4, 0.7]
  });

  pageNodes.forEach((node) => observer.observe(node));

  function setActivePage(pageNum) {
    currentPage = pageNum;
    pageInput.value = pageNum;

    // Highlight Thumbnail
    thumbNodes.forEach((thumb, idx) => {
      if (idx + 1 === pageNum) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }

  // 4. Page Input and Prev / Next Navigation
  pageInput.addEventListener('change', () => {
    const val = parseInt(pageInput.value, 10);
    if (!isNaN(val) && val >= 1 && val <= TOTAL_PAGES) {
      scrollToPage(val);
    } else {
      pageInput.value = currentPage;
    }
  });

  pageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') pageInput.blur();
  });

  const goPrev = () => { if (currentPage > 1) scrollToPage(currentPage - 1); };
  const goNext = () => { if (currentPage < TOTAL_PAGES) scrollToPage(currentPage + 1); };

  btnPrevHeader.addEventListener('click', goPrev);
  btnNextHeader.addEventListener('click', goNext);

  // 5. Sidebar Toggle
  const toggleSidebar = () => {
    sidebar.classList.toggle('hidden');
    btnToggleSidebar.classList.toggle('active');
  };

  btnToggleSidebar.addEventListener('click', toggleSidebar);

  // 6. Fit Screen vs Fit Width Controls
  btnFitScreen.addEventListener('click', () => {
    isFitScreen = true;
    scrollArea.classList.add('fit-screen-mode');
    btnFitScreen.classList.add('active');
    btnFitWidth.classList.remove('active');
    pagesStream.style.maxWidth = '';
    scrollToPage(currentPage);
  });

  btnFitWidth.addEventListener('click', () => {
    isFitScreen = false;
    scrollArea.classList.remove('fit-screen-mode');
    btnFitWidth.classList.add('active');
    btnFitScreen.classList.remove('active');
    pagesStream.style.maxWidth = 'min(920px, 100%)';
    scrollToPage(currentPage);
  });

  // 7. Fullscreen & Print
  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', () => window.print());
  }

  // 8. Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'Home') {
      e.preventDefault();
      scrollToPage(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      scrollToPage(TOTAL_PAGES);
    }
  });

  // Auto-fit on load
  scrollToPage(1);
});
