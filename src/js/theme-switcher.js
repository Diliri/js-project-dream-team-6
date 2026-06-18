const themeToggleCheckbox = document.querySelector('.switch .input');

// Перевіряємо, чи взагалі існує чекбокс на цій сторінці
if (themeToggleCheckbox) {
  // Якщо в сховищі вже є темна тема — вмикаємо її відразу
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggleCheckbox.checked = true;
  }

  // Слухаємо перемикання кнопки
  themeToggleCheckbox.addEventListener('change', event => {
    if (event.target.checked) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  });
}
