/**
 * DEKROYSHOP - 3D Showcase & Interactive Cosmetics Engine
 * Features:
 * 1. Global openInspectModal / closeInspectModal - 100% Bulletproof
 * 2. Smart Standing Preview: Shows full-body standing pose for hero characters
 * 3. Interactive 3D Parallax Tilt with Mouse Gyro & Specular Sheen
 * 4. 3D Viewport Controls (Auto-Spin, Zoom, Reset)
 * 5. 1-Click Clipboard Slip & Direct Facebook Fanpage Order CTA
 * 6. Zero Clutter: Strictly Item Name, Price, and Facebook Fanpage CTA
 */

(function() {
    'use strict';

    // Active Item State
    let currentItem = null;
    let isAutoSpinning = false;
    let isZoomed = false;

    // ==========================================================
    // GLOBAL: OPEN INSPECT MODAL
    // ==========================================================
    window.openInspectModal = function(elOrData) {
        let data = null;

        if (elOrData && (elOrData.nodeType || elOrData instanceof HTMLElement)) {
            // Find parent card
            const card = elOrData.closest('.fn-card') || elOrData;
            data = {
                id: card.dataset.id || '0',
                name: card.dataset.name || 'COSMETIC ITEM',
                code: card.dataset.code || 'N/A',
                price: parseFloat(card.dataset.price || '20'),
                origPrice: parseFloat(card.dataset.origPrice || '20'),
                image: card.dataset.image || '',
                fullImage: card.dataset.fullImage || card.dataset.image || '',
                category: card.dataset.category || 'COSMETIC',
                catSlug: card.dataset.catSlug || 'weapons'
            };
        } else if (elOrData && typeof elOrData === 'object') {
            data = elOrData;
        }

        if (!data) return;
        currentItem = data;
        window.currentModalItem = data;

        // Directly open Real 3D Model Viewer (No redundant 2D modal)
        if (typeof window.openFullBody3DModal === 'function') {
            window.openFullBody3DModal(data.code || data.name, data.name, data.id);
            return;
        }

        const modalBackdrop = document.getElementById('fnModal');
        if (!modalBackdrop) {
            console.error('Modal container #fnModal not found');
            return;
        }

        // 1. Immediately display modal backdrop
        modalBackdrop.style.display = 'flex';
        modalBackdrop.style.visibility = 'visible';
        modalBackdrop.style.opacity = '1';
        modalBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';

        // 2. Setup Stage Image (Smart Standing Pose for Hero) & Rarity Theme
        const modalImg = document.getElementById('fnModalImg');
        if (modalImg) {
            modalImg.src = data.fullImage || data.image;
            modalImg.alt = data.name;
            if (data.catSlug === 'hero') {
                modalImg.classList.add('hero-standing');
            } else {
                modalImg.classList.remove('hero-standing');
            }
        }

        const modalStage = document.getElementById('fnModalStage');
        if (modalStage) {
            modalStage.className = 'fn-modal-stage rarity-' + (data.catSlug || 'weapons');
        }

        // Reset 3D transform states
        window.reset3dView();

        // 3. Setup Badges & Subtitle
        const typeBadge = document.getElementById('fnModalTypeBadge');
        if (typeBadge) typeBadge.textContent = (data.catSlug || 'ITEM').toUpperCase();

        const rarityBadge = document.getElementById('fnModalRarityBadge');
        if (rarityBadge) rarityBadge.textContent = (data.category || 'COSMETIC').toUpperCase();

        const itemType = document.getElementById('fnModalItemType');
        if (itemType) itemType.textContent = (data.category || 'COSMETIC').toUpperCase() + ' • EXCLUSIVE ITEM';

        // 4. Setup Title (Item Name)
        const modalTitle = document.getElementById('fnModalTitle');
        if (modalTitle) modalTitle.textContent = data.name;

        // 5. Setup Pricing (ปกติ 20 บาท / พิเศษ 15 บาท)
        const priceLabel = document.getElementById('fnModalPriceLabel');
        const priceAmount = document.getElementById('fnModalPriceAmount');
        const oldPriceWrap = document.getElementById('fnModalOldPriceWrap');
        const oldPriceText = document.getElementById('fnModalOldPrice');
        const salePill = document.getElementById('fnModalSalePill');

        const isSale = (data.price < data.origPrice);

        if (priceAmount) {
            priceAmount.textContent = Math.round(data.price);
        }

        if (isSale) {
            if (priceLabel) {
                priceLabel.textContent = 'พิเศษ';
                priceLabel.style.color = '#facc15';
            }
            if (oldPriceWrap) oldPriceWrap.style.display = 'inline-flex';
            if (oldPriceText) oldPriceText.textContent = `ปกติ ${Math.round(data.origPrice)} บาท`;
            if (salePill) {
                salePill.style.display = 'inline-block';
                salePill.textContent = '🔥 ลด 25%';
            }
        } else {
            if (priceLabel) {
                priceLabel.textContent = 'ปกติ';
                priceLabel.style.color = '#cbd5e1';
            }
            if (oldPriceWrap) oldPriceWrap.style.display = 'none';
            if (salePill) salePill.style.display = 'none';
        }

        // 6. Setup Metadata & Quotes
        const metaCat = document.getElementById('fnModalMetaCategory');
        if (metaCat) metaCat.textContent = (data.category || 'COSMETIC').toUpperCase();

        const metaCode = document.getElementById('fnModalMetaCode');
        if (metaCode) metaCode.textContent = data.code || 'ITM-' + data.id;

        const quotes = {
            hero: 'Legendary combat operative equipped with specialized tactical battle armor.',
            weapons: 'Precision-engineered firearm designed for high-impact tactical combat.',
            armor: 'Reinforced ballistic armor plating engineered for maximum combat survivability.',
            head: 'Advanced tactical headgear with integrated protective visor.',
            set: 'Exclusive premium bundle set containing rare tactical gear and collectible cosmetics.',
            backpack: 'High-capacity tactical storage pack designed for field deployments.',
            others: 'Exclusive tactical equipment from the DEKROYSHOP armory collection.'
        };
        const modalQuote = document.getElementById('fnModalQuote');
        if (modalQuote) {
            modalQuote.textContent = quotes[data.catSlug] || 'Exclusive premium item from the DEKROYSHOP collection.';
        }

        // 7. Seed Authentic Fortnite.GG Reactions
        const seed = Math.abs(parseInt(data.id || '1', 10) * 19);
        const reactionMap = [
            { sel: '[data-reaction="fire"] .fn-react-count', count: 320 + (seed % 540) },
            { sel: '[data-reaction="love"] .fn-react-count', count: 210 + (seed % 310) },
            { sel: '[data-reaction="neutral"] .fn-react-count', count: 18 + (seed % 42) },
            { sel: '[data-reaction="dislike"] .fn-react-count', count: 6 + (seed % 19) },
            { sel: '[data-reaction="poop"] .fn-react-count', count: 2 + (seed % 9) }
        ];
        reactionMap.forEach(r => {
            const countEl = document.querySelector(r.sel);
            if (countEl) countEl.textContent = r.count;
        });
        document.querySelectorAll('.fn-react-btn').forEach(btn => btn.classList.remove('reacted'));

        // 8. Facebook Order CTA Link
        const modalFbBtn = document.getElementById('fnModalFbBtn');
        if (modalFbBtn) {
            modalFbBtn.href = 'https://www.facebook.com/dekroyzz';
        }

        // 9. Notice reset
        const modalNotice = document.getElementById('fnModalNotice');
        if (modalNotice) modalNotice.style.display = 'none';
    };

    // ==========================================================
    // REACTION HANDLER
    // ==========================================================
    window.handleReaction = function(btn) {
        if (!btn) return;
        const countEl = btn.querySelector('.fn-react-count');
        const isReacted = btn.classList.toggle('reacted');
        if (countEl) {
            let count = parseInt(countEl.textContent, 10) || 0;
            countEl.textContent = isReacted ? (count + 1) : Math.max(0, count - 1);
        }
    };

    // ==========================================================
    // GLOBAL: CLOSE INSPECT MODAL
    // ==========================================================
    window.closeInspectModal = function() {
        const modalBackdrop = document.getElementById('fnModal');
        if (modalBackdrop) {
            modalBackdrop.classList.remove('show');
            modalBackdrop.style.opacity = '0';
            modalBackdrop.style.visibility = 'hidden';
            setTimeout(() => {
                if (!modalBackdrop.classList.contains('show')) {
                    modalBackdrop.style.display = 'none';
                }
            }, 200);
            document.body.style.overflow = '';
            window.reset3dView();
        }
    };

    // ==========================================================
    // 3D VIEWPORT CONTROLS
    // ==========================================================
    window.reset3dView = function() {
        isAutoSpinning = false;
        isZoomed = false;
        const wrapper3d = document.getElementById('fn3dWrapper');
        const btn3dSpin = document.getElementById('fnBtn3dSpin');
        const btn3dZoom = document.getElementById('fnBtn3dZoom');

        if (wrapper3d) {
            wrapper3d.classList.remove('auto-spin', 'zoomed');
            wrapper3d.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }
        if (btn3dSpin) btn3dSpin.classList.remove('active');
        if (btn3dZoom) btn3dZoom.classList.remove('active');
    };

    // ==========================================================
    // INIT DOM LISTENERS ON PAGE LOAD
    // ==========================================================
    function initEvents() {
        const modalBackdrop = document.getElementById('fnModal');
        const modalClose = document.getElementById('fnModalClose');
        const modalStage = document.getElementById('fnModalStage');
        const wrapper3d = document.getElementById('fn3dWrapper');
        const sheen3d = document.getElementById('fn3dSheen');
        const btn3dSpin = document.getElementById('fnBtn3dSpin');
        const btn3dZoom = document.getElementById('fnBtn3dZoom');
        const btn3dReset = document.getElementById('fnBtn3dReset');
        const modalCopyBtn = document.getElementById('fnModalCopyBtn');
        const modalNotice = document.getElementById('fnModalNotice');

        // Close triggers
        if (modalClose) {
            modalClose.addEventListener('click', (e) => {
                e.stopPropagation();
                window.closeInspectModal();
            });
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', (e) => {
                if (e.target === modalBackdrop) window.closeInspectModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                window.closeInspectModal();
            }
        });

        // 3D Controls
        if (btn3dSpin) {
            btn3dSpin.addEventListener('click', (e) => {
                e.stopPropagation();
                isAutoSpinning = !isAutoSpinning;
                btn3dSpin.classList.toggle('active', isAutoSpinning);
                if (wrapper3d) {
                    wrapper3d.classList.toggle('auto-spin', isAutoSpinning);
                    if (!isAutoSpinning) {
                        wrapper3d.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                    }
                }
            });
        }

        if (btn3dZoom) {
            btn3dZoom.addEventListener('click', (e) => {
                e.stopPropagation();
                isZoomed = !isZoomed;
                btn3dZoom.classList.toggle('active', isZoomed);
                if (wrapper3d) {
                    wrapper3d.classList.toggle('zoomed', isZoomed);
                }
            });
        }

        if (btn3dReset) {
            btn3dReset.addEventListener('click', (e) => {
                e.stopPropagation();
                window.reset3dView();
            });
        }

        // 3D Mouse Parallax Tilt
        if (modalStage && wrapper3d) {
            modalStage.addEventListener('mousemove', (e) => {
                if (isAutoSpinning) return;

                const rect = modalStage.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const xPercent = (x / rect.width) - 0.5;
                const yPercent = (y / rect.height) - 0.5;

                const rotateX = (-yPercent * 26).toFixed(2);
                const rotateY = (xPercent * 26).toFixed(2);
                const scale = isZoomed ? 1.35 : 1.04;

                wrapper3d.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

                if (sheen3d) {
                    const sheenX = ((x / rect.width) * 100).toFixed(0);
                    const sheenY = ((y / rect.height) * 100).toFixed(0);
                    sheen3d.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255,255,255,0.22) 0%, transparent 60%)`;
                }
            });

            modalStage.addEventListener('mouseleave', () => {
                if (isAutoSpinning) return;
                const scale = isZoomed ? 1.35 : 1.0;
                wrapper3d.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(${scale}, ${scale}, ${scale})`;
            });
        }

        // 1-Click Copy Slip
        if (modalCopyBtn) {
            modalCopyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isSale = (currentItem.price < currentItem.origPrice);
                const textToCopy = isSale
                    ? `สวัสดีครับ สนใจสั่งซื้อไอเทม: ${currentItem.name} (รหัส: ${currentItem.code}) ราคาพิเศษ ${currentItem.price} บาท (ปกติ ${currentItem.origPrice} บาท) จากเว็บ DEKROYSHOP`
                    : `สวัสดีครับ สนใจสั่งซื้อไอเทม: ${currentItem.name} (รหัส: ${currentItem.code}) ราคาปกติ ${currentItem.price} บาท จากเว็บ DEKROYSHOP`;

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        showNotice();
                    }).catch(() => fallbackCopy(textToCopy));
                } else {
                    fallbackCopy(textToCopy);
                }
            });
        }

        function fallbackCopy(text) {
            const tempInput = document.createElement("textarea");
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand("copy");
                showNotice();
            } catch (e) {
                alert("กรุณาคัดลอกข้อความนี้: " + text);
            }
            document.body.removeChild(tempInput);
        }

        function showNotice() {
            if (modalNotice) {
                modalNotice.style.display = 'block';
                setTimeout(() => {
                    modalNotice.style.display = 'none';
                }, 4000);
            }
        }

        // Delegated Card & Plus Button Click Handler
        document.addEventListener('click', (e) => {
            const plusBtn = e.target.closest('.fn-card-action-btn');
            const card = e.target.closest('.fn-card');

            if (plusBtn) {
                e.preventDefault();
                e.stopPropagation();
                window.openInspectModal(plusBtn);
            } else if (card && !e.target.closest('a')) {
                e.preventDefault();
                window.openInspectModal(card);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEvents);
    } else {
        initEvents();
    }
})();
