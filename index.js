'use strict';

// Never use 0 as the minimum value, or anywhere in the range, as it will be ignored by the keyboard
const MIN_HUE_VALUE = 169;
const MAX_HUE_VALUE = 254;
// This is the plus or minus range to apply the stock modifier. 
// So, if the value is 2, then -2% for the day would be the max "bad" value, and +2% would be the max "good" value
const STOCK_PLUS_OR_MINUS = 2;

// The tendency is that it does not favor or demonstrate the extremes. By using an exponential, you are favoring a lower value (since the range is 0 to 1)
// The higher the exponential below, the more you favor showing lower values.
// If you make it 1, it is shown linearly.
// If you make it a value between 0 and 1, you are favoring showing higher values
const HUE_EXPONENTIAL = 0.7;

// If you want the positive/negative to be the inverse (for the purposes of the color range), set this to true
const INVERT_RANGE = true;

// define constants
const KEYBOARD_UPDATE_TIME = 5000; // time in milliseconds

// general requires
const os = require('os');
const hid = require('node-hid');
const request = require('request');
const osUtils = require('node-os-utils');
const yahooFinance = require('yahoo-finance');

// import classes for use in this file
// This is unused for now, make the code cluaner by using this in the future
const led = require('./led');

// import the keyboard config
const keyboardList = require('./keyboards');

// read the command line argument and validate against the config
var args = process.argv.slice(2);

if (!args[0]) {
    console.log("Invalid keyboard name");
    process.exit();
}

if (!(args[0] in keyboardList)) {
    console.log("Keyboard does not exist");
    process.exit();
}

var keyboardName = args[0];

// Debug / logging stuff
console.log('keyboard list: \n', keyboardList);
console.log('args: ', args);
console.log('selected keyboard: ', keyboardName);
console.log('vendorId', keyboardList[keyboardName].vendorId);
console.log('productId', keyboardList[keyboardName].productId);


var device = getKeyboardDevice();
if (!device) {
    console.log('No device, exiting');
    process.exit();
}
console.log(hid.devices());

console.log("device: \n", device);

// //Test code
// let command = [
//     0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
//     0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
//     0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02,
//     0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02, 0x02
// ];

// console.log('Sending: ', command)
// var dataWritten = device.write(command);

// console.log("dataWritten: ", dataWritten);

// console.log("readSync: \n", device.readSync());
// //End Test code

device.on("data", function(data) {
    console.log('received data: \n', data);
});

device.on("error", function(err) {
    console.log('received error: \n', err);
    device.close();
});


// Helper function to wait a few milliseconds using a promise
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}

function getKeyboardDevice() {
    // Load the device 
    var devices = hid.devices();
    var deviceInfo = devices.find( function (d) {
        return d.vendorId === keyboardList[keyboardName].vendorId && d.productId === keyboardList[keyboardName].productId
            && d.usagePage === keyboardList[keyboardName].usagePage
    })

    // Verify we can find the appropriate keyboard
    if (!deviceInfo) {
        console.log('Could not find keyboard when trying to connect');
    }
    console.log('deviceInfo \n', deviceInfo);

    // Establish a connection to the device for communication
    var device = new hid.HID(deviceInfo.path);

    return device;
}

const dataToWrite = [];
let dataToWritePrevious = null;

async function startPerfMonitor() {

    function getPerformanceStats() {
        osUtils.cpu.free()
          .then(cpuPercentage => {
            dataToWrite['cpuLeds'] = cpuPercentage; // TODO: Convert to HSV
            console.log('cpu: ', dataToWrite['cpuLeds'], '\n');
          })
          .catch(err => {
            console.log(err);
          })

        // Not supported on windows, uncomment to use for Linux
        // osUtils.drive.info()
        //   .then(freePercentage => {
        //     dataToWrite['diskLeds'] = freePercentage; // TODO: Convert to HSV
        //     console.log('dsk: ', dataToWrite['diskLeds'], '\n');
        //   })
        //   .catch(err => {
        //     console.log(err);
        //   })

        osUtils.mem.info()
          .then(memoryInfo => {
            dataToWrite['memoryLeds'] = memoryInfo.freeMemPercentage; // TODO: Convert to HSV
            console.log('mem: ', dataToWrite['memoryLeds'], '\n');
          })
          .catch(err => {
            console.log(err);
          })
    }

    // Just keep updating the data forever
    while (true) {
        // Get the current stock prices
        await getPerformanceStats();

        // Pause a bit before requesting more info
        await wait(KEYBOARD_UPDATE_TIME);
    }
}

async function startStockMonitor() {
    // Set the stocks that we want to show
    const stocks = new Map();
    stocks.set('MSFT', 0);
    // TODO: Support multiple stocks later
    // stocks.set('AAPL', 0);
    // stocks.set('GOOG', 0);
    // stocks.set('FB', 0);

    function getStocks() {
        const promises = [];
        for (const [key, value] of stocks) {
            promises.push(new Promise((resolve) => {
                yahooFinance.quote({
                  symbol: key,
                  modules: [ 'price', 'summaryDetail' ] // see the docs for the full list
                }, function (err, quotes) {
                  // console.log(quotes); // To see the entire result
                  stocks.set(key, (quotes.price.regularMarketChangePercent * 100)); // * 100 so it is in percent, yahoo APIs report 5% as 0.05
                  resolve();
                });
            }));
        }

        // Wait for all the stocks to be updated
        return Promise.all(promises);
    };

    // Just keep updating the data forever
    while (true) {
        // Get the current stock prices
        await getStocks();

        // Loop through the stocks and set the led values (currently one stock, TODO support multiple)
        for (const [key, value] of stocks) {
            dataToWrite['stockLeds'] = value;
            console.log(key, ': ', value);
        }

        // Pause a bit before requesting more info
        await wait(KEYBOARD_UPDATE_TIME);
    }
}

async function sendToKeyboard(screen) {
    // // If there is no update from what we sent last time, no need to send again
    // if (dataToWritePrevious === dataToWrite) {
    //     return;
    // }

    if (!device) {
        console.log('Cannot send data to keyboard, device not connected');
        return;
    }

    console.log('dataToWrite in sendToKeyboard: ', dataToWrite, '\n');
    var finalData = [];

    for(var key in dataToWrite) {
        // console.log(`dataToWrite ${key}: ${dataToWrite[key]}`);
        // console.log('keyboardList values for: ',key,': ',keyboardList[`${keyboardName}`][`${key}`]);

        for(const val of keyboardList[`${keyboardName}`][`${key}`]) {
            finalData[val] = convertValuesToHSVData(key, dataToWrite[key]);
            // console.log('key val: ', val);
        }

        // Do one loop through in case there are any uninitialized values, and set them to 0
        // This prevents errors when sending the data, and 0 is the default value, which means 'do not change the led color'
        for(var i = 0; i < keyboardList[`${keyboardName}`]['numberOfLeds']; i++) {
            if(!finalData[i]) {
                finalData[i] = 0;
            }
        }
    };

    console.log('finalData: ', finalData);

    dataToWritePrevious = dataToWrite;

    finalData.unshift(0x00);
    try {
        device.write(finalData);
    } catch (e) {
        device = getKeyboardDevice();
        console.log("could not write to device, trying to reconnect");
    } finally {
        if(!device) {
            console.log("failed to reconnect");
        }
    }
}

function convertValuesToHSVData(key, data) {
    let normalizedData = null;
    switch (key) {
        case 'memoryLeds':
            normalizedData = convertMemoryValuesToNormalizedData(data);
            break;
        case 'stockLeds':
            normalizedData = convertStockValuesToNormalizedData(data);
            break;
        case 'cpuLeds':
            normalizedData = convertCpuValuesToNormalizedData(data);
            break;
        case 'networkLeds':
            normalizedData = convertNetworkValuesToNormalizedData(data);
            break;
        default:
            console.log('convertValuesToHSVData: bad key value: ', key, '\n');
            break;
    }

    if (!normalizedData) {
        return null;
    }

    return convertDataToHSVData(normalizedData);
}

function convertDataToHSVData(data) {
    if (INVERT_RANGE) {
        data = 1 - data;
    }
    return Math.round(applyHueModifier(data));
}

function applyHueModifier(percentOfMax) {
    return (percentOfMax * (MAX_HUE_VALUE - MIN_HUE_VALUE)) + MIN_HUE_VALUE;
}

function applyExponentModifier(value) {
    return Math.pow(value, HUE_EXPONENTIAL);
}

function convertMemoryValuesToNormalizedData(data) {
    return applyExponentModifier(data / 100);
}

function convertStockValuesToNormalizedData(data) {
    if (data > STOCK_PLUS_OR_MINUS) {
        data = STOCK_PLUS_OR_MINUS;
    }
    if (data < (-1 * STOCK_PLUS_OR_MINUS)) {
        data = (-1 * STOCK_PLUS_OR_MINUS);
    }

    var normalizedValue = data + STOCK_PLUS_OR_MINUS;
    var effectiveMaxPercent = STOCK_PLUS_OR_MINUS * 2;

    return applyExponentModifier(normalizedValue / effectiveMaxPercent);
}

function convertCpuValuesToNormalizedData(data) {
    return applyExponentModifier(data / 100);
}

function convertNetworkValuesToNormalizedData(data) {
    // Hardcoded, since this is not in use at all right now. Calculate appropriately if I ever add this feature
    return applyExponentModifier(0.5);
}

// Start the monitors that collect the info to display
startPerfMonitor();
startStockMonitor();

// Update the data on the keyboard with the current info screen every second
setInterval(sendToKeyboard, KEYBOARD_UPDATE_TIME);
