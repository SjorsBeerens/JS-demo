document.getElementById('kleurBtn').addEventListener('click', function() {
    const vak = document.getElementById('vak');
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    vak.style.background = randomColor;
});
