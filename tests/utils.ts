import fs from "fs";
import path from "path";

export function loadFile(name: string) {
    const filePath = path.resolve("tests", "resources", name + ".coldun");

    const source = fs.readFileSync(filePath)?.toString();

    return {
        name,
        filePath,
        source
    }
}

test("utils", () => {
    expect("1").toMatch("1");
});