document.getElementById('simulateSegmentation').addEventListener('click', () => {
    const segmentsInput = document.getElementById('segments').value;
    const segments = segmentsInput.split(',').map(seg => {
        const [name, size] = seg.split(':');
        return { name: name.trim(), size: parseInt(size) };
    });
    simulateSegmentation(segments);
});

function simulateSegmentation(segments) {
    let totalMemory = parseInt(document.getElementById('memorySize').value);
    let allocatedMemory = 0;
    let output = '';

    segments.forEach(seg => {
        if (allocatedMemory + seg.size <= totalMemory) {
            allocatedMemory += seg.size;
            output += `Segment ${seg.name} allocated ${seg.size} units.<br>`;
        } else {
            output += `Segment ${seg.name} could not be allocated due to insufficient memory.<br>`;
        }
    });

    output += `Total Allocated Memory: ${allocatedMemory} / ${totalMemory}`;
    displaySegmentationOutput(output);
}

function displaySegmentationOutput(message) {
    const output = document.getElementById('output');
    output.innerHTML = `<p>${message}</p>`;
}
