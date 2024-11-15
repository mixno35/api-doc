document.addEventListener("DOMContentLoaded", async () => {
    const docs = [
        "assets/doc/main.xml",
        "assets/doc/auth.xml",
        "assets/doc/user.xml"
    ];

    const timeStampInMs = Date.now();

    for (const doc of docs) {
        try {
            const urlWithTimestamp = `${doc}?v=${timeStampInMs}`;
            const response = await fetchDoc(urlWithTimestamp);
            parseApiDocumentation(response);
        } catch (error) {
            console.error(`Ошибка при загрузке документа ${doc}:`, error);
        }
    }
});