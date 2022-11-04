function OPP(pathFrom, pattern) {
    let text = readFile(pathFrom);
    text = removeCommas(text);

    const matches = findText(text, pattern);

    const counterNum = findText(text, pattern.findCounterNumber).join("");

    let peaks = getPeaks(text);

    return { peaks };
}
