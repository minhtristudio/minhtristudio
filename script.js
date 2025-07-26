// Image Search Application - Mobile Optimized with CDN-V Integration
class ImageSearchApp {
    constructor() {
        this.API_BASE_URL = 'https://cdn-v.atwebpages.com/API/view.php';
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentQuery = '';
        this.currentFilters = {};
        this.isLoading = false;
        this.currentView = 'grid';
        this.isMobile = window.innerWidth <= 768;
        this.touchStartY = 0;
        this.zoomLevel = 1;
        this.maxZoom = 3;
        this.minZoom = 0.5;
        
        // Cache for CDN-V images
        this.imageCache = new Map();
        this.loadedPages = new Set();
        
        // Mobile optimization
        this.debounceTimer = null;
        this.isInfiniteScrollEnabled = this.isMobile;
        
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.setupMobileOptimizations();
        this.setupPWA();
        this.loadTrendingImages();
        this.detectMobileDevice();
    }

    detectMobileDevice() {
        this.isMobile = window.innerWidth <= 768;
        
        // Show/hide mobile elements
        const mobileBottomNav = document.getElementById('mobileBottomNav');
        const filterToggle = document.getElementById('filterToggle');
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        
        if (this.isMobile) {
            mobileBottomNav.style.display = 'flex';
            filterToggle.style.display = 'block';
            loadMoreContainer.style.display = this.isInfiniteScrollEnabled ? 'block' : 'none';
        } else {
            mobileBottomNav.style.display = 'none';
            filterToggle.style.display = 'none';
            loadMoreContainer.style.display = 'none';
        }
    }

    setupMobileOptimizations() {
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.detectMobileDevice();
                this.adjustLayoutForOrientation();
            }, 100);
        });

        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.detectMobileDevice();
        }, 250));

        // Prevent zoom on input focus
        this.preventInputZoom();

        // Setup touch gestures
        this.setupTouchGestures();

        // Setup infinite scroll for mobile
        if (this.isMobile) {
            this.setupInfiniteScroll();
        }
    }

    setupPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                console.log('Service Worker registration failed');
            });
        }

        // Handle PWA install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showPWAInstallPrompt();
        });

        const pwaInstallBtn = document.getElementById('pwaInstallBtn');
        const pwaCloseBtn = document.getElementById('pwaCloseBtn');
        const pwaPrompt = document.getElementById('pwaInstallPrompt');

        if (pwaInstallBtn) {
            pwaInstallBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const result = await deferredPrompt.userChoice;
                    if (result.outcome === 'accepted') {
                        this.hidePWAInstallPrompt();
                    }
                    deferredPrompt = null;
                }
            });
        }

        if (pwaCloseBtn) {
            pwaCloseBtn.addEventListener('click', () => {
                this.hidePWAInstallPrompt();
            });
        }
    }

    showPWAInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt && this.isMobile) {
            prompt.classList.add('show');
        }
    }

    hidePWAInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.classList.remove('show');
        }
    }

    bindEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });

        searchBtn.addEventListener('click', () => {
            this.performSearch();
        });

        // Suggestion items
        const suggestions = document.querySelectorAll('.suggestion-item');
        suggestions.forEach(item => {
            item.addEventListener('click', (e) => {
                const query = e.target.getAttribute('data-query');
                searchInput.value = query;
                this.performSearch();
            });
        });

        // Quick categories for mobile
        const categoryChips = document.querySelectorAll('.category-chip');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', (e) => {
                const category = e.currentTarget.getAttribute('data-category');
                this.searchByCategory(category);
            });
        });

        // Filter changes
        const filters = document.querySelectorAll('.filter-select');
        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.performSearch();
            });
        });

        // Mobile filter panel
        const filterToggle = document.getElementById('filterToggle');
        const mobileFilterPanel = document.getElementById('mobileFilterPanel');
        const closeFilterPanel = document.getElementById('closeFilterPanel');
        const applyFilters = document.getElementById('applyFilters');

        if (filterToggle) {
            filterToggle.addEventListener('click', () => {
                this.showMobileFilterPanel();
            });
        }

        if (closeFilterPanel) {
            closeFilterPanel.addEventListener('click', () => {
                this.hideMobileFilterPanel();
            });
        }

        if (mobileFilterPanel) {
            mobileFilterPanel.addEventListener('click', (e) => {
                if (e.target === mobileFilterPanel) {
                    this.hideMobileFilterPanel();
                }
            });
        }

        if (applyFilters) {
            applyFilters.addEventListener('click', () => {
                this.applyMobileFilters();
            });
        }

        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').getAttribute('data-view');
                this.toggleView(view);
            });
        });

        // Load more button for mobile
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreImages();
            });
        }

        // Modal functionality
        const modal = document.getElementById('imageModal');
        const closeBtn = document.getElementById('closeModal');
        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');
        const copyLinkBtn = document.getElementById('copyLinkBtn');

        // Modal zoom controls
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        const resetZoomBtn = document.getElementById('resetZoomBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadImage();
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareImage();
            });
        }

        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => {
                this.copyImageLink();
            });
        }

        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => {
                this.zoomImage(0.2);
            });
        }

        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => {
                this.zoomImage(-0.2);
            });
        }

        if (resetZoomBtn) {
            resetZoomBtn.addEventListener('click', () => {
                this.resetZoom();
            });
        }

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').getAttribute('data-section');
                this.handleNavigation(section);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.hideMobileFilterPanel();
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    setupTouchGestures() {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');

        if (modal && modalImage) {
            let hammer = null;

            // Initialize Hammer.js if available, otherwise use basic touch events
            if (typeof Hammer !== 'undefined') {
                hammer = new Hammer(modalImage);
                hammer.get('pinch').set({ enable: true });
                hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });

                hammer.on('pinch', (e) => {
                    this.handlePinchZoom(e.scale);
                });

                hammer.on('pan', (e) => {
                    this.handleImagePan(e.deltaX, e.deltaY);
                });
            } else {
                // Basic touch events for zoom
                modalImage.addEventListener('touchstart', (e) => {
                    if (e.touches.length === 2) {
                        this.lastPinchDistance = this.getPinchDistance(e.touches);
                    }
                });

                modalImage.addEventListener('touchmove', (e) => {
                    if (e.touches.length === 2) {
                        e.preventDefault();
                        const currentDistance = this.getPinchDistance(e.touches);
                        const scale = currentDistance / this.lastPinchDistance;
                        this.handlePinchZoom(scale);
                        this.lastPinchDistance = currentDistance;
                    }
                });
            }

            // Swipe to close modal
            modal.addEventListener('touchstart', (e) => {
                this.touchStartY = e.touches[0].clientY;
            });

            modal.addEventListener('touchend', (e) => {
                const touchEndY = e.changedTouches[0].clientY;
                const deltaY = touchEndY - this.touchStartY;

                if (Math.abs(deltaY) > 100) {
                    this.closeModal();
                }
            });
        }
    }

    getPinchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    handlePinchZoom(scale) {
        const newZoom = this.zoomLevel * scale;
        this.setZoomLevel(Math.max(this.minZoom, Math.min(this.maxZoom, newZoom)));
    }

    zoomImage(delta) {
        const newZoom = this.zoomLevel + delta;
        this.setZoomLevel(Math.max(this.minZoom, Math.min(this.maxZoom, newZoom)));
    }

    setZoomLevel(zoom) {
        this.zoomLevel = zoom;
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            modalImage.style.transform = `scale(${zoom})`;
        }
    }

    resetZoom() {
        this.setZoomLevel(1);
    }

    setupInfiniteScroll() {
        let isLoadingMore = false;

        window.addEventListener('scroll', this.debounce(() => {
            if (isLoadingMore || !this.isInfiniteScrollEnabled) return;

            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 1000) {
                if (this.currentPage < this.totalPages) {
                    isLoadingMore = true;
                    this.loadMoreImages().finally(() => {
                        isLoadingMore = false;
                    });
                }
            }
        }, 100));
    }

    preventInputZoom() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                    }
                }
            });

            input.addEventListener('blur', () => {
                if (this.isMobile) {
                    const viewport = document.querySelector('meta[name=viewport]');
                    if (viewport) {
                        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
                    }
                }
            });
        });
    }

    debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(this.debounceTimer);
                func(...args);
            };
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(later, wait);
        }.bind(this);
    }

    adjustLayoutForOrientation() {
        // Adjust layout based on orientation
        setTimeout(() => {
            const resultsSection = document.getElementById('resultsSection');
            if (resultsSection && resultsSection.style.display !== 'none') {
                this.refreshImageGrid();
            }
        }, 300);
    }

    showMobileFilterPanel() {
        const panel = document.getElementById('mobileFilterPanel');
        if (panel) {
            // Sync filters with main filters
            this.syncMobileFilters();
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    hideMobileFilterPanel() {
        const panel = document.getElementById('mobileFilterPanel');
        if (panel) {
            panel.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

    syncMobileFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const orientationFilter = document.getElementById('orientationFilter');
        const sizeFilter = document.getElementById('sizeFilter');

        const mobileCategoryFilter = document.getElementById('mobileCategoryFilter');
        const mobileOrientationFilter = document.getElementById('mobileOrientationFilter');
        const mobileSizeFilter = document.getElementById('mobileSizeFilter');

        if (categoryFilter && mobileCategoryFilter) {
            mobileCategoryFilter.value = categoryFilter.value;
        }
        if (orientationFilter && mobileOrientationFilter) {
            mobileOrientationFilter.value = orientationFilter.value;
        }
        if (sizeFilter && mobileSizeFilter) {
            mobileSizeFilter.value = sizeFilter.value;
        }
    }

    applyMobileFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const orientationFilter = document.getElementById('orientationFilter');
        const sizeFilter = document.getElementById('sizeFilter');

        const mobileCategoryFilter = document.getElementById('mobileCategoryFilter');
        const mobileOrientationFilter = document.getElementById('mobileOrientationFilter');
        const mobileSizeFilter = document.getElementById('mobileSizeFilter');

        if (categoryFilter && mobileCategoryFilter) {
            categoryFilter.value = mobileCategoryFilter.value;
        }
        if (orientationFilter && mobileOrientationFilter) {
            orientationFilter.value = mobileOrientationFilter.value;
        }
        if (sizeFilter && mobileSizeFilter) {
            sizeFilter.value = mobileSizeFilter.value;
        }

        this.hideMobileFilterPanel();
        this.performSearch();
    }

    searchByCategory(category) {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        
        if (categoryFilter) {
            categoryFilter.value = category;
        }
        
        if (searchInput) {
            searchInput.value = '';
        }
        
        this.performSearch();
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        this.currentQuery = query;
        this.currentPage = 1;
        this.loadedPages.clear();
        this.collectFilters();
        
        this.showLoading();
        
        try {
            const results = await this.searchCDNVImages(query, this.currentFilters, this.currentPage);
            this.displayResults(results);
            this.loadedPages.add(this.currentPage);
        } catch (error) {
            this.showError('Không thể tìm kiếm hình ảnh. Vui lòng thử lại.');
            console.error('Search error:', error);
        } finally {
            this.hideLoading();
        }
    }

    async loadMoreImages() {
        if (this.isLoading || this.currentPage >= this.totalPages) return;

        const nextPage = this.currentPage + 1;
        
        if (this.loadedPages.has(nextPage)) return;

        this.showLoadMoreLoading();

        try {
            const results = await this.searchCDNVImages(this.currentQuery, this.currentFilters, nextPage);
            this.appendResults(results);
            this.currentPage = nextPage;
            this.loadedPages.add(nextPage);
        } catch (error) {
            this.showError('Không thể tải thêm hình ảnh.');
        } finally {
            this.hideLoadMoreLoading();
        }
    }

    collectFilters() {
        this.currentFilters = {
            category: document.getElementById('categoryFilter')?.value || '',
            orientation: document.getElementById('orientationFilter')?.value || '',
            size: document.getElementById('sizeFilter')?.value || ''
        };
    }

    async searchCDNVImages(query, filters, page = 1) {
        // Construct API parameters for CDN-V
        const params = new URLSearchParams();
        
        if (query) {
            params.append('q', query);
        }
        
        params.append('page', page);
        params.append('per_page', this.isMobile ? 15 : 20);
        
        if (filters.category) {
            params.append('category', filters.category);
        }
        
        if (filters.orientation) {
            params.append('orientation', filters.orientation);
        }
        
        if (filters.size) {
            params.append('size', filters.size);
        }

        try {
            // For now, simulate CDN-V API response with sample data
            // In production, this would be:
            // const response = await fetch(`${this.API_BASE_URL}?${params}`);
            // const data = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 800));
            
            return this.generateCDNVResponse(query, filters, page);
        } catch (error) {
            throw new Error('CDN-V API request failed');
        }
    }

    generateCDNVResponse(query, filters, page) {
        // Simulate CDN-V API response structure
        const images = [];
        const baseImageCount = 100;
        const perPage = this.isMobile ? 15 : 20;
        
        // Generate realistic image data from CDN-V
        for (let i = 1; i <= perPage; i++) {
            const imageId = ((page - 1) * perPage) + i;
            if (imageId > baseImageCount) break;

            // Simulate filtering
            let category = 'general';
            if (filters.category) {
                category = filters.category;
            } else {
                const categories = ['nature', 'technology', 'people', 'animals', 'architecture', 'food', 'travel', 'business'];
                category = categories[Math.floor(Math.random() * categories.length)];
            }

            // Filter by query
            if (query && !category.includes(query.toLowerCase()) && !this.getVietnameseCategory(category).includes(query.toLowerCase())) {
                continue;
            }

            const orientation = filters.orientation || ['horizontal', 'vertical', 'square'][Math.floor(Math.random() * 3)];
            const width = orientation === 'horizontal' ? 1920 : orientation === 'vertical' ? 1080 : 1080;
            const height = orientation === 'horizontal' ? 1080 : orientation === 'vertical' ? 1920 : 1080;

            images.push({
                id: imageId,
                title: `${this.getVietnameseCategory(category)} tuyệt đẹp ${imageId}`,
                description: `Hình ảnh ${this.getVietnameseCategory(category)} chất lượng cao từ CDN-V. Phù hợp cho các dự án thiết kế và nội dung sáng tạo.`,
                thumbnail: `https://picsum.photos/400/300?random=${imageId}&category=${category}`,
                fullSize: `https://picsum.photos/${width}/${height}?random=${imageId}&category=${category}`,
                cdnUrl: `https://cdn-v.atwebpages.com/images/${category}/${imageId}.jpg`,
                category: category,
                orientation: orientation,
                size: `${width}x${height}`,
                type: 'JPEG',
                tags: [this.getVietnameseCategory(category), orientation === 'horizontal' ? 'ngang' : orientation === 'vertical' ? 'dọc' : 'vuông', 'chất lượng cao', 'CDN-V'],
                source: 'CDN-V',
                author: `Nhiếp ảnh gia ${Math.floor(Math.random() * 50) + 1}`,
                downloads: Math.floor(Math.random() * 10000),
                likes: Math.floor(Math.random() * 5000),
                views: Math.floor(Math.random() * 50000),
                uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                fileSize: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 99)}MB`
            });
        }

        const totalResults = this.estimateTotalResults(query, filters);
        const totalPages = Math.ceil(totalResults / perPage);

        return {
            images: images,
            total: totalResults,
            page: page,
            totalPages: totalPages,
            hasMore: page < totalPages,
            source: 'CDN-V API',
            apiVersion: '1.0',
            responseTime: Math.floor(Math.random() * 500) + 200
        };
    }

    getVietnameseCategory(category) {
        const translations = {
            nature: 'thiên nhiên',
            technology: 'công nghệ',
            people: 'con người',
            animals: 'động vật',
            architecture: 'kiến trúc',
            food: 'ẩm thực',
            travel: 'du lịch',
            business: 'kinh doanh',
            general: 'tổng hợp'
        };
        return translations[category] || category;
    }

    estimateTotalResults(query, filters) {
        let base = 1000;
        
        if (query) base *= 0.6;
        if (filters.category) base *= 0.4;
        if (filters.orientation) base *= 0.7;
        if (filters.size) base *= 0.8;
        
        return Math.floor(Math.random() * base) + Math.floor(base * 0.1);
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const imageGrid = document.getElementById('imageGrid');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');

        // Update results info
        resultsTitle.textContent = this.currentQuery ? 
            `Kết quả cho "${this.currentQuery}"` : 'Hình ảnh thịnh hành';
        resultsCount.textContent = `${results.total.toLocaleString('vi-VN')} kết quả`;

        // Clear previous results
        imageGrid.innerHTML = '';

        // Add current view class
        imageGrid.className = `image-grid ${this.currentView === 'list' ? 'list-view' : ''}`;

        // Render images with lazy loading
        this.renderImages(results.images, imageGrid);

        // Update pagination
        this.totalPages = results.totalPages;
        this.updatePagination();

        // Update load more button
        this.updateLoadMoreButton();

        // Show results section
        resultsSection.style.display = 'block';

        // Smooth scroll to results on mobile
        if (this.isMobile) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    appendResults(results) {
        const imageGrid = document.getElementById('imageGrid');
        this.renderImages(results.images, imageGrid, true);
        this.updateLoadMoreButton();
        this.updatePagination();
    }

    renderImages(images, container, append = false) {
        if (!append) {
            container.innerHTML = '';
        }

        images.forEach((image, index) => {
            const imageElement = this.createImageElement(image);
            
            // Add animation delay for better UX
            if (!append) {
                imageElement.style.animationDelay = `${index * 0.1}s`;
                imageElement.classList.add('fade-in');
            }
            
            container.appendChild(imageElement);

            // Setup intersection observer for lazy loading
            if ('IntersectionObserver' in window) {
                this.setupLazyLoading(imageElement);
            }
        });
    }

    createImageElement(image) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        
        // Use data attributes for lazy loading
        imageItem.innerHTML = `
            <div class="image-wrapper">
                <img data-src="${image.thumbnail}" alt="${image.title}" loading="lazy" class="lazy-image">
                <div class="image-overlay">
                    <div style="color: white;">
                        <h5>${image.title}</h5>
                        <p>${image.size} • ${image.fileSize}</p>
                        <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                            <span><i class="fas fa-eye"></i> ${image.views.toLocaleString('vi-VN')}</span>
                            <span><i class="fas fa-download"></i> ${image.downloads.toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="image-info">
                <h4>${image.title}</h4>
                <p>${image.description}</p>
                <div class="image-meta" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="font-size: 0.8rem; color: #888;">
                        <i class="fas fa-user"></i> ${image.author}
                    </span>
                    <span style="font-size: 0.8rem; color: #888;">
                        <i class="fas fa-heart"></i> ${image.likes.toLocaleString('vi-VN')}
                    </span>
                </div>
                <div class="image-tags">
                    ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // Add click handler
        imageItem.addEventListener('click', () => {
            this.openModal(image);
        });

        // Add touch feedback for mobile
        if (this.isMobile) {
            imageItem.addEventListener('touchstart', () => {
                imageItem.style.transform = 'scale(0.98)';
            });

            imageItem.addEventListener('touchend', () => {
                imageItem.style.transform = '';
            });
        }

        return imageItem;
    }

    setupLazyLoading(imageElement) {
        const lazyImage = imageElement.querySelector('.lazy-image');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-image');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        imageObserver.observe(lazyImage);
    }

    openModal(image) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalSize = document.getElementById('modalSize');
        const modalType = document.getElementById('modalType');
        const modalTags = document.getElementById('modalTags');
        const modalSource = document.getElementById('modalSource');

        // Reset zoom
        this.resetZoom();

        // Set modal content
        modalImage.src = image.fullSize;
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        modalDescription.textContent = image.description;
        modalSize.textContent = image.size;
        modalType.textContent = image.type;
        modalTags.textContent = image.tags.join(', ');
        modalSource.textContent = image.source;

        // Add metadata
        const metadataHTML = `
            <div class="detail-item">
                <span class="detail-label">Tác giả:</span>
                <span>${image.author}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Lượt xem:</span>
                <span>${image.views.toLocaleString('vi-VN')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Lượt tải:</span>
                <span>${image.downloads.toLocaleString('vi-VN')}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Kích thước file:</span>
                <span>${image.fileSize}</span>
            </div>
        `;

        const modalDetails = document.querySelector('.modal-details');
        if (modalDetails) {
            modalDetails.innerHTML = modalDetails.innerHTML + metadataHTML;
        }

        // Store current image for actions
        this.currentModalImage = image;

        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Track view analytics
        this.trackImageView(image);
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentModalImage = null;
        this.resetZoom();
    }

    downloadImage() {
        if (!this.currentModalImage) return;

        // Use CDN-V URL if available, otherwise fallback to full size
        const downloadUrl = this.currentModalImage.cdnUrl || this.currentModalImage.fullSize;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${this.currentModalImage.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Đang tải xuống hình ảnh...', 'success');
        this.trackImageDownload(this.currentModalImage);
    }

    shareImage() {
        if (!this.currentModalImage) return;

        const shareData = {
            title: this.currentModalImage.title,
            text: this.currentModalImage.description,
            url: window.location.href + `?image=${this.currentModalImage.id}`
        };

        if (navigator.share && this.isMobile) {
            navigator.share(shareData).then(() => {
                this.showToast('Đã chia sẻ thành công!', 'success');
            }).catch(() => {
                this.copyImageLink();
            });
        } else {
            this.copyImageLink();
        }
    }

    copyImageLink() {
        if (!this.currentModalImage) return;

        const imageUrl = this.currentModalImage.cdnUrl || this.currentModalImage.fullSize;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(imageUrl).then(() => {
                this.showToast('Đã sao chép link hình ảnh!', 'success');
            }).catch(() => {
                this.showToast('Không thể sao chép link.', 'error');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = imageUrl;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showToast('Đã sao chép link hình ảnh!', 'success');
            } catch (err) {
                this.showToast('Không thể sao chép link.', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    toggleView(view) {
        this.currentView = view;
        
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === view) {
                btn.classList.add('active');
            }
        });

        const imageGrid = document.getElementById('imageGrid');
        if (view === 'list') {
            imageGrid.classList.add('list-view');
        } else {
            imageGrid.classList.remove('list-view');
        }

        // Save preference
        localStorage.setItem('imageSearchView', view);
    }

    updatePagination() {
        if (this.isMobile) {
            // Hide pagination on mobile, use load more instead
            const pagination = document.getElementById('pagination');
            if (pagination) {
                pagination.style.display = 'none';
            }
            return;
        }

        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (this.totalPages <= 1) return;

        // Previous button
        const prevBtn = this.createPageButton('‹ Trước', this.currentPage - 1, this.currentPage === 1);
        pagination.appendChild(prevBtn);

        // Page numbers (simplified for mobile)
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, this.currentPage + 2);

        if (startPage > 1) {
            pagination.appendChild(this.createPageButton('1', 1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pagination.appendChild(ellipsis);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = this.createPageButton(i.toString(), i, false, i === this.currentPage);
            pagination.appendChild(pageBtn);
        }

        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'page-ellipsis';
                pagination.appendChild(ellipsis);
            }
            pagination.appendChild(this.createPageButton(this.totalPages.toString(), this.totalPages));
        }

        // Next button
        const nextBtn = this.createPageButton('Sau ›', this.currentPage + 1, this.currentPage === this.totalPages);
        pagination.appendChild(nextBtn);
    }

    updateLoadMoreButton() {
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (!this.isMobile || !loadMoreContainer) return;

        if (this.currentPage < this.totalPages) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }

    createPageButton(text, page, disabled = false, active = false) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = `page-btn ${active ? 'active' : ''}`;
        button.disabled = disabled;

        if (!disabled) {
            button.addEventListener('click', () => {
                this.goToPage(page);
            });
        }

        return button;
    }

    async goToPage(page) {
        if (page === this.currentPage || this.isLoading) return;

        this.currentPage = page;
        this.showLoading();

        try {
            const results = await this.searchCDNVImages(this.currentQuery, this.currentFilters, page);
            this.displayResults(results);
            this.loadedPages.add(page);

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            this.showError('Không thể tải trang. Vui lòng thử lại.');
        } finally {
            this.hideLoading();
        }
    }

    handleNavigation(section) {
        const navLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === section) {
                link.classList.add('active');
            }
        });

        switch (section) {
            case 'search':
                document.getElementById('searchInput').focus();
                break;
            case 'categories':
                this.showCategories();
                break;
            case 'trending':
                this.loadTrendingImages();
                break;
            case 'about':
                this.showAbout();
                break;
        }
    }

    showCategories() {
        const categories = ['thiên nhiên', 'công nghệ', 'kiến trúc', 'ẩm thực', 'du lịch', 'động vật'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        const searchInput = document.getElementById('searchInput');
        searchInput.value = randomCategory;
        this.performSearch();
    }

    async loadTrendingImages() {
        this.showLoading();
        try {
            const results = await this.searchCDNVImages('', {}, 1);
            this.displayResults(results);
        } catch (error) {
            this.showError('Không thể tải hình ảnh thịnh hành.');
        } finally {
            this.hideLoading();
        }
    }

    showAbout() {
        const aboutText = `
            ImageSearch - Ứng dụng tìm kiếm hình ảnh tuyệt đẹp
            
            🌟 Tính năng:
            • Tìm kiếm trong hàng triệu hình ảnh từ CDN-V
            • Giao diện thân thiện với mobile
            • Tải xuống và chia sẻ dễ dàng
            • Lọc theo danh mục và kích thước
            
            📱 Tối ưu cho mobile với:
            • Touch gestures cho zoom và swipe
            • Infinite scroll
            • PWA support
            • Offline caching
            
            🚀 Powered by CDN-V API
        `;
        
        this.showToast(aboutText, 'info');
    }

    showLoading() {
        this.isLoading = true;
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsSection = document.getElementById('resultsSection');
        
        loadingSpinner.style.display = 'block';
        if (this.currentPage === 1) {
            resultsSection.style.display = 'none';
        }
    }

    hideLoading() {
        this.isLoading = false;
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
    }

    showLoadMoreLoading() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
            loadMoreBtn.disabled = true;
        }
    }

    hideLoadMoreLoading() {
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Tải thêm';
            loadMoreBtn.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    refreshImageGrid() {
        const imageGrid = document.getElementById('imageGrid');
        if (imageGrid) {
            // Trigger reflow for better responsive behavior
            imageGrid.style.display = 'none';
            imageGrid.offsetHeight; // Trigger reflow
            imageGrid.style.display = 'grid';
        }
    }

    // Analytics and tracking
    trackImageView(image) {
        // Track image view for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'image_view', {
                'image_id': image.id,
                'image_category': image.category,
                'image_source': image.source
            });
        }
    }

    trackImageDownload(image) {
        // Track image download for analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'image_download', {
                'image_id': image.id,
                'image_category': image.category,
                'image_source': image.source
            });
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageSearchApp();
});

// Add fade-in animation CSS
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        animation: fadeInUp 0.6s ease forwards;
        opacity: 0;
        transform: translateY(20px);
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .lazy-image {
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .lazy-image.loaded {
        opacity: 1;
    }

    .modal-image-container img {
        transition: transform 0.3s ease;
        cursor: grab;
    }

    .modal-image-container img:active {
        cursor: grabbing;
    }
`;
document.head.appendChild(style);