async function fetchDoc(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            console.error(`Error load file: ${response.statusText}`);
            return;
        }
        return new Promise(resolve => resolve(response.text()));
    } catch (error) {
        console.error("Error:", error);
    }
}