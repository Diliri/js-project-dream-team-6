const themeToggleCheckbox = document.querySelector('.switch .input');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-theme');
  themeToggleCheckbox.checked = true;
}

themeToggleCheckbox.addEventListener('change', event => {
  if (event.target.checked) {
    document.body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  }
});
