export function calculateDSA(baseRent, cpiRates, years) {
    let rent = baseRent;
    for(let i = 0; i < years; i++) {
        const cpi = cpiRates[i];
        let increase = Math.min(0.03, cpi * 0.6);
        increase = Math.max(0, increase);
        rent *= (1 + increase);
    }
    return rent;
}

export function calculateRSO(baseRent, cpiRates, years, utilities) {
    let rent = baseRent;
    const utilityAddition = (utilities.gas ? 0.01 : 0) + (utilities.electric ? 0.01 : 0);
    for(let i = 0; i < years; i++) {
        const cpi = cpiRates[i];
        let increase = Math.round(cpi * 100) / 100;
        increase = Math.max(0.03, Math.min(0.08, increase)) + utilityAddition;
        rent *= (1 + increase);
    }
    return rent;
}

export function calculateLAHD(baseRent, cpiRates, years, bankingEnabled = true) {
    let rent = baseRent;
    let bankedIncrease = 0;
    for(let i = 0; i < years; i++) {
        const cpi = cpiRates[i];
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
