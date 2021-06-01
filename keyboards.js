module.exports = {
    euclid36: {
        vendorId: 65278,
        productId: 23384,
        usagePage: 65376,
        numberOfLeds: 13,
        cpuLeds: [1,4,5,6],
        diskLeds: [],
        memoryLeds: [0,3,7,8,12],
        stockLeds: [2,9,10,11]
        // Use this code to run against the top 3 leds
    	// cpuLeds: [0],
    	// diskLeds: [],
    	// memoryLeds: [1],
    	// stockLeds: [2]//,3,4,5,6,7,8,9,10,11,12] // commented out to leave the underglow free, just use the top three leds
    },
    enigma36_1: {
        vendorId: 65278,
        productId: 23499,
        usagePage: 65376,
        numberOfLeds: 12,
    	cpuLeds: [0,1,2,3],
    	diskLeds: [],
    	memoryLeds: [4,5,6,7],
    	stockLeds: [8,9,10,11]
    },
    enigma36_2: {
        vendorId: 65278,
        productId: 23499,
        usagePage: 65376,
        numberOfLeds: 12,
        cpuLeds: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14],
        diskLeds: [],
        memoryLeds: [15,16,17,18,19,20],
        stockLeds: [21,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35]
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