const languageKey = "ru";
const translate = {
    ru: {
        document_title: "API Документация",

        text_headers: "Заголовки",
        text_parameters: "Параметры",
        text_responses: "Ответы",

        text_required: "Required"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-tr]").forEach(element =>
        element.innerText = tr(element.getAttribute("data-tr")));

    document.querySelector("head").setAttribute("lang", languageKey);
});

function tr(key, language = languageKey) {
    if (translate[language][key]) {
        return translate[language][key];
    } return key;
}