export const historicalCPI = {
    1960: [2.0, 1.0, 1.3, 1.3, 1.9],
    1961: [1.0, 1.3, 1.3, 1.9, 2.2],
    1962: [1.3, 1.3, 1.9, 2.2, 1.9],
    1963: [1.3, 1.9, 2.2, 1.9, 2.4],
    1964: [1.9, 2.2, 1.9, 2.4, 4.1],
    1965: [2.2, 1.9, 2.4, 4.1, 4.5],
    1966: [1.9, 2.4, 4.1, 4.5, 5.2],
    1967: [2.4, 4.1, 4.5, 5.2, 3.6],
    1968: [4.1, 4.5, 5.2, 3.6, 3.2],
    1969: [4.5, 5.2, 3.6, 3.2, 5.6],
    1970: [5.2, 3.6, 3.2, 5.6, 10.3],
    1971: [3.6, 3.2, 5.6, 10.3, 10.6],
    1972: [3.2, 5.6, 10.3, 10.6, 6.8],
    1973: [5.6, 10.3, 10.6, 6.8, 6.9],
    1974: [10.3, 10.6, 6.8, 6.9, 7.4],
    1975: [10.6, 6.8, 6.9, 7.4, 10.7],
    1976: [6.8, 6.9, 7.4, 10.7, 15.8],
    1977: [6.9, 7.4, 10.7, 15.8, 9.8],
    1978: [7.4, 10.7, 15.8, 9.8, 5.9],
    1979: [10.7, 15.8, 9.8, 5.9, 1.8],
    1980: [15.8, 9.8, 5.9, 1.8, 4.5],
    1981: [9.8, 5.9, 1.8, 4.5, 4.6],
    1982: [5.9, 1.8, 4.5, 4.6, 3.2],
    1983: [1.8, 4.5, 4.6, 3.2, 4.3],
    1984: [4.5, 4.6, 3.2, 4.3, 4.5],
    1985: [4.6, 3.2, 4.3, 4.5, 5.1],
    1986: [3.2, 4.3, 4.5, 5.1, 5.9],
    1987: [4.3, 4.5, 5.1, 5.9, 4.0],
    1988: [4.5, 5.1, 5.9, 4.0, 3.6],
    1989: [5.1, 5.9, 4.0, 3.6, 2.6],
    1990: [5.9, 4.0, 3.6, 2.6, 1.3],
    1991: [4.0, 3.6, 2.6, 1.3, 1.5],
    1992: [3.6, 2.6, 1.3, 1.5, 1.9],
    1993: [2.6, 1.3, 1.5, 1.9, 1.6],
    1994: [1.3, 1.5, 1.9, 1.6, 1.4],
    1995: [1.5, 1.9, 1.6, 1.4, 2.3],
    1996: [1.9, 1.6, 1.4, 2.3, 3.3],
    1997: [1.6, 1.4, 2.3, 3.3, 3.3],
    1998: [1.4, 2.3, 3.3, 3.3, 2.8],
    1999: [2.3, 3.3, 3.3, 2.8, 2.6],
    2000: [3.3, 3.3, 2.8, 2.6, 3.3],
    2001: [3.3, 2.8, 2.6, 3.3, 4.5],
    2002: [2.8, 2.6, 3.3, 4.5, 4.3],
    2003: [2.6, 3.3, 4.5, 4.3, 3.3],
    2004: [3.3, 4.5, 4.3, 3.3, 3.5],
    2005: [4.5, 4.3, 3.3, 3.5, -0.8],
    2006: [4.3, 3.3, 3.5, -0.8, 1.2],
    2007: [3.3, 3.5, -0.8, 1.2, 2.7],
    2008: [3.5, -0.8, 1.2, 2.7, 2.0],
    2009: [-0.8, 1.2, 2.7, 2.0, 1.1],
    2010: [1.2, 2.7, 2.0, 1.1, 1.3],
    2011: [2.7, 2.0, 1.1, 1.3, 0.9],
    2012: [2.0, 1.1, 1.3, 0.9, 1.9],
    2013: [1.1, 1.3, 0.9, 1.9, 2.8],
    2014: [1.3, 0.9, 1.9, 2.8, 3.8],
    2015: [0.9, 1.9, 2.8, 3.8, 3.1],
    2016: [1.9, 2.8, 3.8, 3.1, 1.6],
    2017: [2.8, 3.8, 3.1, 1.6, 3.8],
    2018: [3.8, 3.1, 1.6, 3.8, 7.4],
    2019: [3.1, 1.6, 3.8, 7.4, 3.7],
    2020: [1.6, 3.8, 7.4, 3.7, 3],
    2021: [3.8, 7.4, 3.7, 3, 3],
    2022: [7.4, 3.7, 3, 3, 3],
    2023: [3.7, 3, 3, 3, 3]
};

export function updateFromHistoricalYear(year, sliders) {
    const data = historicalCPI[year];
    if (data) {
        // Update sliders with CPI values
        sliders.forEach((slider, index) => {
            updateSliderWithAnimation(slider, data[index]);
        });
        
        // Update year displays
        document.querySelectorAll('[data-yearindex]').forEach(element => {
            const index = parseInt(element.dataset.yearindex);
            element.textContent = (year + index).toString();
        });
    } else {
        console.warn(`No historical data found for year ${year}`);
    }
}

function updateSliderWithAnimation(slider, targetValue, duration = 300) {
    return new Promise(resolve => {
        const startValue = parseFloat(slider.value);
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = startValue + (targetValue - startValue) * progress;
            slider.value = currentValue;
            // Dispatch the input event to trigger the calculation
            slider.dispatchEvent(new Event('input'));

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(animate);
    });
}
