module.exports = {
    euclid36: {
        vendorId: 65278,
        productId: 23384,
        usagePage: 65376,
        numberOfLeds: 13,
        cpuLeds: [5,6],
        diskLeds: [],
        memoryLeds: [7,8],
        stockLeds: [9,10]
        // Use this code to run against the top 3 leds
    	// cpuLeds: [0],
    	// diskLeds: [],
    	// memoryLeds: [1],
    	// stockLeds: [2]//,3,4,5,6,7,8,9,10,11,12] // commented out to leave the underglow free, just use the top three leds
    },
    enigma36: {
        vendorId: 65278,
        productId: 23499,
        numberOfLeds: 12,
    	cpuLeds: [],
    	diskLeds: [],
    	memoryLeds: [],
    	stockLeds: [0,1,2,3,4,5,6,7,8,9,10,11]
    },
    reviung41: {
        numberOfLeds: 11,
    	cpuLeds: [],
    	diskLeds: [],
    	memoryLeds: [0],
        networkLeds: [],
    	stockLeds: [1,2,3,4,5,6,7,8,9,10]
    },
    reviung39: {
        numberOfLeds: 11,
    	cpuLeds: [],
    	diskLeds: [],
    	memoryLeds: [0],
    	stockLeds: [1,2,3,4,5,6,7,8,9,10]
    },
};