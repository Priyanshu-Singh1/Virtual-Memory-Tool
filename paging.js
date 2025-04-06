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

function simulatePagingLRU(requests) {
    let pageFaults = 0;
    let memory = [];
    const capacity = Math.ceil(parseInt(document.getElementById('memorySize').value) / pageSize);

    requests.forEach(page => {
        if (!memory.includes(page)) {
            if (memory.length >= capacity) {
                memory.shift(); // Remove least recently used page
            }
            memory.push(page);
            pageFaults++;
        } else {
            memory.splice(memory.indexOf(page), 1);
            memory.push(page);
        }
    });

    displayOutput(`Page Faults (LRU): ${pageFaults}`);
}

function simulatePagingOptimal(requests) {
    let pageFaults = 0;
    let memory = [];
    const capacity = Math.ceil(parseInt(document.getElementById('memorySize').value) / pageSize);

    requests.forEach((page, index) => {
        if (!memory.includes(page)) {
            if (memory.length >= capacity) {
                let farthest = -1;
                let replaceIndex = -1;

                memory.forEach((memPage, i) => {
                    const nextIndex = requests.slice(index + 1).indexOf(memPage);
                    if (nextIndex === -1 || nextIndex > farthest) {
                        farthest = nextIndex;
                        replaceIndex = i;
                    }
                });

                memory.splice(replaceIndex, 1);
            }
            memory.push(page);
            pageFaults++;
        }
    });

    displayOutput(`Page Faults (Optimal): ${pageFaults}`);
}

function displayOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<p>${message}</p>`;
}
