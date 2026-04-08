const vak = document.getElementById('vak');
const verdwijnBtn = document.getElementById('verdwijnBtn');

// Ensure the element uses the fade utility
vak.classList.add('fade');

verdwijnBtn.addEventListener('click', function() {
    // start fade-out
    vak.classList.add('hidden');

    // after opacity transition ends, remove from flow
    function onTransitionEnd(e) {
        if (e.propertyName === 'opacity') {
            vak.style.display = 'none';
            vak.removeEventListener('transitionend', onTransitionEnd);
        }
    }

    vak.addEventListener('transitionend', onTransitionEnd);
});
