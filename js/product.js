/**
 * DEKROYSHOP - Product Detail 3D Inspection & Stepper
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Quantity Stepper
    const btnDec = document.getElementById('btnQtyDec');
    const btnInc = document.getElementById('btnQtyInc');
    const inputQty = document.getElementById('inputQty');

    if (btnDec && btnInc && inputQty) {
        const maxStock = parseInt(inputQty.getAttribute('max') || '999', 10);

        btnDec.addEventListener('click', () => {
            let val = parseInt(inputQty.value, 10) || 1;
            if (val > 1) {
                inputQty.value = val - 1;
            }
        });

        btnInc.addEventListener('click', () => {
            let val = parseInt(inputQty.value, 10) || 1;
            if (val < maxStock) {
                inputQty.value = val + 1;
            }
        });
    }

    // 2. 3D Inspection Chamber Tilt
    const chamber = document.querySelector('.detail-chamber');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && chamber && window.matchMedia('(pointer: fine)').matches) {
        let chamberRaf = null;

        chamber.addEventListener('mousemove', (e) => {
            if (chamberRaf) cancelAnimationFrame(chamberRaf);

            chamberRaf = requestAnimationFrame(() => {
                const rect = chamber.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotX = ((y - centerY) / centerY) * -12;
                const rotY = ((x - centerX) / centerX) * 12;

                chamber.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translate3d(0, -8px, 20px)`;
            });
        });

        chamber.addEventListener('mouseleave', () => {
            if (chamberRaf) cancelAnimationFrame(chamberRaf);
            chamber.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
        });
    }
});
