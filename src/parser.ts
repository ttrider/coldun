export interface ParserSource {
    name?: string;
    filePath?: string;
    source: string;
}


interface ParserContext extends ParserSource {

}

interface Shape {

    parent?: Shape;
    leftToken: number;
    leftTokenEndPos: number;

}

export function parser(source: string | ParserSource) {

    const context: ParserContext = (typeof source === "string") ? { source } : source;

    collectStartTokens(context);
}



function collectStartTokens(context: ParserContext) {

    const excludeRegions = processExcludeRegions();

    const regex = new RegExp(pattern, "gm");

    let state = 0;
    let current: Shape | undefined;

    let m: RegExpExecArray | null;
    while ((m = regex.exec(context.source)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }



        processMatch(m);





        leftTokenmap




    }

    function processMatch(m: RegExpExecArray) {
        const index = m.index;
        const length = m.length;

        // validate position
        // TODO: need more efficient algorythm here
        if (excludeRegions.findIndex(item => item.start <= index && item.end > index) !== -1) {
            return;
        }

        if (m[inlineCommentIndex]) {
            // found another comment;
            excludeRegions.push({ start: m.index, end: m.index + m.length });
            return;
        }

        for (let i = leftTokenStartIndex; i < leftTokenEndIndex; i++) {
            if (m[i]) {
                if (!current) {
                    current = { leftToken: i, leftTokenEndPos: index + length };
                } else {
                    current = { parent: current, leftToken: i, leftTokenEndPos: index + length };
                }
                return;
            }
        }
    }


    function processExcludeRegions() {
        const excludeRegionRegex = /(^\s*```)|(```.*?```)/gm;

        const markers: { start: number; end: number }[] = [];

        let state = 0;
        let startRegion = -1;

        let m: RegExpExecArray | null;
        while ((m = excludeRegionRegex.exec(context.source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === excludeRegionRegex.lastIndex) {
                excludeRegionRegex.lastIndex++;
            }

            if (m[1]) { //found standalone ```
                switch (state) {
                    case 0:
                        state = 1; // mark start region
                        startRegion = m.index;
                        break;
                    case 1:
                        state = 0; // mark end regoin
                        markers.push({ start: startRegion, end: m.index + m.length });
                        break;
                }
            } else if (m[2]) {
                if (state === 0) // only if not inside the block ```
                {
                    markers.push({ start: m.index, end: m.index + m.length });
                }
            }
        }

        return markers;
    }
}




export default parser;

const comentToken = "(\\/\\/.*)";

const leftTokenmap = [
    "[",
    "(",
    "/",
    "{",
    "<",
    "|",
    "<[",
    "<|",
    "[|",
    "[||"
];

const rightTokenmap = [
    "]",
    "(",
    "\\",
    "{",
    ">",
    "|",
    "]>",
    "|>",
    "|] ",
    "||]",
    "()",
    "])",
    "}}"
];

const inlineCommentIndex = 1;
const leftTokenStartIndex = 5;
const leftTokenEndIndex = leftTokenStartIndex + leftTokenmap.length;

const rightTokenStartIndex = leftTokenEndIndex + 2; //16
const rightTokenEndIndex = rightTokenStartIndex + rightTokenmap.length;

const idTokenIndex = rightTokenEndIndex + 2;
const styleTokenIndex = idTokenIndex + 1;

const pattern =
    "(\\/\\/.*)|(^\\s*("
    + leftTokenmap.map(t => "(" + t.replace(/./gm, (v) => "\\" + v) + ")").join("|")
    + ")\\s+)|(\\s+("
    + rightTokenmap.map(t => "(" + t.replace(/./gm, (v) => "\\" + v) + ")").join("|")
    + ")(:[a-zA-Z][a-zA-Z0-9_]*)?(@[a-zA-Z][a-zA-Z0-9_]*)?\\s)";


console.log(pattern);



