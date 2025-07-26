// Image Search Application
class ImageSearchApp {
    constructor() {
        this.API_BASE_URL = 'https://cdn-v.atwebpages.com/API/view.php';
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentQuery = '';
        this.currentFilters = {};
        this.isLoading = false;
        this.currentView = 'grid';
        
        // Sample data for demonstration (will be replaced with real API data)
        this.sampleImages = this.generateSampleImages();
        
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.loadTrendingImages();
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

        // Filter changes
        const filters = document.querySelectorAll('.filter-select');
        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                this.performSearch();
            });
        });

        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.closest('.view-btn').getAttribute('data-view');
                this.toggleView(view);
            });
        });

        // Modal functionality
        const modal = document.getElementById('imageModal');
        const closeBtn = document.getElementById('closeModal');
        const downloadBtn = document.getElementById('downloadBtn');
        const shareBtn = document.getElementById('shareBtn');

        closeBtn.addEventListener('click', () => {
            this.closeModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        downloadBtn.addEventListener('click', () => {
            this.downloadImage();
        });

        shareBtn.addEventListener('click', () => {
            this.shareImage();
        });

        // Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e.target.textContent.trim());
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    handleSearchInput(value) {
        // Real-time search suggestions could be implemented here
        if (value.length > 2) {
            // Show autocomplete suggestions
            this.showSearchSuggestions(value);
        }
    }

    showSearchSuggestions(query) {
        // This would typically fetch suggestions from the API
        // For now, we'll use predefined suggestions
        const suggestedQueries = [
            'nature photography',
            'technology trends',
            'architectural design',
            'food styling',
            'travel destinations',
            'animal portraits'
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(query.toLowerCase())
        );

        // Update suggestions UI (if implemented)
    }

    async performSearch() {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput.value.trim();
        
        if (!query && !this.hasActiveFilters()) {
            this.showMessage('Please enter a search term or select a filter.');
            return;
        }

        this.currentQuery = query;
        this.currentPage = 1;
        this.collectFilters();
        
        this.showLoading();
        
        try {
            const results = await this.searchImages(query, this.currentFilters, this.currentPage);
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to search images. Please try again.');
            console.error('Search error:', error);
        } finally {
            this.hideLoading();
        }
    }

    collectFilters() {
        this.currentFilters = {
            category: document.getElementById('categoryFilter').value,
            orientation: document.getElementById('orientationFilter').value,
            size: document.getElementById('sizeFilter').value
        };
    }

    hasActiveFilters() {
        return Object.values(this.currentFilters).some(filter => filter !== '');
    }

    async searchImages(query, filters, page = 1) {
        // This method would integrate with the actual CDN-V API
        // For now, we'll simulate API calls and return sample data
        
        const params = new URLSearchParams({
            q: query || 'trending',
            page: page,
            per_page: 20,
            ...filters
        });

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // In a real implementation, this would be:
            // const response = await fetch(`${this.API_BASE_URL}?${params}`);
            // const data = await response.json();
            
            // For demonstration, return filtered sample data
            return this.getFilteredSampleData(query, filters, page);
        } catch (error) {
            throw new Error('API request failed');
        }
    }

    getFilteredSampleData(query, filters, page) {
        let filteredImages = [...this.sampleImages];

        // Filter by query
        if (query) {
            filteredImages = filteredImages.filter(img => 
                img.title.toLowerCase().includes(query.toLowerCase()) ||
                img.description.toLowerCase().includes(query.toLowerCase()) ||
                img.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
            );
        }

        // Filter by category
        if (filters.category) {
            filteredImages = filteredImages.filter(img => 
                img.category.toLowerCase() === filters.category.toLowerCase()
            );
        }

        // Filter by orientation
        if (filters.orientation) {
            filteredImages = filteredImages.filter(img => 
                img.orientation === filters.orientation
            );
        }

        // Pagination
        const perPage = 20;
        const totalResults = filteredImages.length;
        const totalPages = Math.ceil(totalResults / perPage);
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedImages = filteredImages.slice(startIndex, endIndex);

        return {
            images: paginatedImages,
            total: totalResults,
            page: page,
            totalPages: totalPages,
            hasMore: page < totalPages
        };
    }

    displayResults(results) {
        const resultsSection = document.getElementById('resultsSection');
        const imageGrid = document.getElementById('imageGrid');
        const resultsTitle = document.getElementById('resultsTitle');
        const resultsCount = document.getElementById('resultsCount');

        // Update results info
        resultsTitle.textContent = this.currentQuery ? 
            `Results for "${this.currentQuery}"` : 'Trending Images';
        resultsCount.textContent = `${results.total} results found`;

        // Clear previous results
        imageGrid.innerHTML = '';

        // Add current view class
        imageGrid.className = `image-grid ${this.currentView === 'list' ? 'list-view' : ''}`;

        // Render images
        results.images.forEach(image => {
            const imageElement = this.createImageElement(image);
            imageGrid.appendChild(imageElement);
        });

        // Update pagination
        this.totalPages = results.totalPages;
        this.updatePagination();

        // Show results section
        resultsSection.style.display = 'block';

        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    createImageElement(image) {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.innerHTML = `
            <div class="image-wrapper">
                <img src="${image.thumbnail}" alt="${image.title}" loading="lazy">
                <div class="image-overlay">
                    <div style="color: white;">
                        <h5>${image.title}</h5>
                        <p>${image.size}</p>
                    </div>
                </div>
            </div>
            <div class="image-info">
                <h4>${image.title}</h4>
                <p>${image.description}</p>
                <div class="image-tags">
                    ${image.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        imageItem.addEventListener('click', () => {
            this.openModal(image);
        });

        return imageItem;
    }

    openModal(image) {
        const modal = document.getElementById('imageModal');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalSize = document.getElementById('modalSize');
        const modalType = document.getElementById('modalType');
        const modalTags = document.getElementById('modalTags');

        modalImage.src = image.fullSize;
        modalImage.alt = image.title;
        modalTitle.textContent = image.title;
        modalDescription.textContent = image.description;
        modalSize.textContent = image.size;
        modalType.textContent = image.type;
        modalTags.textContent = image.tags.join(', ');

        // Store current image for download/share
        this.currentModalImage = image;

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('imageModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentModalImage = null;
    }

    downloadImage() {
        if (!this.currentModalImage) return;

        const link = document.createElement('a');
        link.href = this.currentModalImage.fullSize;
        link.download = `${this.currentModalImage.title}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    shareImage() {
        if (!this.currentModalImage) return;

        if (navigator.share) {
            navigator.share({
                title: this.currentModalImage.title,
                text: this.currentModalImage.description,
                url: window.location.href
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    this.showMessage('Link copied to clipboard!');
                })
                .catch(() => {
                    this.showMessage('Could not copy link.');
                });
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
    }

    updatePagination() {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = '';

        if (this.totalPages <= 1) return;

        // Previous button
        const prevBtn = this.createPageButton('‹ Previous', this.currentPage - 1, this.currentPage === 1);
        pagination.appendChild(prevBtn);

        // Page numbers
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
        const nextBtn = this.createPageButton('Next ›', this.currentPage + 1, this.currentPage === this.totalPages);
        pagination.appendChild(nextBtn);
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
            const results = await this.searchImages(this.currentQuery, this.currentFilters, page);
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to load page. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    handleNavigation(section) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        event.target.classList.add('active');

        switch (section) {
            case 'Search':
                document.getElementById('searchInput').focus();
                break;
            case 'Categories':
                this.showCategories();
                break;
            case 'Trending':
                this.loadTrendingImages();
                break;
            case 'About':
                this.showAbout();
                break;
        }
    }

    async loadTrendingImages() {
        this.showLoading();
        try {
            const results = await this.searchImages('', {}, 1);
            this.displayResults(results);
        } catch (error) {
            this.showError('Failed to load trending images.');
        } finally {
            this.hideLoading();
        }
    }

    showCategories() {
        // Implementation for showing categories
        const searchInput = document.getElementById('searchInput');
        searchInput.value = '';
        
        // Show popular categories
        const categories = ['nature', 'technology', 'architecture', 'food', 'travel', 'animals'];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        searchInput.value = randomCategory;
        this.performSearch();
    }

    showAbout() {
        alert('ImageSearch - A beautiful image search application powered by CDN-V API. Built with modern web technologies for the best user experience.');
    }

    showLoading() {
        this.isLoading = true;
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsSection = document.getElementById('resultsSection');
        
        loadingSpinner.style.display = 'block';
        resultsSection.style.display = 'none';
    }

    hideLoading() {
        this.isLoading = false;
        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'none';
    }

    showMessage(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showMessage(message);
    }

    generateSampleImages() {
        const categories = ['nature', 'technology', 'architecture', 'food', 'travel', 'animals', 'people', 'business'];
        const orientations = ['horizontal', 'vertical', 'square'];
        const images = [];

        for (let i = 1; i <= 100; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const orientation = orientations[Math.floor(Math.random() * orientations.length)];
            const width = orientation === 'horizontal' ? 1920 : orientation === 'vertical' ? 1080 : 1080;
            const height = orientation === 'horizontal' ? 1080 : orientation === 'vertical' ? 1920 : 1080;

            images.push({
                id: i,
                title: `Beautiful ${category} image ${i}`,
                description: `High-quality ${category} photograph perfect for your projects. Professional ${orientation} composition with excellent lighting and detail.`,
                thumbnail: `https://picsum.photos/400/300?random=${i}`,
                fullSize: `https://picsum.photos/${width}/${height}?random=${i}`,
                category: category,
                orientation: orientation,
                size: `${width}x${height}`,
                type: 'JPEG',
                tags: [category, orientation, 'high-quality', 'professional'],
                author: `Photographer ${Math.floor(Math.random() * 50) + 1}`,
                downloads: Math.floor(Math.random() * 10000),
                likes: Math.floor(Math.random() * 5000)
            });
        }

        return images;
    }
}

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .page-ellipsis {
        color: #666;
        padding: 0.5rem;
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ImageSearchApp();
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}