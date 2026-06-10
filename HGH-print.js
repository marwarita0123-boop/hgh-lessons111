/**
 * HGH-print.js – Exercise page print logic (truly modular)
 *
 * Declare all exercise types as an object:
 *   types: {
 *     '01': 'exercise-type01-container',
 *     '02': 'exercise-type02-container',
 *     '03': 'exercise-type03-container'   // add as many as you want
 *   }
 *
 * The checkboxes in the modal must have id="chkType01", "chkType02", etc.
 */

function HGH_setupExercisePrint(config) {
    const mOverlay    = document.getElementById(config.modalOverlayId || 'pdfModalOverlay');
    const openBtn     = document.getElementById(config.openBtnId || 'openPdfModalBtn');
    const closeBtn    = document.getElementById(config.closeBtnId || 'pdfModalClose');
    const cancelBtn   = document.getElementById(config.cancelBtnId || 'pdfModalCancel');
    const generateBtn = document.getElementById(config.generateBtnId || 'pdfModalGenerate');

    if (!mOverlay || !openBtn || !generateBtn) {
        console.warn('HGH_setupExercisePrint: required modal elements missing.');
        return;
    }

    const types = config.types || {};   // e.g. { '01': 'container-ID', '02': 'container-ID' }

    // ── Modal open / close ──
    function openModal()  { mOverlay.classList.add('active'); }
    function closeModal() { mOverlay.classList.remove('active'); }
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    mOverlay.addEventListener('click', e => { if (e.target === mOverlay) closeModal(); });

    // ── Dynamically inject print CSS to hide containers ──
    Object.keys(types).forEach(key => {
        const styleId = 'print-ex-type-' + key + '-hide';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `@media print { body.no-type-${key} #${types[key]} { display: none !important; } }`;
            document.head.appendChild(style);
        }
    });

    // ── Handle the "Generate" button ──
    generateBtn.addEventListener('click', () => {
        // For each declared type, toggle the hide class based on its checkbox
        Object.keys(types).forEach(key => {
            const chk = document.getElementById('chkType' + key);  // e.g. chkType01
            if (chk) {
                if (!chk.checked) {
                    document.body.classList.add('no-type-' + key);
                } else {
                    document.body.classList.remove('no-type-' + key);
                }
            }
        });

        closeModal();
        setTimeout(() => window.print(), 100);

        // Clean up after print
        function cleanup() {
            Object.keys(types).forEach(key => {
                document.body.classList.remove('no-type-' + key);
            });
        }
        window.addEventListener('afterprint', function after() {
            cleanup();
            window.removeEventListener('afterprint', after);
        });
        setTimeout(cleanup, 5000);
    });
}