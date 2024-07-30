document.addEventListener("DOMContentLoaded", () => {
    fetchDoc("assets/doc/auth.xml").then(resolve => parseApiDocumentation(resolve));
});