/**
 * DEKROYSHOP - Standalone Static Frontend Engine
 * Powered by pure JavaScript, Three.js & Client-Side Data Store
 * Supports GitHub Pages, Static Hosting, & Direct Browser Execution
 */

(function() {
    'use strict';

    // State
    const allProducts = window.DEKROY_PRODUCTS || [];
    let currentCategory = 'hero';
    let currentSearch = '';
    let currentPriceFilter = 'all';
    let currentSort = 'price_asc';
    let currentPage = 1;
    const perPage = 50;

    // DOM Elements
    const gridEl = document.getElementById('productGrid');
    const paginationEl = document.getElementById('paginationWrap');
    const searchInput = document.getElementById('searchInput');
    const priceFilterPills = document.querySelectorAll('.fn-filter-pills .fn-pill-btn');
    const sortSelect = document.getElementById('sortSelect');
    const categoryButtons = document.querySelectorAll('.fn-cat-btn');

    // Category count badges
    function updateCategoryCounts() {
        const counts = {};
        allProducts.forEach(p => {
            counts[p.catSlug] = (counts[p.catSlug] || 0) + 1;
        });

        categoryButtons.forEach(btn => {
            const cat = btn.dataset.cat;
            const count = counts[cat] || 0;
            const labelEl = btn.querySelector('.fn-cat-label');
            if (labelEl) {
                const baseName = cat.toUpperCase();
                labelEl.innerHTML = `${baseName} <span style="font-size:9.5px; opacity:0.75;">(${count})</span>`;
            }
        });
    }

    // Filter & Sort Logic
    function getFilteredProducts() {
        return allProducts.filter(p => {
            // Category filter
            if (currentCategory && p.catSlug !== currentCategory) {
                return false;
            }
            // Search filter
            if (currentSearch) {
                const q = currentSearch.toLowerCase();
                const nameMatch = (p.name || '').toLowerCase().includes(q);
                const codeMatch = (p.code || '').toLowerCase().includes(q);
                if (!nameMatch && !codeMatch) return false;
            }
            // Price filter
            if (currentPriceFilter === '15' && p.price !== 15) return false;
            if (currentPriceFilter === '20' && p.price !== 20) return false;

            return true;
        }).sort((a, b) => {
            if (currentSort === 'price_asc') {
                if (a.price !== b.price) return a.price - b.price;
                return b.id - a.id;
            } else if (currentSort === 'price_desc') {
                if (a.price !== b.price) return b.price - a.price;
                return b.id - a.id;
            } else if (currentSort === 'name_asc') {
                return a.name.localeCompare(b.name);
            } else {
                return b.id - a.id;
            }
        });
    }

    // Render Grid
    function renderGrid() {
        if (!gridEl) return;

        const filtered = getFilteredProducts();
        const totalItems = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
        if (currentPage > totalPages) currentPage = totalPages;

        const startIdx = (currentPage - 1) * perPage;
        const pageItems = filtered.slice(startIdx, startIdx + perPage);

        if (pageItems.length === 0) {
            gridEl.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #0b1329; border: 1px solid rgba(59,130,246,0.2); border-radius: 12px;">
                    <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
                    <h3 style="color: #ffffff; font-size: 18px; margin-bottom: 8px;">ไม่พบไอเทมที่ค้นหา</h3>
                    <p style="color: #94a3b8; font-size: 13px;">ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูครับ</p>
                </div>
            `;
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        let html = '';
        pageItems.forEach(item => {
            const isSale = (item.price < item.origPrice || item.price === 15);
            const priceHtml = isSale
                ? `<span class="fn-price-current sale">฿${Math.round(item.price)}</span><span class="fn-price-original">฿${Math.round(item.origPrice)}</span>`
                : `<span class="fn-price-current">฿${Math.round(item.price)}</span>`;

            const saleBadge = isSale ? `<span class="fn-badge-sale">🔥 SALE 15.-</span>` : '';
            const paddedId = String(item.id).padStart(6, '0');

            html += `
                <article class="fn-card rarity-${escapeHtml(item.catSlug)}"
                         data-id="${item.id}"
                         data-name="${escapeHtml(item.name)}"
                         data-code="${escapeHtml(item.code)}"
                         data-price="${item.price}"
                         data-orig-price="${item.origPrice}"
                         data-category="${escapeHtml(item.category)}"
                         data-cat-slug="${escapeHtml(item.catSlug)}"
                         onclick="openFullBody3DModal('${escapeHtml(item.code)}', '${escapeHtml(item.name)}', ${item.id})"
                         tabindex="0"
                         role="button">
                    <div class="fn-card-visual">
                        <div class="fn-card-top-badges">
                            <span class="fn-badge-stock"><span class="stock-dot">●</span> พร้อมส่ง</span>
                            ${saleBadge}
                        </div>
                        <button type="button" class="fn-badge-3d" onclick="openFullBody3DModal('${escapeHtml(item.code)}', '${escapeHtml(item.name)}', ${item.id}); event.stopPropagation();" title="หมุนโมเดล 3D แบบเต็มตัว">
                            <span class="icon">🔄</span> หมุน 3D
                        </button>
                        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" class="fn-card-img ${item.catSlug === 'hero' ? 'hero-card-zoom' : ''}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/no-image.svg'">
                    </div>
                    <div class="fn-card-body">
                        <div class="fn-card-meta-row">
                            <span class="fn-card-subtag">${escapeHtml(item.subtag || item.name)}</span>
                            <span class="fn-card-item-id">#${paddedId}</span>
                        </div>
                        <h3 class="fn-card-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</h3>
                        <div class="fn-card-pricing">
                            ${priceHtml}
                        </div>
                    </div>
                </article>
            `;
        });

        gridEl.innerHTML = html;
        renderPagination(totalPages);
    }

    // Render Pagination
    function renderPagination(totalPages) {
        if (!paginationEl || totalPages <= 1) {
            if (paginationEl) paginationEl.innerHTML = '';
            return;
        }

        let html = '<div class="fn-pagination">';
        if (currentPage > 1) {
            html += `<button type="button" class="fn-page-link" onclick="window.goToPage(${currentPage - 1})">&laquo; ก่อนหน้า</button>`;
        }

        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            html += `<button type="button" class="fn-page-link" onclick="window.goToPage(1)">1</button>`;
            if (startPage > 2) html += `<span class="fn-page-ellipsis">...</span>`;
        }

        for (let p = startPage; p <= endPage; p++) {
            const activeClass = (p === currentPage) ? 'active' : '';
            html += `<button type="button" class="fn-page-link ${activeClass}" onclick="window.goToPage(${p})">${p}</button>`;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) html += `<span class="fn-page-ellipsis">...</span>`;
            html += `<button type="button" class="fn-page-link" onclick="window.goToPage(${totalPages})">${totalPages}</button>`;
        }

        if (currentPage < totalPages) {
            html += `<button type="button" class="fn-page-link" onclick="window.goToPage(${currentPage + 1})">ถัดไป &raquo;</button>`;
        }

        html += '</div>';
        paginationEl.innerHTML = html;
    }

    window.goToPage = function(p) {
        currentPage = p;
        renderGrid();
        window.scrollTo({ top: document.querySelector('.fn-category-bar-wrapper')?.offsetTop - 80 || 0, behavior: 'smooth' });
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Init Events
    function init() {
        updateCategoryCounts();
        renderGrid();

        // Category clicks
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.dataset.cat;
                currentPage = 1;
                renderGrid();
            });
        });

        // Search
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    currentSearch = e.target.value.trim();
                    currentPage = 1;
                    renderGrid();
                }, 200);
            });
        }

        // Price Filter Pills
        priceFilterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                priceFilterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                currentPriceFilter = pill.dataset.price;
                currentPage = 1;
                renderGrid();
            });
        });

        // Sort Select
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                currentSort = e.target.value;
                renderGrid();
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
