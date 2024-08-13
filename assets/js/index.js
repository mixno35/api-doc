document.addEventListener("DOMContentLoaded", () => {
    fetchDoc("assets/doc/auth.xml?v=" + timeStampInMs).then(resolve => parseApiDocumentation(resolve));
});