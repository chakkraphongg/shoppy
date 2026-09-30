/**
 * DEKROYSHOP - Admin Vanilla JavaScript
 * Zero external libraries, high performance
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Sidebar Toggle
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.admin-sidebar');
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 991 && !sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
                sidebar.classList.remove('show');
            }
        });
    }

    // 2. Generic Confirmation Prompts
    document.querySelectorAll('[data-confirm]').forEach(el => {
        el.addEventListener('click', (e) => {
            const message = el.getAttribute('data-confirm') || 'คุณต้องการดำเนินการต่อหรือไม่?';
            if (!confirm(message)) {
                e.preventDefault();
                return false;
            }
        });
    });

    // 3. Image File Upload Preview
    const imageInput = document.getElementById('imageFileInput');
    const imagePreview = document.getElementById('imagePreviewTarget');
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 4. Auto dismiss flash alert after 5 seconds
    const flashAlert = document.querySelector('.alert');
    if (flashAlert) {
        setTimeout(() => {
            flashAlert.style.transition = 'opacity 0.5s ease';
            flashAlert.style.opacity = '0';
            setTimeout(() => flashAlert.remove(), 500);
        }, 5000);
    }
});
