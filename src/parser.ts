export interface ParserSource {
    name?: string;
    filePath?: string;
    source: string;
}


interface ParserContext extends ParserSource {
    rootShape: Shape;
}

interface Shape {



    leftToken?: number;
    leftTokenStartPos?: number;
    leftTokenEndPos?: number;

    rightToken?: number;
    rightTokenStartPos?: number;
    rightTokenEndPos?: number;

    text?: string;

    startTextPos?: number;

    children: Shape[];

}

export function parser(source: string | ParserSource) {

    const context: ParserContext =
    {
        rootShape: { children: [] },
        ...((typeof source === "string") ? { source } : source)
    };

    if (!context.source.endsWith("\n")) {
        context.source += "\n";
    }

    collectTokens(context);

    return context;
}

function collectTokens(context: ParserContext) {

    const excludeRegions = processExcludeRegions();

    //const regex = new RegExp(pattern, "gm");
    const regex = /(\/\/.*)|(^\s*((\[)|(\()|(\/)|(\{)|(\<)|(\|)|(\<\[)|(\<\|)|(\[\|)|(\[\|\|))\s+)|(\s+((\])|(\()|(\\)|(\{)|(\>)|(\|)|(\]\>)|(\|\>)|(\|\]\ )|(\|\|\])|(\(\))|(\]\))|(\}\}))(:[a-zA-Z][a-zA-Z0-9_]*)?(@[a-zA-Z][a-zA-Z0-9_]*)?[\s$])/gm;


    const shapes: Shape[] = [];
    let state = 0;
    let current: Shape | undefined = context.rootShape;

    let m: RegExpExecArray | null;
    while ((m = regex.exec(context.source)) !== null) {

        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        processMatch(m);
    }

    function processMatch(m: RegExpExecArray) {
        const index = m.index;
        const length = m[0].length;

        // validate position
        // TODO: need more efficient algorythm here
        if (excludeRegions.findIndex(item => item.start <= index && item.end > index) !== -1) {
            console.info("excluded");
            return;
        }

        if (m[inlineCommentIndex]) {
            // found another comment;
            excludeRegions.push({ start: m.index, end: m.index + m.length });
            console.info("inline comment found: excluded");
            return;
        }

        for (let i = leftTokenStartIndex; i < leftTokenEndIndex; i++) {
            if (m[i]) {

                console.info(`new left shape id: ${i} (${m[i]})`);

                const newShape = {
                    leftToken: i,
                    leftTokenStartPos: index,
                    leftTokenEndPos: index + length,

                    children: [],

                    startTextPos: index + length
                };

                if (!current) {
                    // report error
                    return;
                }


                // check for text
                if (current.startTextPos !== undefined) {
                    const textNode = {
                        children: [],
                        text: context.source.substring(current.startTextPos, index)
                    };

                    current.children.push(textNode);
                }

                current.children.push(newShape);
                shapes.push(current);
                current = newShape;
                return;
            }
        }

        for (let i = rightTokenStartIndex; i < rightTokenEndIndex; i++) {
            if (m[i]) {
                console.info(`new right shape id: ${i} (${m[i]})`);

                if (!current) {
                    //report error
                    return;
                }

                if (current.startTextPos) {
                    const textNode = {
                        children: [],
                        text: context.source.substring(current.startTextPos, index)
                    };

                    current.children.push(textNode);
                }

                current.rightToken = i;
                current.rightTokenStartPos = index;
                current.rightTokenEndPos = index + length;

                const startTextPos = current.rightTokenEndPos;

                current = shapes.pop();
                if (current) { current.startTextPos = startTextPos; }
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
const leftTokenStartIndex = 4;
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



