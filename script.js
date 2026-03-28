const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const demoForms = document.querySelectorAll('[data-demo-form]');
demoForms.forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const output = form.querySelector('[data-form-output]');
    if (output) {
      output.textContent = 'Form placeholder only — connect this to your email platform, form service, or CMS later.';
    }
    form.reset();
  });
});
