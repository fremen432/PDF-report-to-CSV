var fs = require("fs");
const { report } = require("process");

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

    // findCounterNumber: /(?<=Counter).+(?=\n)/g,
    findCounterNumber: /(?<=Counter No\. : )\d+/g,
    findPeaks: /(\d+:\d{2} )\*( \d+)+/gi,
    findSingleDigitTime: /\n(?=\d:)/gi,
    // findPeaks: //gi,
};

const pattern_addZero = /\n0/gi;

function textToReports(text, pattern) {
    return text.match(pattern.wholeDoc);
}

function readFile(path) {
    const res = fs.readFileSync(path, "utf-8", (err, data) => data);
    return res;
}

function findText(txt, pattern) {
    return txt.match(pattern);
}

function removeCommas(txt) {
    const pattern = /(?<=\d),(?=\d)/g;
    return txt.replaceAll(",", "");
}

function fixTime(txt) {
    // add "0" before all 1:00 type times
    // then separate each time on it's own line
    const pattern = /\n(?=\d:\d\d)/g;
    return txt.replaceAll(pattern, "\n0").replaceAll(/ (?=\d\d:\d\d)/g, "\n");
}

function replaceString(txt, pattern_find, pattern_replace) {
    const pattern = /(?<=\d),(?=\d)/g;
    return txt.replaceAll(",", "");
}

function getPeaks(text) {
    let peaks = findText(text, PATTERNS.findPeaks).sort();
    return peaks;
    // for (thisPeak of peaks) {
    //     if (thisPeak[1] == ":") {
    //         let newPeak = "0" + thisPeak;
    //         peaks.push(newPeak);
    //     }
    // }

    // peaks = peaks.sort().filter((el) => el[1] != ":");
    for (thisPeak02 of peaks) {
        let counts = thisPeak02.match(/(?<=\* ).+/gi).join("");

        pat_time = /\d\d:\d\d/g;

        pat_eb = /\d\d:\d\d/g;
        pat_wb = /\d\d:\d\d/g;

        const Time = thisPeak02.match(pat_time).join("");
        const EastBound = thisPeak02.match(pat_eb).join("");
        const WestBound = thisPeak02.match(pat_wb).join("");

        console.log(EastBound);
        // console.log({ Time, WestBound, EastBound });

        // const time = thisPeak02.
        // peaks.push({
        //     Time: "",
        //     EastBound: "",
        //     WestBound: "",
        // });
    }

    /* 
    peaks = [
        {
            Time: "",
            EastBound: "",
            WestBound: "",
        }
    ]
    
    */

    return peaks;
}

function OPP(pathFrom, pattern) {
    let text = readFile(pathFrom);
    text = removeCommas(text);

    const matches = findText(text, pattern);

    const counterNum = findText(text, pattern.findCounterNumber).join("");

    let peaks = getPeaks(text);

    return { peaks };
}

function transformReport(report) {
    return "hey";
    let peaks_01 = getPeaks(report);
}

function OPP_02(pathFrom, pattern) {
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
console.log(OPP_02(PATH_FROM_02, PATTERNS));
