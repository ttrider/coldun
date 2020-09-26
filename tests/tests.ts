import { loadFile } from "./utils";
import { parser } from "../src/parser";

test("simple", () => {

    const file = loadFile("poc");
    const context = parser(file);

    expect(file.name).toMatch("poc");

});


test("regex mode", () => {

    const file = loadFile("timingtest");
    const context = parser(file);
    console.info(JSON.stringify(context, null, 2));
    expect(file.name).toMatch("timingtest");
});
