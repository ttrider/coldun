export interface ParserSource {
    name?: string;
    filePath?: string;
    source: string;
}


interface ParserContext extends ParserSource {

}

export function parser(source: string | ParserSource) {

    const context: ParserContext = (typeof source === "string") ? { source } : source;

    collectStartTokens(context);
}



function collectStartTokens(context: ParserContext) {

    // start token markers
    // 2 - [
    // 3 - (
    // 4 - /
    // 5 - {
    // 6 - <
    // 7 - |
    // 8 - <[
    // 9 - <|
    // 10 - [| 
    // 11 - [||

    const startTokenRegex = /(^\s*((\[)|(\()|(\/)|(\{)|(\<)|(\|)|(\<\[)|(\<\|)|(\[\|)|(\[\|\|))\s+)/gm;

    // end token markers
    // 2 - ]
    // 3 - (
    // 4 - \
    // 5 - {
    // 6 - >
    // 7 - |
    // 8 - ]>
    // 9 - |>
    // 10 - |] 
    // 11 - ||]
    // 12 - ()
    // 13 - ])
    // 14 - }}

    const endTokenRegex = /\s+((\])|(\))|(\\)|(\})|(\>)|(\|)|(\]\<)|(\|\>)|(\]\>)|(\|\])|(\|\|\])|(\(\))|(\]\))|(\}\}))/gm;

    // comment blocks

    const commentTokenRegex = /(\/\/.*)|(```)/gm;




    const startTokens = getMarkers(startTokenRegex);
    const endTokens = getMarkers(endTokenRegex);
    const commentTokens = getMarkers(commentTokenRegex, 1);

    // post process comment tokens


    function getMarkers(regExp: RegExp, startIndex = 2) {
        const markers: { index: number; length: number; token: number }[] = [];
        let m: RegExpExecArray | null;
        while ((m = regExp.exec(context.source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regExp.lastIndex) {
                regExp.lastIndex++;
            }
            for (let index = startIndex; index < m.length; index++) {
                if (m[index]) {
                    markers.push({
                        index: m.index,
                        length: m.length,
                        token: index
                    });
                    break;
                }
            }
        }
        return markers;
    }

    function getCommentRegions(regExp: RegExp) {

        const markers: { start: number; end: number }[] = [];

        let state = 0;
        let startRegion = -1;

        let m: RegExpExecArray | null;
        while ((m = regExp.exec(context.source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regExp.lastIndex) {
                regExp.lastIndex++;
            }

            if (m[2]) { //found ```
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
            } else if (m[1]) {
                if (state === 0) // only if not inside the ```
                {
                    markers.push({ start: m.index, end: m.index + m.length });
                }
            }
        }
    }


}


function collectStartTokens2(context: ParserContext) {


    // detect ``` blocks first




    // start token markers
    // 2 - [
    // 3 - (
    // 4 - /
    // 5 - {
    // 6 - <
    // 7 - |
    // 8 - <[
    // 9 - <|
    // 10 - [| 
    // 11 - [||

    const startTokenRegex = new RegExp("^\\s*((\\[)|(\\()|(\\/)|(\\{)|(\\<)|(\\|)|(\\<\\[)|(\\<\\|)|(\\[\\|)|(\\[\\|\\|))\\s+", "gm");

    // end token markers
    // 2 - ]
    // 3 - (
    // 4 - \
    // 5 - {
    // 6 - >
    // 7 - |
    // 8 - ]>
    // 9 - |>
    // 10 - |] 
    // 11 - ||]
    // 12 - ()
    // 13 - ])
    // 14 - }}

    const endTokenRegex = new RegExp("\\s+((\\])|(\\))|(\\\\)|(\\})|(\\>)|(\\|)|(\\]\\<)|(\\|\\>)|(\\]\\>)|(\\|\\])|(\\|\\|\\])|(\\(\\))|(\\]\\))|(\\}\\}))", "gm");

    // comment blocks

    const commentTokenRegex = new RegExp("(\\/\\/.*)|(```)", "gm");




    const startTokens = getMarkers(startTokenRegex);
    const endTokens = getMarkers(endTokenRegex);
    const commentTokens = getMarkers(commentTokenRegex, 1);

    // post process comment tokens


    function getMarkers(regExp: RegExp, startIndex = 2) {
        const markers: { index: number; length: number; token: number }[] = [];
        let m: RegExpExecArray | null;
        while ((m = regExp.exec(context.source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regExp.lastIndex) {
                regExp.lastIndex++;
            }
            for (let index = startIndex; index < m.length; index++) {
                if (m[index]) {
                    markers.push({
                        index: m.index,
                        length: m.length,
                        token: index
                    });
                    break;
                }
            }
        }
        return markers;
    }

    function getCommentRegions(regExp: RegExp) {

        const markers: { start: number; end: number }[] = [];

        let state = 0;
        let startRegion = -1;

        let m: RegExpExecArray | null;
        while ((m = regExp.exec(context.source)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regExp.lastIndex) {
                regExp.lastIndex++;
            }

            if (m[2]) { //found ```
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
            } else if (m[1]) {
                if (state === 0) // only if not inside the ```
                {
                    markers.push({ start: m.index, end: m.index + m.length });
                }
            }
        }
    }


}



export default parser;

const comentToken = "(\\/\\/.*)";

const startTokenmap = [
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

const endTokenmap = [
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
const startTokensIndex = 5;
const endTokenIndex = startTokensIndex + startTokenmap.length + 2; //16
const idTokenIndex = endTokenIndex + endTokenmap.length + 2;
const styleTokenIndex = idTokenIndex + 1;

const pattern =
    "(\\/\\/.*)|(^\\s*("
    + startTokenmap.map(t => "(" + t.replace(/./gm, (v) => "\\" + v) + ")").join("|")
    + ")\\s+)|(\\s+("
    + endTokenmap.map(t => "(" + t.replace(/./gm, (v) => "\\" + v) + ")").join("|")
    + ")(:[a-zA-Z][a-zA-Z0-9_]*)?(@[a-zA-Z][a-zA-Z0-9_]*)?\\s)";


console.log(pattern);



