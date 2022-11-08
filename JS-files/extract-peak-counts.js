var fs = require("fs");

// const PATH_FROM_01 = "./TXT-files/pdf-to-text.txt";
// const PATH_FROM_02 = "./TXT-files/pdf-to-text02.txt";

const PATH_FROM_01 = "../TXT-files/pdf-to-text.txt";
const PATH_FROM_02 = "../TXT-files/pdf-to-text02.txt";

const PDF_1_PAGE = "./PDF-files/US90_Tube-Counts_1page.pdf";
const PDF_FULL = "./PDF-files/US90_Tube-Counts_FULL.pdf";

const NORTH_SOUTH = "NORTH-SOUTH";
const SOUTH_NORTH = "SOUTH-NORTH";
const EAST_WEST = "EAST-WEST";
const WEST_EAST = "WEST-EAST";

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

    getCounter: /(?<=Counter No\. : ).+/g,
    getLocation: /(?<=Location: ).+/g,
    getDate: /./g,
    getProjectNo: /(?<=Average Daily Traffic\r\n).+/g,
};

const textToReports = (text, pattern) => text.match(pattern.wholeDoc);
// separated 1 text file into array of 'reports' (2-day traffic volume data reports)

const readFile = (path) =>
    fs.readFileSync(path, "utf-8", (err, data) =>
        data.catch((err) => console.log(err))
    );

const removeCommas = (txt) => txt.replaceAll(",", "");
// remove commas from numbers. also helps with CSV format

const fixTime = (txt) =>
    // add "0" before all 1:00 type times
    // then separate each time on it's own line
    txt
        .replaceAll(PATTERNS.addLeadingZero, "\n0")
        .replaceAll(PATTERNS.timeReturn, "\n");

const getPeaks = (text) => text.match(PATTERNS.getPeaks).sort();

function getDirection(report) {
    // return report;

    const N_S_01 = report.match(/Northbound Southbound(?=\n)/g);
    const S_N_01 = report.match(/Southbound Northbound(?=\n)/g);
    const E_W_01 = report.match(/Eastbound Westbound(?=\n)/g);
    const W_E_01 = report.match(/Westbound Eastbound(?=\n)/g);

    const N_S_02 = report.match(/Northbound Southbound Northbound Southbound/g);
    const S_N_02 = report.match(/Southbound Northbound Southbound Northbound/g);
    const E_W_02 = report.match(/Eastbound Westbound Eastbound Westbound/g);
    const W_E_02 = report.match(/Westbound Eastbound Westbound Eastbound/g);

    const N_S_03 = report.match(/Southbound Northbound Southbound/g);
    const S_N_03 = report.match(/Northbound Southbound Northbound/g);
    const E_W_03 = report.match(/Westbound Eastbound Westbound/g);
    const W_E_03 = report.match(/Eastbound Westbound Eastbound/g);

    const N_S = report.match(/Northbound Southbound(?=\r\n)/g);
    const S_N = report.match(/Southbound Northbound(?=\r\n)/g);
    const E_W = report.match(/Eastbound Westbound(?=\r\n)/g);
    const W_E = report.match(/Westbound Eastbound(?=\r\n)/g);

    const thisDirection =
        N_S != null
            ? NORTH_SOUTH
            : S_N != null
            ? SOUTH_NORTH
            : E_W != null
            ? EAST_WEST
            : W_E != null
            ? WEST_EAST
            : "None";
    return thisDirection;
}

function transformReport(report) {
    // transforms raw text into an object { Direction, Time, Values }

    // return report;
    let peaks = getPeaks(report);
    const Direction = getDirection(report);

    let splitTimeAndValues = (thesePeaks) =>
        thesePeaks.map((el) => {
            let splitted = el.split(" * ");
            let Time = splitted[0];
            let Values = splitted[1].split(" ");
            // if the time values have 4 values, only return the 1st and 3rd value
            if (Values.length == 4) {
                Values = [Number(Values[0]), Number(Values[2])];
            } else {
                Values = [Number(Values[0]), Number(Values[1])];
            }
            return { Direction, Time, Values };
        });

    let AM_peaks = splitTimeAndValues(peaks.slice(0, 4));
    let PM_peaks = splitTimeAndValues(peaks.slice(-4));

    // return Direction;
    // return AM_peaks[0];
    // return PM_peaks;

    return { Direction, AM_peaks, PM_peaks };
}

function OPP(pathFrom, pattern) {
    let text = readFile(pathFrom);

    text = removeCommas(text);

    text = fixTime(text);

    let reports = textToReports(text, pattern);

    let finalReport = reports.map((el) => transformReport(el));

    return finalReport;
}

console.log(OPP(PATH_FROM_01, PATTERNS));
// console.log(OPP(PATH_FROM_02, PATTERNS));
