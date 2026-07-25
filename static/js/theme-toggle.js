(function () {
  var btn = document.getElementById('theme-toggle');
  var html = document.documentElement;
  function applyTheme(dark) {
    html.classList.toggle('dark', dark);
    html.classList.toggle('light', !dark);
    btn.textContent = dark ? '☀' : '☾';
  }
  applyTheme(html.classList.contains('dark'));
  btn.addEventListener('click', function () {
    var nowDark = !html.classList.contains('dark');
    localStorage.setItem('theme', nowDark ? 'dark' : 'light');
    applyTheme(nowDark);
  });
})();
