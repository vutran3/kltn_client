export const parsePlanFromHTML = (htmlString) => {
    if (!htmlString) return [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");

    const headers = Array.from(doc.querySelectorAll("h3"));
    const planHeader = headers.find((h) => h.textContent.includes("Kế hoạch"));

    if (!planHeader) return [];

    const parentDiv = planHeader.parentElement;
    const ul = parentDiv.querySelector("ul");

    if (!ul) return [];

    return Array.from(ul.children).map((li, index) => {
        const strongNode = li.querySelector("strong");
        const title = strongNode ? strongNode.textContent : li.firstChild.textContent.trim();

        const subUl = li.querySelector("ul");
        const tasks = subUl
            ? Array.from(subUl.querySelectorAll("li")).map((subLi) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  content: subLi.innerHTML,
                  done: false
              }))
            : [];

        return {
            id: `phase-${index}`,
            title: title.replace(/:$/, ""),
            tasks
        };
    });
};
