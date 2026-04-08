const demoText = document.getElementById('demo-text');
const changeBtn = document.getElementById('changeBtn');

changeBtn.addEventListener('click', function() {
    // update tekst
    demoText.textContent = 'De tekst is veranderd!';

    // pulse effect: ensure reflow then add class
    if (!demoText.classList.contains('pop')) demoText.classList.add('pop');
    demoText.classList.remove('pulse');
    // force reflow so the animation restarts
    void demoText.offsetWidth;
    demoText.classList.add('pulse');
    // remove pulse after effect
    setTimeout(() => demoText.classList.remove('pulse'), 260);
});
