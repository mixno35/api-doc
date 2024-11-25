function parseApiValue(str) {
    return str.replace(/{{(.*?)}}/g, (match, key) => {
        if (base[key]) return base[key]; else return match;
    });
}

function parseApiType(type) {
    if (type === "s" || type === "str") {
        return "string";
    } else if (type === "i" || type === "int") {
        return "integer";
    } else if (type === "f") {
        return "float";
    } else if (type === "d") {
        return "double";
    } else if (type === "b" || type === "bool") {
        return "boolean";
    } else if (type === "a" || type === "arr") {
        return "array";
    } else if (type === "m" || type === "mix") {
        return "mixed";
    } else {
        return type;
    }
}

function parseClassApiCode(code) {
    if (code >= 400) {
        return "status-red";
    } if (code >= 300) {
        return "status-yellow";
    } if (code >= 200) {
        return "status-green";
    } return "";
}

function parseFormatJSON(jsonString) {
    try {
        const jsonObj = JSON.parse(jsonString);
        return JSON.stringify(jsonObj, null, 4);
    } catch (error) {
        return `Invalid JSON: ${error.message}`;
    }
}

function parseApiDocumentation(xmlString) {
    const containerMain = document.querySelector("section#section-for-documentation");
    const navigationMain = document.querySelector("nav#navigation-for-documentation");

    if (!containerMain) {
        console.error("Section container not exist!");
        return;
    }

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const parserError = xmlDoc.getElementsByTagName("parsererror");
    if (parserError.length > 0) {
        console.error("Error parsing XML:", parserError[0].textContent);
        return;
    }

    const apis = xmlDoc.querySelectorAll("api");
    apis.forEach(api => {
        const infoApi = {
            name: parseApiValue(tr(String(api.querySelector("name").textContent ?? ""))),
            description: parseApiValue(tr(String(api.querySelector("description").textContent ?? ""))),
            url: parseApiValue(tr(String(api.querySelector("url").textContent ?? "")))
        };

        const itemUniqueID = "container-" + window.crypto.randomUUID();

        const container = document.createElement("div");
        container.classList.add("documentation");
        container.id = itemUniqueID;

        const headerApi = document.createElement("article");
        headerApi.classList.add("header");

        const nameApi = document.createElement("h3");
        nameApi.innerText = infoApi.name;

        const descriptionApi = document.createElement("span");
        descriptionApi.classList.add("description");
        descriptionApi.innerText = infoApi.description;

        headerApi.appendChild(nameApi)
        headerApi.appendChild(descriptionApi);

        container.appendChild(headerApi);

        const endpoints = api.querySelectorAll("endpoint");
        if (endpoints.length > 0) {
            const containerEndpoints = document.createElement("div");
            containerEndpoints.classList.add("endpoints");

            if (navigationMain) {
                const navMain = document.createElement("div");

                const headerNav = document.createElement("header");
                headerNav.addEventListener("click", () => {
                    container.scrollIntoView({
                        block: "start",
                        behavior: "smooth"
                    });
                });

                const headerNavTitle = document.createElement("h5");
                headerNavTitle.innerText = infoApi.name;

                const headerMtrlIcon = document.createElement("i");
                headerMtrlIcon.classList.add("bi", "bi-caret-right-fill");

                headerNav.appendChild(headerNavTitle);
                headerNav.appendChild(headerMtrlIcon);

                navMain.appendChild(headerNav);

                navigationMain.appendChild(navMain);
            }

            endpoints.forEach(endpoint => {
                const infoEndpoint = {
                    path: parseApiValue(tr(String(endpoint.querySelector("path").textContent ?? ""))),
                    description: parseApiValue(tr(String(endpoint.querySelector("description").textContent ?? ""))),
                    hint: parseApiValue(tr(String(endpoint.querySelector("hint").textContent ?? ""))),
                };

                const containerEndpoint = document.createElement("div");
                containerEndpoint.classList.add("endpoint");

                const headerEndpoint = document.createElement("article");
                headerEndpoint.classList.add("header");

                const pathEndpoint = document.createElement("h5");
                pathEndpoint.innerText = infoEndpoint.path;

                const descriptionEndpoint = document.createElement("span");
                descriptionEndpoint.classList.add("description");
                descriptionEndpoint.innerText = infoEndpoint.description;

                headerEndpoint.appendChild(pathEndpoint);
                parseMethods();
                headerEndpoint.appendChild(descriptionEndpoint);

                const hintEndpoint = document.createElement("span");
                hintEndpoint.classList.add("hint");
                hintEndpoint.innerHTML = infoEndpoint.hint;

                const containerEndpointContent = document.createElement("section");

                const headers = endpoint.querySelectorAll("header");
                if (headers.length > 0) {
                    const containerHeaders = document.createElement("div");
                    containerHeaders.classList.add("parameters");

                    let text = "";
                    headers.forEach(header => {
                        const infoHeader = {
                            name: parseApiValue(tr(String(header.querySelector("name").textContent ?? ""))),
                            value: parseApiValue(tr(String(header.querySelector("value").textContent ?? ""))),
                            required: Boolean(String(header.querySelector("required").textContent ?? "") === "true")
                        };

                        const containerHeader = document.createElement("div");

                        const value = document.createElement("span");
                        value.classList.add("code");
                        value.innerText = `${infoHeader.name}: ${infoHeader.value}`;

                        const required = document.createElement("span");
                        required.classList.add("required", "code");
                        required.innerText = `[${tr("text_required").toLowerCase()}]`;

                        containerHeader.appendChild(value);
                        if (infoHeader.required) {
                            containerHeader.appendChild(required);
                        }

                        containerHeaders.appendChild(containerHeader);
                    });

                    parseEndpointContents(tr("text_headers"), containerHeaders);
                }

                const parameters = endpoint.querySelectorAll("parameter");
                if (parameters.length > 0) {
                    const containerParameters = document.createElement("div");
                    containerParameters.classList.add("parameters");

                    parameters.forEach(parameter => {
                        const infoParameter = {
                            name: parseApiValue(tr(String(parameter.querySelector("name").textContent ?? ""))),
                            type: parseApiType(String(parameter.querySelector("type").textContent ?? "")).toLowerCase(),
                            description: parseApiValue(tr(String(parameter.querySelector("description").textContent ?? ""))),
                            example: parseApiValue(tr(String(parameter.querySelector("example").textContent ?? ""))),
                            required: Boolean(String(parameter.querySelector("required").textContent ?? "") === "true")
                        };

                        const containerParameter = document.createElement("div");

                        const name = document.createElement("h5");
                        name.classList.add("code");
                        name.innerText = infoParameter.name;

                        const type = document.createElement("span");
                        type.classList.add("type", "code");
                        type.innerText = infoParameter.type;

                        const description = document.createElement("span");
                        description.classList.add("description", "code");
                        description.innerText = "- " + infoParameter.description;

                        const required = document.createElement("span");
                        required.classList.add("required", "code");
                        required.innerText = `[${tr("text_required").toLowerCase()}]`;

                        containerParameter.appendChild(name);
                        containerParameter.appendChild(type);
                        if (infoParameter.required) {
                            containerParameter.appendChild(required);
                        }
                        containerParameter.appendChild(description);

                        containerParameters.appendChild(containerParameter);
                    });

                    parseEndpointContents(tr("text_parameters"), containerParameters);
                }

                const responses = endpoint.querySelectorAll("response");
                if (responses.length > 0) {
                    const containerResponses = document.createElement("div");
                    containerResponses.classList.add("responses");

                    responses.forEach(response => {
                        const infoResponse = {
                            status: Number(response.querySelector("status").textContent ?? 0),
                            description: parseApiValue(tr(String(response.querySelector("description").textContent ?? ""))),
                            example: String(response.querySelector("example").textContent ?? "")
                        };

                        const container = document.createElement("div");
                        container.classList.add("container");

                        const header = document.createElement("div");
                        header.classList.add("header");

                        const code = document.createElement("span");
                        code.classList.add("code", "status", parseClassApiCode(infoResponse.status));
                        code.innerText = String(infoResponse.status);

                        const description = document.createElement("span");
                        description.classList.add("code", "description");
                        description.innerText = "- " + infoResponse.description;

                        const pre = document.createElement("pre");
                        pre.classList.add("code");

                        const example = document.createElement("code");
                        example.classList.add("code", "language-json");
                        example.textContent = parseFormatJSON(infoResponse.example);

                        pre.appendChild(example);

                        header.appendChild(code);
                        header.appendChild(description);

                        container.appendChild(header);
                        if (infoResponse.example.trim() !== "") container.appendChild(pre);

                        const returns = response.querySelectorAll("return");
                        if (returns.length > 0) {
                            const containerReturns = document.createElement("div");
                            containerReturns.classList.add("parameters", "returns");

                            returns.forEach(r => {
                                const infoR = {
                                    name: parseApiValue(tr(String(r.querySelector("name").textContent ?? ""))),
                                    type: parseApiType(String(r.querySelector("type").textContent ?? "")),
                                    description: parseApiValue(tr(String(r.querySelector("description").textContent ?? "")))
                                };

                                const containerReturn = document.createElement("div");

                                const name = document.createElement("h5");
                                name.classList.add("code");
                                name.innerText = infoR.name;

                                const type = document.createElement("span");
                                type.classList.add("type", "code");
                                type.innerText = infoR.type;

                                const description = document.createElement("span");
                                description.classList.add("description", "code");
                                description.innerText = "- " + infoR.description;

                                containerReturn.appendChild(name);
                                containerReturn.appendChild(type);
                                containerReturn.appendChild(description);

                                containerReturns.appendChild(containerReturn);
                            });

                            container.appendChild(containerReturns);
                        }

                        const dataReturns = response.querySelectorAll("data-return");
                        if (dataReturns.length > 0) {
                            const containerReturns = document.createElement("div");
                            containerReturns.classList.add("parameters", "returns");

                            dataReturns.forEach(r => {
                                const infoR = {
                                    name: parseApiValue(tr(String(r.querySelector("name").textContent ?? ""))),
                                    description: parseApiValue(tr(String(r.querySelector("description").textContent ?? "")))
                                };

                                const containerReturn = document.createElement("div");

                                const name = document.createElement("h5");
                                name.classList.add("code");
                                name.innerText = infoR.name;

                                const description = document.createElement("span");
                                description.classList.add("description", "code");
                                description.innerText = "- " + infoR.description;

                                containerReturn.appendChild(name);
                                containerReturn.appendChild(description);

                                containerReturns.appendChild(containerReturn);
                            });

                            container.appendChild(containerReturns);
                        }

                        containerResponses.appendChild(container);

                        Prism.highlightElement(example);
                    });

                    parseEndpointContents(tr("text_responses"), containerResponses);
                }

                containerEndpoint.appendChild(headerEndpoint);
                containerEndpoint.appendChild(hintEndpoint);
                containerEndpoint.appendChild(containerEndpointContent);

                containerEndpoints.appendChild(containerEndpoint);

                function parseEndpointContents(name, container_content) {
                    const container = document.createElement("article");

                    const title = document.createElement("h4");
                    title.innerText = name;
                    title.addEventListener("click", () => {
                        container.classList.toggle("open");
                    });

                    container.appendChild(title);
                    container.appendChild(container_content);

                    containerEndpointContent.appendChild(container);
                }
                function parseMethods() {
                    const methods = endpoint.querySelectorAll("method");
                    if (methods.length > 0) {
                        methods.forEach(method => {
                            const element = document.createElement("span");
                            element.classList.add("method", "code");
                            element.innerText = tr(parseApiValue(String(method.textContent)));

                            headerEndpoint.appendChild(element);
                        });
                    }
                }
            });
            container.appendChild(containerEndpoints);
        }
        containerMain.appendChild(container);
    });
}