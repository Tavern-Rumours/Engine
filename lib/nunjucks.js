import nunjucks from "nunjucks";

let env;

export default function getNunjucksEnv(inputDir = "src/_includes") {
    if (!env) {
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(inputDir)
        );
    }

    return env;
}
