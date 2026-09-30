/**
 * DEKROYSHOP - Shop Interaction JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    // Auto submit sorting on change
    const sortSelect = document.getElementById('shopSortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const form = sortSelect.closest('form');
            if (form) form.submit();
        });
    }

    // Toggle filter panel on mobile screens
    const toggleFilterBtn = document.getElementById('mobileFilterToggle');
    const filterPanel = document.querySelector('.filter-panel');
    if (toggleFilterBtn && filterPanel) {
        toggleFilterBtn.addEventListener('click', () => {
            const isHidden = window.getComputedStyle(filterPanel).display === 'none';
            filterPanel.style.display = isHidden ? 'block' : 'none';
        });
    }
});
