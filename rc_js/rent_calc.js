import { historicalCPI } from './modules/historical.js';
import { calculateDSA, calculateRSO, calculateLAHD } from './modules/calculations.js';



function calculateRent() {
    const baseRent = parseFloat(document.getElementById('base-rent').value) || 0;
    // Update current annual rent display
    document.getElementById('current-annual').textContent = (baseRent * 12).toLocaleString('en-US');
    
    const gasIncluded = document.querySelector('input[name="gas"]:checked').value === 'yes';
    const electricIncluded = document.querySelector('input[name="electric"]:checked').value === 'yes';
    const bankingEnabled = document.querySelector('input[name="lahd-banking"]:checked')?.value !== 'no';
    // Get all 5 years of CPI rates
    const cpiRates = [1,2,3,4,5].map(i => parseFloat(document.getElementById(`cpi-y${i}`).value) / 100);
    const yearLabels = [1,2,3,4,5].map(i => {
        const yearEl = document.getElementById(`year${i}`);
    });
    // Update year labels next to sliders
    yearLabels.forEach((year, index) => {
        const yearEl = document.getElementById(`year${index + 1}`);
        if (yearEl) yearEl.textContent = year;
    });
    // DSA-LA calculation
    function calculateDSA(years) {
        let rent = baseRent;
        for(let i = 0; i < years; i++) {
            const cpi = cpiRates[i];  // Use direct index since array matches years
            let increase = Math.min(0.03, cpi * 0.6);
            increase = Math.max(0, increase);
            rent *= (1 + increase);
        }
        return rent;
    }

    // RSO calculation
    function calculateRSO(years) {
        let rent = baseRent;
        const utilityAddition = (gasIncluded ? 0.01 : 0) + (electricIncluded ? 0.01 : 0);
        
        for(let i = 0; i < years; i++) {
            const cpi = cpiRates[i];  // Use direct index
            let increase = Math.round(cpi * 100) / 100;
            increase = Math.max(0.03, Math.min(0.08, increase)) + utilityAddition;
            rent *= (1 + increase);
        }
        return rent;
    }

    // LAHD calculation
    function calculateLAHD(years) {
        // Use the bankingEnabled toggle
        let rent = baseRent;
        let bankedIncrease = 0;
        
        for(let i = 0; i < years; i++) {
            const cpi = cpiRates[i];  // Use direct index
            let increase;
            if (bankingEnabled) {
                increase = Math.max(0.02, Math.min(0.05, cpi + bankedIncrease));
                bankedIncrease = Math.max(0, cpi - 0.05 + (increase < cpi ? bankedIncrease : 0));
            } else {
                increase = Math.max(0.02, Math.min(0.05, cpi));
                bankedIncrease = 0;
            }
            rent *= (1 + increase);
        }
        return rent;
    }

    // Reset datasets
    const dsaData = [baseRent];
    const rsoData = [baseRent];
    const lahdData = [baseRent];

    // Store values for summary table
    const summaryRows = [];

    // Calculate each year's values
    let currentDSA = baseRent;
    let currentRSO = baseRent;
    let currentLAHD = baseRent;

    let prevDSA = baseRent;
    let prevRSO = baseRent;
    let prevLAHD = baseRent;

    [1, 2, 3, 4, 5].forEach(year => {
        currentDSA = calculateDSA(year);
        currentRSO = calculateRSO(year);
        currentLAHD = calculateLAHD(year);

        // Calculate year-over-year percentage changes
        const dsaPercent = ((currentDSA / prevDSA - 1) * 100).toFixed(1);
        const rsoPercent = ((currentRSO / prevRSO - 1) * 100).toFixed(1);
        const lahdPercent = ((currentLAHD / prevLAHD - 1) * 100).toFixed(1);

        // Update dataset for graph (unaffected by formatting)
        dsaData.push(parseFloat(currentDSA.toFixed(2)));
        rsoData.push(parseFloat(currentRSO.toFixed(2)));
        lahdData.push(parseFloat(currentLAHD.toFixed(2)));

        // Store values for summary table
        summaryRows.push({
            year,
            dsa: currentDSA,
            rso: currentRSO,
            lahd: currentLAHD
        });

        // Format numbers with commas for display
        const formatDisplay = num => Math.round(num).toLocaleString('en-US');

        // --- Begin: Color coding and icons logic ---
        // Find min and max for this year
        const rents = [
            { id: 'dsa', value: currentDSA },
            { id: 'rso', value: currentRSO },
            { id: 'lahd', value: currentLAHD }
        ];
        const minRent = Math.min(...rents.map(r => r.value));
        const maxRent = Math.max(...rents.map(r => r.value));

        // Assign icons
        rents.forEach(r => {
            let icon = '';
            let className = '';
            if (r.value === minRent && minRent !== maxRent) {
                icon = '<span class="comparison-emoji" style="font-weight: lighter">😀</span>';
                className = 'most-favorable';
            } else if (r.value === maxRent && minRent !== maxRent) {
                icon = '<span class="comparison-emoji" style="font-weight: lighter">😫</span>';
                className = 'least-favorable';
            } else {
                icon = '<span class="comparison-emoji" style="font-weight: lighter">🤔</span>';
                className = '';
            }
            // Set text and class, with annual and percent in small spans
            const el = document.getElementById(`${r.id}-${year}y`);
            el.innerHTML =
                `<span class="result-row-percent">+${eval(r.id+ 'Percent')}%</span> $${formatDisplay(r.value)}/mo <span class="result-row-annual">($${formatDisplay(r.value * 12)}/yr)</span>${icon}`;
            el.className = className;
        });

        prevDSA = currentDSA;
        prevRSO = currentRSO;
        prevLAHD = currentLAHD;
    });

    // Update chart with new data
    if (window.rentChart) {
        rentChart.data.datasets[0].data = dsaData;
        rentChart.data.datasets[1].data = rsoData;
        rentChart.data.datasets[2].data = lahdData;
        rentChart.update();
    }

    // Update summary table
    summaryRows.forEach(row => {
        // Find min and max for this year
        const vals = [row.dsa, row.rso, row.lahd];
        const min = Math.min(...vals);
        const max = Math.max(...vals);

        // Helper to format and highlight
        function cell(val) {
            let cls = '';
            if (val === min && min !== max) cls = 'summary-best';
            else if (val === max && min !== max) cls = 'summary-worst';
            return `<span class="${cls}">$${Math.round(val).toLocaleString('en-US')}</span>`;
        }

        document.getElementById(`summary-dsa-${row.year}`).innerHTML = cell(row.dsa);
        document.getElementById(`summary-rso-${row.year}`).innerHTML = cell(row.rso);
        document.getElementById(`summary-lahd-${row.year}`).innerHTML = cell(row.lahd);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const yearSlider = document.getElementById('historical-year-slider');
    const yearDisplay = document.getElementById('historical-year-display');
    const sliders = Array.from(document.querySelectorAll('.inflation-sliders input[type="range"]'));

    // New function to update year labels
    function updateYearLabels(startYear) {
        for(let i = 1; i <= 5; i++) {
            const yearLabel = document.getElementById(`year${i}`);
            if (yearLabel) {
                yearLabel.textContent = (startYear + i - 1).toString();
            }
        }
    }

    // Helper to update CPI sliders from historical data
    function setCpiSlidersFromHistorical(year) {
        const cpiArr = historicalCPI[year];
        for (let i = 0; i < 5; i++) {
            const slider = sliders[i];
            if (cpiArr && slider) {
                slider.value = cpiArr[i];
                document.getElementById(`cpi-y${i+1}-val`).textContent = cpiArr[i].toFixed(2) + '%';
            } else if (slider) {
                slider.value = 3.0;
                document.getElementById(`cpi-y${i+1}-val`).textContent = '3.00%';
            }
        }
        // Update year labels when historical data is set
        updateYearLabels(year);
        calculateRent();
    }

    // Historical year slider logic
    yearSlider.addEventListener('input', (e) => {
        const year = parseInt(e.target.value, 10);
        yearDisplay.textContent = `${year}-${year+4}`;
        setCpiSlidersFromHistorical(year);
    });

    // When any CPI slider is changed manually, set year slider to max (manual entry)
    sliders.forEach(slider => {
        slider.addEventListener('input', () => {
            if (yearSlider.value !== yearSlider.max) {
                yearSlider.value = yearSlider.max;
                yearDisplay.textContent = 'Manual Entry';
            }
            // Update value display
            document.getElementById(`${slider.id}-val`).textContent = parseFloat(slider.value).toFixed(2) + '%';
            calculateRent();
            // Update year display for each slider

        });
    });

    // On page load, initialize year slider and CPI sliders
    yearDisplay.textContent = `${yearSlider.value}-${parseInt(yearSlider.value, 10)+4}`;
    setCpiSlidersFromHistorical(yearSlider.value);

    const form = document.getElementById('rent-calc');
    const allSliders = document.querySelectorAll('input[type="range"]');
    
    // Update slider values and calculate rent
    allSliders.forEach(slider => {
        slider.addEventListener('input', (e) => {
            document.getElementById(`${e.target.id}-val`).textContent = e.target.value;
            calculateRent();
        });
    });

    // Calculate rent when any form input changes
    form.addEventListener('input', calculateRent);
    form.addEventListener('change', calculateRent); 
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent form submission
        calculateRent();
        
    });

    // Initialize chart
    const ctx = document.getElementById('rentGraph').getContext('2d');
    window.rentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Today', '2026', '2027', '2028', '2029', '2030'],
            datasets: [{
                label: 'Keep LA Housed Plan',
                borderColor: 'rgba(115, 251, 65, 1)',  // bright red
                backgroundColor: 'rgba(33, 163, 35, 0.81)',
                borderWidth: 2,
                tension: 0.1,
                data: []
            }, {
                label: 'Current RSO',
                borderColor: 'rgba(255, 75, 75, 1)',  // bright green
                backgroundColor: 'rgba(198, 25, 25, 0.79)',
                borderWidth: 2,
                tension: 0.1,
                data: []
            }, {
                label: 'LAHD Proposal',
                borderColor: 'rgb(255, 215, 0)',  // gold
                backgroundColor: 'rgba(151, 130, 12, 0.77)',
                borderWidth: 2,
                tension: 0.1,
                data: []
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            
            layout: {
                padding: {
                    top: 2,
                    right: 2,
                    bottom: 2,
                    left: 2,
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#FFFFFF'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Monthly Rent ($)',
                        color: '#FFFFFF'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#FFFFFF'
                    }
                }
            }
        }
    });

    // Initial calculation
    calculateRent();

    // Prevent form submission on enter key
    const rentInput = document.getElementById('base-rent');
    
    // Validate rent input
    rentInput.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 100000) e.target.value = 100000;
    });

    // Add share functionality
    function shareCalculation() {
        const baseRent = document.getElementById('base-rent').value;
        const cpiValues = [1,2,3,4,5].map(i => document.getElementById(`cpi-y${i}`).value);
        const params = new URLSearchParams({
            rent: baseRent,
            cpi: cpiValues.join(',')
        });
        
        const url = `${window.location.origin}${window.location.pathname}?${params}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('Calculation URL copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                alert('Failed to copy calculation URL to clipboard.');
            });
    }

    document.getElementById('shareCalculation').addEventListener('click', shareCalculation);

    // Add social media share functionality
    function generateShareText() {
        const rent = document.getElementById('base-rent').value;
        return `I just calculated my rent increases under different LA policies. The Keep LA Housed plan saves tenants money compared to the current RSO! The LAHD proposal? Cute, but not nearly strong enough for working people. Try it yourself: ${window.location.origin}${window.location.pathname}?rent=${rent}&cpi=${[1, 2, 3, 4, 5].map(i => document.getElementById(`cpi-y${i}`).value).join(',')}`;
    }

    // Update OG description for Facebook share
    function updateOgDescription(desc) {
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (!ogDesc) {
            ogDesc = document.createElement('meta');
            ogDesc.setAttribute('property', 'og:description');
            document.head.appendChild(ogDesc);
        }
        ogDesc.setAttribute('content', desc);
    }

    document.getElementById('twitterShare').addEventListener('click', () => {
        const shareText = generateShareText();
        const twitterURL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterURL, '_blank');
    });

    document.getElementById('facebookShare').addEventListener('click', () => {
        const shareText = generateShareText();
        updateOgDescription(shareText);
        const facebookURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(facebookURL, '_blank');
    });

    // Load from URL params if present
    const params = new URLSearchParams(window.location.search);
    if (params.has('rent')) {
        document.getElementById('base-rent').value = params.get('rent');
        const cpiValues = params.get('cpi').split(',');
        cpiValues.forEach((val, i) => {
            const slider = document.getElementById(`cpi-y${i+1}`);
            slider.value = val;
            document.getElementById(`cpi-y${i+1}-val`).textContent = val + '%'; // Update display
        });
        calculateRent();
    }

    // Slider keyboard control
    const sliderElements = Array.from(document.querySelectorAll('input[type="range"]'));
    let currentSliderIndex = 0;

    function updateActiveSlider() {
        sliderElements.forEach(s => {
            s.classList.remove('active-slider');
            s.parentElement.classList.remove('active-group');
        });
        sliderElements[currentSliderIndex].classList.add('active-slider');
        sliderElements[currentSliderIndex].parentElement.classList.add('active-group');
    }

    // Initialize first slider as active
    updateActiveSlider();

    document.addEventListener('keydown', (e) => {
        // Prevent arrow keys from scrolling the page
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }

        const activeSlider = sliderElements[currentSliderIndex];
        // Special handling for the historical year slider
        if (activeSlider.id === 'historical-year-slider') {
            switch(e.key) {
                case 'ArrowLeft':
                    activeSlider.stepDown();
                    activeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                case 'ArrowRight':
                    activeSlider.stepUp();
                    activeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
                case 'ArrowDown':
                    currentSliderIndex = 5;
                    updateActiveSlider();
                    break;
                case 'ArrowUp':
                    currentSliderIndex = 1;
                    updateActiveSlider();
                    break;
            }
            return;
        }
        // Standard behavior for other sliders
        switch(e.key) {
            case 'ArrowLeft':
                currentSliderIndex = (currentSliderIndex - 1 + sliderElements.length) % sliderElements.length;
                updateActiveSlider();
                break;
            case 'ArrowRight':
                currentSliderIndex = (currentSliderIndex + 1) % sliderElements.length;
                updateActiveSlider();
                break;
            case 'ArrowUp':
                activeSlider.value = (parseFloat(activeSlider.value) + 0.1).toFixed(1);
                activeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                break;
            case 'ArrowDown':
                activeSlider.value = (parseFloat(activeSlider.value) - 0.1).toFixed(1);
                activeSlider.dispatchEvent(new Event('input', { bubbles: true }));
                break;
        }
    });

    // Allow clicking on sliders to select them
    sliderElements.forEach((slider, index) => {
        slider.addEventListener('click', () => {
            currentSliderIndex = index;
            updateActiveSlider();
        });
    });


});

