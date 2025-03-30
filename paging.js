let memory = [];
let pageSize = 0;

document.getElementById('initMemory').addEventListener('click', () => {
    const memorySize = parseInt(document.getElementById('memorySize').value);
    pageSize = parseInt(document.getElementById('pageSize').value);
    memory = new Array(Math.ceil(memorySize / pageSize)).fill(null);
    displayOutput("Memory initialized with " + memory.length + " pages.");
});

document.getElementById('simulatePaging').addEventListener('click', () => {
    const pageRequests = document
        .getElementById('pageRequests')
        .value.split(',')
        .map(Number);
    simulatePaging(pageRequests);
});

function simulatePaging(requests) {
    let pageFaults = 0;
    requests.forEach((page) => {
        if (!memory.includes(page)) {
            pageFaults++;
            memory.shift();
            memory.push(page);
        }
    });
    displayOutput(`Page Faults: ${pageFaults}`);
}

function displayOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<p>${message}</p>`;
}
