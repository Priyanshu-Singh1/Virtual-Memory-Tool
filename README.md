# Virtual Memory Management Simulator

## Overview

This interactive web application simulates virtual memory management with paging, demonstrating page replacement algorithms and internal fragmentation. Users can experiment with different memory configurations, page sizes, and observe how LRU and Optimal algorithms handle page faults.

## Features

- **Configurable Memory Parameters**:
  - Adjust total memory size (16KB to 1024KB)
  - Set page size (1KB to 16KB)
  - Define process size (1KB to 128KB)

- **Page Replacement Algorithms**:
  - **LRU (Least Recently Used)**: Replaces the page not used for the longest time
  - **Optimal**: Replaces the page that won't be used for the longest time (theoretical best)

- **Visualizations**:
  - Physical memory frames with color-coded page status
  - Page table showing mapping and access information
  - Reference sequence highlighting current access
  - Fragmentation visualization showing used/unused page portions

- **Simulation Controls**:
  - Step-by-step execution
  - Auto-run mode
  - Reset functionality
  - Detailed algorithm explanations

- **Metrics Tracking**:
  - Page fault count
  - Hit ratio percentage
  - Internal fragmentation calculation
  - Detailed simulation log

## How to Use

1. **Configure Memory**:
   - Set total memory size using the slider
   - Choose page size (affects number of frames)
   - Define process size (calculates required pages and fragmentation)

2. **Select Algorithm**:
   - Choose between LRU and Optimal replacement strategies
   - Click "Explain" for detailed algorithm information

3. **Run Simulation**:
   - Use "Next Step" to advance one reference at a time
   - "Auto Run" automatically steps through the reference string
   - "Reset" clears the simulation

4. **Observe Results**:
   - Watch page faults/hits in real-time
   - View fragmentation in memory frames
   - Examine the page table for detailed mappings
   - Track performance metrics

## Technical Details

- **Page Calculation**:
  - Number of pages = ceil(Process Size / Page Size)
  - Internal fragmentation = (Number of Pages × Page Size) - Process Size

- **Reference String**:
  - Default: "1,2,3,4,1,2,5,1,2,3,4,5"
  - Customizable through input field

- **Frame Allocation**:
  - Number of frames = floor(Total Memory / Page Size)
  - Visualized with used/unused portions for fragmentation

## Implementation Notes

- Built with HTML5, CSS3, and vanilla JavaScript
- Uses Chart.js for performance visualization
- Responsive design works on desktop and mobile
- No external dependencies beyond Font Awesome icons

## Learning Outcomes

Through this simulator, users can understand:
- How paging divides memory into fixed-size units
- The concept of internal fragmentation
- Differences between page replacement algorithms
- The trade-offs between LRU and Optimal approaches
- How page tables map virtual to physical memory

## Future Enhancements

1. Add more page replacement algorithms (FIFO, Clock)
2. Implement demand paging simulation
3. Add process switching visualization
4. Include external fragmentation examples
5. Add quiz/assessment mode
