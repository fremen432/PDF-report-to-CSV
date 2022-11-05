var fs = require("fs");

const PATH_FROM_01 = "./pdf-to-text.txt";
const PATH_FROM_02 = "./pdf-to-text02.txt";
const PATH_TO = "../result/result.txt";

/* 
High-Level:

for every report (2-page traffic volume report), return an object like this:

{
    Counter No: 00,
    Road: "EB US 90 off ramp E of IH 410",
    Direction-Bound: (Northbound | Southbound | Eastbound | Westbound)

    Day-1 AM peak: 00,
    Day-2 AM peak: 00,
    2-day average AM peak: 00,

    Day-1 PM peak: 00,
    Day-2 PM peak: 00,
    2-day average PM 

    *Extra*
    Day-1 Date recorded:
    Day-2 Date recorded:
}
Then, once an array is returned containing an object for every report,
Dump all data into a CSV file in ./RESULT/US90-Peak-Traffic-Volume.csv




Step 1:
    Split full text doc into many 2 page reports

Step 2:
    for each report, we need an array returned containing all peak traffic volume values and times. 


if section

*/

const PATTERNS = {
    topOfPage: /Pape-Dawson Engineers,? Inc\. Automatic Traffic Counts/g,
    wholeDoc: /(?<=Pape-Dawson )([\s\S]+?)(?=Time of Day)/g,
    pageTop: /\d/g,
    findCounterNumber: /(?<=Counter No\. : )\d+/g,
    findPeaks: /(\d+:\d{2} )\*( \d+)+/gi,
    findSingleDigitTime: /\n(?=\d:)/gi,
    addLeadingZero: /\n(?=\d:\d\d)/g,
    timeReturn: / (?=\d\d:\d\d)/g,
    getPeaks: /(\d+:\d{2} )\*( \d+)+/gi,
};

const textToReports = (text, pattern) => text.match(pattern.wholeDoc);

const readFile = (path) => fs.readFileSync(path, "utf-8", (err, data) => data);

const removeCommas = (txt) => txt.replaceAll(",", "");

const fixTime = (txt) =>
    // add "0" before all 1:00 type times
    // then separate each time on it's own line
    txt
        .replaceAll(PATTERNS.addLeadingZero, "\n0")
        .replaceAll(PATTERNS.timeReturn, "\n");

const getPeaks = (text) => text.match(PATTERNS.getPeaks).sort();

function getDirection(report) {
    const N_S = report.match(/Northbound Southbound(?=\n)/g);
    const S_N = report.match(/Southbound Northbound(?=\n)/g);
    const E_W = report.match(/Eastbound Westbound(?=\n)/g);
    const W_E = report.match(/Westbound Eastbound(?=\n)/g);

    const thisDirection =
        N_S != null
            ? "North-South bound"
            : S_N != null
            ? "South-North bound"
            : E_W != null
            ? "East-West bound"
            : W_E != null
            ? "West-East bound"
            : "None";
    return thisDirection;
}

function transformReport(report) {
    const thisDirection = getDirection(report);
    let peaks = getPeaks(report);

    let AM_peaks = peaks.slice(0, 4);
    let PM_peaks = peaks.slice(-4);

    return peaks;

    return [AM_peaks, PM_peaks];
}

function OPP(pathFrom, pattern) {
    let text = readFile(pathFrom);

    // remove commas from numbers. also helps with CSV format
    text = removeCommas(text);

    text = fixTime(text);

    // separated 1 text file into array of 'reports' (2-day traffic volume data reports)
    let reports = textToReports(text, pattern);

    let finalReport = reports.map((el) => transformReport(el));

    return finalReport;
}

// console.log(OPP(PATH_FROM_01, PATTERNS));
console.log(OPP(PATH_FROM_02, PATTERNS));
