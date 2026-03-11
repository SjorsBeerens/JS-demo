const vak = document.getElementById('vak');
let size = 100;

function updateVak() {
    vak.style.width = size + 'px';
    vak.style.height = size + 'px';
}

document.getElementById('groterBtn').addEventListener('click', function() {
    size += 20;
    updateVak();
});

document.getElementById('kleinerBtn').addEventListener('click', function() {
    if (size > 20) size -= 20;
    updateVak();
});

updateVak();
