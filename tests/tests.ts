import { loadFile } from "./utils";
import { parser } from "../src/parser";

test("simple", () => {

    const file = loadFile("poc");
    expect(file.name).toMatch("poc");

});


test("regex mode", () => {

    const file = loadFile("timingtest");
    parser(file);
    expect(file.name).toMatch("timingtest");
});
