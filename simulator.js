class MemorySimulator {
    constructor() {
        this.totalMemoryKB = 64;
        this.pageSizeKB = 4;
        this.processSizeKB = 18;
        this.referenceString = [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5];
        this.frames = [];
        this.pageTable = new Map();
        this.accessHistory = [];
        this.pageFaults = 0;
        this.pageHits = 0;
        this.currentStep = 0;
        this.algorithm = 'lru';
        this.autoRunInterval = null;
        this.processPages = [];
        this.internalFragmentationKB = 0;
        
        this.initElements();
        this.setupEventListeners();
        this.calculateProcessPages();
        this.resetSimulation();
    }

    initElements() {
        this.memorySizeInput = document.getElementById('memorySize');
        this.memorySizeValue = document.getElementById('memorySizeValue');
        this.pageSizeInput = document.getElementById('pageSize');
        this.pageSizeValue = document.getElementById('pageSizeValue');
        this.processSizeInput = document.getElementById('processSize');
        this.processSizeValue = document.getElementById('processSizeValue');
        this.pageCalculationElement = document.getElementById('pageCalculation');
        this.lruBtn = document.getElementById('lruBtn');
        this.optimalBtn = document.getElementById('optimalBtn');
        this.explainBtn = document.getElementById('explainBtn');
        this.prevStepBtn = document.getElementById('prevStep');
        this.nextStepBtn = document.getElementById('nextStep');
        this.autoRunBtn = document.getElementById('autoRun');
        this.resetBtn = document.getElementById('reset');
        this.refStringInput = document.getElementById('refString');
        this.framesContainer = document.getElementById('frames');
        this.pageTableBody = document.querySelector('#pageTable tbody');
        this.sequenceContainer = document.getElementById('sequence');
        this.faultCountElement = document.getElementById('faultCount');
        this.hitRatioElement = document.getElementById('hitRatio');
        this.fragmentationElement = document.getElementById('fragmentation');
        this.currentStepElement = document.getElementById('currentStep');
        this.logContent = document.getElementById('logContent');
        this.fragmentationInfo = document.getElementById('fragmentationInfo');
        this.modal = document.getElementById('explanationModal');
        this.algorithmNameElement = document.getElementById('algorithmName');
        this.algorithmExplanationElement = document.getElementById('algorithmExplanation');
    }

    setupEventListeners() {
        this.memorySizeInput.addEventListener('input', () => {
            this.totalMemoryKB = parseInt(this.memorySizeInput.value);
            this.memorySizeValue.textContent = `${this.totalMemoryKB} KB`;
            this.calculateProcessPages();
            this.resetSimulation();
        });

        this.pageSizeInput.addEventListener('input', () => {
            this.pageSizeKB = parseInt(this.pageSizeInput.value);
            this.pageSizeValue.textContent = `${this.pageSizeKB} KB`;
            this.calculateProcessPages();
            this.resetSimulation();
        });

        this.processSizeInput.addEventListener('input', () => {
            this.processSizeKB = parseInt(this.processSizeInput.value);
            this.processSizeValue.textContent = `${this.processSizeKB} KB`;
            this.calculateProcessPages();
            this.resetSimulation();
        });

        this.lruBtn.addEventListener('click', () => {
            this.setAlgorithm('lru');
            this.lruBtn.classList.add('active');
            this.optimalBtn.classList.remove('active');
        });

        this.optimalBtn.addEventListener('click', () => {
            this.setAlgorithm('optimal');
            this.optimalBtn.classList.add('active');
            this.lruBtn.classList.remove('active');
        });

        this.explainBtn.addEventListener('click', () => this.showAlgorithmExplanation());
        this.prevStepBtn.addEventListener('click', () => this.prevStep());
        this.nextStepBtn.addEventListener('click', () => this.nextStep());
        this.autoRunBtn.addEventListener('click', () => this.toggleAutoRun());
        this.resetBtn.addEventListener('click', () => this.resetSimulation());

        this.refStringInput.addEventListener('change', () => {
            this.referenceString = this.refStringInput.value.split(',').map(Number).filter(n => !isNaN(n));
            this.resetSimulation();
        });

        document.querySelector('.close').addEventListener('click', () => {
            this.modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.modal) {
                this.modal.style.display = 'none';
            }
        });
    }

    calculateProcessPages() {
        const pageCount = Math.ceil(this.processSizeKB / this.pageSizeKB);
        this.internalFragmentationKB = (pageCount * this.pageSizeKB) - this.processSizeKB;
        
        this.processPages = [];
        for (let i = 0; i < pageCount; i++) {
            const remaining = this.processSizeKB - (i * this.pageSizeKB);
            const usedKB = Math.min(this.pageSizeKB, remaining);
            this.processPages.push({
                pageNum: i + 1,
                usedKB: usedKB,
                unusedKB: this.pageSizeKB - usedKB
            });
        }
        
        this.pageCalculationElement.textContent = 
            `Process needs ${pageCount} pages (${pageCount * this.pageSizeKB} KB total, ${this.internalFragmentationKB} KB internal fragmentation)`;
        
        this.updateFragmentationInfo();
    }

    updateFragmentationInfo() {
        this.fragmentationInfo.innerHTML = `
            <p><strong>Internal Fragmentation:</strong> ${this.internalFragmentationKB} KB wasted in last page</p>
            <p>Each page: ${this.pageSizeKB} KB | Process: ${this.processSizeKB} KB</p>
            <p>Pages needed: ${this.processPages.length} (${this.processPages.length * this.pageSizeKB} KB)</p>
        `;
    }

    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }

    resetSimulation() {
        this.stopAutoRun();
        
        // Calculate number of frames based on total memory and page size
        const frameCount = Math.floor(this.totalMemoryKB / this.pageSizeKB);
        this.frames = Array(frameCount).fill(null);
        this.pageTable = new Map();
        this.accessHistory = [];
        this.pageFaults = 0;
        this.pageHits = 0;
        this.currentStep = 0;
        
        // Update UI
        this.updateMetrics();
        this.renderFrames();
        this.renderPageTable();
        this.renderReferenceSequence();
        this.logContent.innerHTML = '';
        
        // Update button states
        this.prevStepBtn.disabled = true;
        this.nextStepBtn.disabled = this.currentStep >= this.referenceString.length;
        this.autoRunBtn.innerHTML = '<i class="fas fa-play"></i> Auto Run';
    }

    nextStep() {
        if (this.currentStep >= this.referenceString.length) return;

        const page = this.referenceString[this.currentStep];
        const frameIndex = this.frames.findIndex(f => f?.pageNum === page);
        let isPageFault = false;
        let replacedPage = null;

        if (frameIndex === -1) {
            // Page fault occurred
            isPageFault = true;
            this.pageFaults++;
            
            // Find a frame to replace
            const replaceIndex = this.findFrameToReplace();
            replacedPage = this.frames[replaceIndex]?.pageNum;
            
            // Update page table
            if (replacedPage !== undefined) {
                this.pageTable.delete(replacedPage);
            }
            
            // Load new page - find the page info from processPages
            const pageInfo = this.processPages.find(p => p.pageNum === page);
            if (pageInfo) {
                this.frames[replaceIndex] = {
                    pageNum: pageInfo.pageNum,
                    usedKB: pageInfo.usedKB,
                    unusedKB: pageInfo.unusedKB,
                    lastUsed: this.currentStep
                };
                this.pageTable.set(page, replaceIndex);
            }
        } else {
            // Page hit - update last used time
            this.pageHits++;
            this.frames[frameIndex].lastUsed = this.currentStep;
        }

        // Record access
        this.accessHistory.push({
            step: this.currentStep,
            page,
            isPageFault,
            replacedPage,
            frames: JSON.parse(JSON.stringify(this.frames)),
            algorithm: this.algorithm
        });

        this.currentStep++;
        
        // Update UI
        this.updateMetrics();
        this.renderFrames(page, isPageFault);
        this.renderPageTable();
        this.renderReferenceSequence();
        this.addLogEntry(page, isPageFault, replacedPage);
        
        // Update button states
        this.prevStepBtn.disabled = false;
        this.nextStepBtn.disabled = this.currentStep >= this.referenceString.length;
    }

    prevStep() {
        if (this.currentStep <= 0) return;

        this.currentStep--;
        const prevState = this.accessHistory.pop();
        
        // Restore previous state
        this.frames = [...prevState.frames];
        this.pageTable = new Map();
        this.frames.forEach((frame, index) => {
            if (frame !== null) this.pageTable.set(frame.pageNum, index);
        });
        
        if (prevState.isPageFault) {
            this.pageFaults--;
        } else {
            this.pageHits--;
        }
        
        // Update UI
        this.updateMetrics();
        this.renderFrames();
        this.renderPageTable();
        this.renderReferenceSequence();
        this.removeLastLogEntry();
        
        // Update button states
        this.prevStepBtn.disabled = this.currentStep <= 0;
        this.nextStepBtn.disabled = false;
    }

    findFrameToReplace() {
        // First try to find an empty frame
        const emptyFrameIndex = this.frames.findIndex(f => f === null);
        if (emptyFrameIndex !== -1) return emptyFrameIndex;

        if (this.algorithm === 'lru') {
            return this.findLRUReplacement();
        } else {
            return this.findOptimalReplacement();
        }
    }

    findLRUReplacement() {
        // Find the least recently used page in memory
        let lruIndex = 0;
        let oldestAccess = this.frames[0].lastUsed;
        
        for (let i = 1; i < this.frames.length; i++) {
            if (this.frames[i].lastUsed < oldestAccess) {
                oldestAccess = this.frames[i].lastUsed;
                lruIndex = i;
            }
        }
        
        return lruIndex;
    }

    findOptimalReplacement() {
        // Find the page that won't be used for the longest time in future
        const futureReferences = this.referenceString.slice(this.currentStep + 1);
        let optimalIndex = 0;
        let furthestUse = -1;
        
        for (let i = 0; i < this.frames.length; i++) {
            const page = this.frames[i].pageNum;
            const nextUseIndex = futureReferences.indexOf(page);
            
            if (nextUseIndex === -1) {
                // This page won't be used again - perfect candidate
                return i;
            } else if (nextUseIndex > furthestUse) {
                furthestUse = nextUseIndex;
                optimalIndex = i;
            }
        }
        
        return optimalIndex;
    }

    toggleAutoRun() {
        if (this.autoRunInterval) {
            this.stopAutoRun();
            this.autoRunBtn.innerHTML = '<i class="fas fa-play"></i> Auto Run';
        } else {
            this.startAutoRun();
            this.autoRunBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        }
    }

    startAutoRun() {
        if (this.currentStep >= this.referenceString.length) {
            this.resetSimulation();
        }
        
        this.autoRunInterval = setInterval(() => {
            this.nextStep();
            if (this.currentStep >= this.referenceString.length) {
                this.stopAutoRun();
                this.autoRunBtn.innerHTML = '<i class="fas fa-play"></i> Auto Run';
            }
        }, 1500);
    }

    stopAutoRun() {
        if (this.autoRunInterval) {
            clearInterval(this.autoRunInterval);
            this.autoRunInterval = null;
        }
    }

    updateMetrics() {
        const totalAccesses = this.pageFaults + this.pageHits;
        const hitRatio = totalAccesses > 0 ? 
            Math.round((this.pageHits / totalAccesses) * 100) : 0;
        
        this.faultCountElement.textContent = this.pageFaults;
        this.hitRatioElement.textContent = `${hitRatio}%`;
        this.currentStepElement.textContent = `${this.currentStep}/${this.referenceString.length}`;
        
        // Calculate total fragmentation (only internal in this simulation)
        this.fragmentationElement.textContent = `${this.internalFragmentationKB} KB`;
    }

    renderFrames(currentPage = null, isPageFault = false) {
        this.framesContainer.innerHTML = '';
        
        this.frames.forEach((frame, index) => {
            const frameElement = document.createElement('div');
            frameElement.className = 'frame';
            frameElement.dataset.frameId = index;
            
            if (frame !== null) {
                frameElement.classList.add('filled');
                
                const header = document.createElement('div');
                header.className = 'frame-header';
                header.textContent = `Frame ${index}`;
                frameElement.appendChild(header);
                
                const content = document.createElement('div');
                content.className = 'frame-content';
                
                const pageNum = document.createElement('div');
                pageNum.className = 'frame-page';
                pageNum.textContent = `Page ${frame.pageNum}`;
                content.appendChild(pageNum);
                
                // Show used and unused portions
                if (frame.unusedKB > 0) {
                    const usedBar = document.createElement('div');
                    usedBar.className = 'frame-used';
                    usedBar.style.width = `${(frame.usedKB / this.pageSizeKB) * 100}%`;
                    usedBar.title = `${frame.usedKB} KB used`;
                    content.appendChild(usedBar);
                    
                    const unusedBar = document.createElement('div');
                    unusedBar.className = 'frame-unused';
                    unusedBar.style.width = `${(frame.unusedKB / this.pageSizeKB) * 100}%`;
                    unusedBar.title = `${frame.unusedKB} KB unused (fragmentation)`;
                    content.appendChild(unusedBar);
                }
                
                frameElement.appendChild(content);
                
                if (currentPage === frame.pageNum) {
                    frameElement.classList.add(isPageFault ? 'fault' : 'hit');
                }
            } else {
                frameElement.textContent = 'Empty Frame';
            }
            
            const frameId = document.createElement('span');
            frameId.className = 'frame-id';
            frameId.textContent = `Frame ${index}`;
            frameElement.appendChild(frameId);
            
            this.framesContainer.appendChild(frameElement);
        });
    }

    renderPageTable() {
        this.pageTableBody.innerHTML = '';
        
        // Create rows for pages in memory
        [...this.pageTable.entries()].forEach(([page, frame]) => {
            const frameData = this.frames[frame];
            const row = document.createElement('tr');
            
            // Find last access time
            const lastAccess = frameData.lastUsed ?? 'Never';
            
            // Find next use (for Optimal)
            let nextUse = 'Never';
            if (this.currentStep < this.referenceString.length) {
                const futureRefs = this.referenceString.slice(this.currentStep + 1);
                const nextUseIndex = futureRefs.indexOf(page);
                if (nextUseIndex !== -1) {
                    nextUse = `Step ${this.currentStep + 1 + nextUseIndex}`;
                }
            }
            
            row.innerHTML = `
                <td>${page}</td>
                <td>${frame}</td>
                <td>${lastAccess === 'Never' ? lastAccess : `Step ${lastAccess}`}</td>
                <td>${nextUse}</td>
                <td>${frameData.usedKB}/${this.pageSizeKB} KB</td>
            `;
            
            this.pageTableBody.appendChild(row);
        });
    }

    renderReferenceSequence() {
        this.sequenceContainer.innerHTML = '';
        
        this.referenceString.forEach((page, index) => {
            const item = document.createElement('div');
            item.className = 'ref-item';
            item.textContent = page;
            
            if (index === this.currentStep) {
                item.classList.add('current');
            } else if (index < this.currentStep) {
                item.classList.add('past');
            }
            
            this.sequenceContainer.appendChild(item);
        });
    }

    addLogEntry(page, isPageFault, replacedPage = null) {
        const entry = document.createElement('div');
        entry.className = `log-entry ${isPageFault ? 'fault' : 'hit'}`;
        
        const time = new Date().toLocaleTimeString();
        if (isPageFault) {
            entry.textContent = `[${time}] Page Fault: Page ${page} loaded`;
            if (replacedPage) {
                entry.textContent += ` (replaced Page ${replacedPage})`;
            }
        } else {
            entry.textContent = `[${time}] Page Hit: Page ${page} accessed`;
        }
        
        this.logContent.prepend(entry);
    }

    removeLastLogEntry() {
        if (this.logContent.firstChild) {
            this.logContent.removeChild(this.logContent.firstChild);
        }
    }

    showAlgorithmExplanation() {
        this.algorithmNameElement.textContent = `${this.algorithm.toUpperCase()} Algorithm Explanation`;
        
        let explanationHTML = '';
        
        if (this.algorithm === 'lru') {
            explanationHTML = `
                <h3>Least Recently Used (LRU) Page Replacement</h3>
                <p>LRU replaces the page that hasn't been used for the longest period of time.</p>
                
                <h4>How it works:</h4>
                <ol>
                    <li>When a page fault occurs, examine all pages currently in memory</li>
                    <li>For each page, check when it was last accessed</li>
                    <li>Select the page with the oldest access time for replacement</li>
                    <li>Load the new page into the freed frame</li>
                </ol>
                
                <h4>Current Memory State:</h4>
                <p>Frames: ${this.frames.map(f => f === null ? 'Empty' : `Page ${f.pageNum}`).join(', ')}</p>
                <p>Last used times: ${this.frames.map(f => f?.lastUsed ?? 'Never').join(', ')}</p>
            `;
        } else {
            explanationHTML = `
                <h3>Optimal Page Replacement</h3>
                <p>Optimal replaces the page that won't be used for the longest time in the future.</p>
                
                <h4>How it works:</h4>
                <ol>
                    <li>When a page fault occurs, examine all pages currently in memory</li>
                    <li>For each page, look ahead in the reference string to find its next use</li>
                    <li>Select the page that either won't be used again or has the furthest next use</li>
                    <li>Load the new page into the freed frame</li>
                </ol>
                
                <h4>Current Memory State:</h4>
                <p>Frames: ${this.frames.map(f => f === null ? 'Empty' : `Page ${f.pageNum}`).join(', ')}</p>
                <p>Future References: ${this.referenceString.slice(this.currentStep + 1).join(', ')}</p>
            `;
        }
        
        this.algorithmExplanationElement.innerHTML = explanationHTML;
        this.modal.style.display = 'block';
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const simulator = new MemorySimulator();
});
