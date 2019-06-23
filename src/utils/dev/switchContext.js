const chalk = require("chalk");
const fse = require("fs-extra");
const fs = require("fs");
const shell = require("shelljs");
const inquirer = require("inquirer");

// Box-style message for end
const boxen = require("boxen");
const BOXEN_OPTS = {
  padding: 1,
  margin: 1,
  align: "center",
  borderColor: "yellow",
  borderStyle: "round"
};

module.exports = {
  init: async function() {
    const extVersion = getExtVersion();
    const extName = getExtName();
    const extString = `${extName}${extVersion}`;

    let isDev = await getCurrentContext();
    console.log(
      boxen(
        `${extString} is in ${chalk.yellow(
          `${isDev ? "DEVELOPER" : "PRODUCTION"}`
        )}`,
        {
          ...BOXEN_OPTS,
          ...{
            borderColor: "white"
          }
        }
      )
    );
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "shouldSwitch",
          message: `Would you like to switch it to ${chalk.yellow(
            `${!isDev ? "DEVELOPER" : "PRODUCTION"}`
          )}`,
          default: true
        }
      ])
      .then(answer => {
        if (answer.shouldSwitch)
          switchContext()
            .then(res => {
              console.log(
                boxen(`Context switched to ${res}`, {
                  ...BOXEN_OPTS,
                  ...{
                    borderColor: "blue"
                  }
                })
              );
              console.log(`${chalk.green("✔ ")} Switch successful!`);
              endMessage(true);
            })
            .catch(err => {
              console.log(
                `${chalk.red(
                  "✘ "
                )} Something went wrong! Double-check your ${chalk.green(
                  "manifest.xml"
                )} file.`
              );
              return null;
            });
        else {
          console.log(`👍  All right!`);
          endMessage();
        }
      })
      .catch(err => {
        console.log("Closing...");
      });

    return "";
  }
};

async function endMessage(switched = false) {
  let finalstate = await getCurrentContext();
  if (finalstate)
    console.log(
      `Run ${chalk.yellow("npm run serve")} ${
        switched ? "and restart the app to continue developing" : "to continue"
      }.`
    );
  else
    console.log(
      `Ready for ${chalk.yellow("npm run build")} or ${chalk.yellow(
        "npm run sign"
      )}.`
    );
}

function getExtVersion() {
  const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
  const bundleVersion = /ExtensionBundleVersion\=\"(\d|\.)*(?=\")/;
  const matches = xml.match(bundleVersion);
  return matches.length ? matches[0].replace(/\w*\=\"/, "") : "Unknown";
}

function getExtName() {
  const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
  const bundleVersion = /Menu\>.*(?=\<)/;
  const matches = xml.match(bundleVersion);
  return matches.length
    ? matches[0]
        .replace(/Menu\>/, "")
        .split(" ")
        .join("-")
    : "Unknown";
}

async function getCurrentContext() {
  return new Promise((resolve, reject) => {
    const xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const isDev = /\<\!\--\s\<MainPath\>\.\/dist\/index\.html\<\/MainPath\>\s\-\-\>/;
    const isBuild = /\<\!\--\s\<MainPath\>\.\/public\/index\-dev\.html\<\/MainPath\>\s\-\-\>/;
    resolve(isDev.test(xml));
  });
}

function switchContext() {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    const isDev = /\<\!\--\s\<MainPath\>\.\/dist\/index\.html\<\/MainPath\>\s\-\-\>/;
    const isBuild = /\<\!\--\s\<MainPath\>\.\/public\/index\-dev\.html\<\/MainPath\>\s\-\-\>/;
    const isDevVanilla = /\<MainPath\>\.\/dist\/index\.html\<\/MainPath\>/;
    const isBuildVanilla = /\<MainPath\>\.\/public\/index\-dev\.html\<\/MainPath\>/;
    const devString = `<MainPath>./public/index-dev.html</MainPath>`;
    const buildString = `<MainPath>./dist/index.html</MainPath>`;
    const commentedDevString = `<!-- <MainPath>./public/index-dev.html</MainPath> -->`;
    const commentedBuildString = `<!-- <MainPath>./dist/index.html</MainPath> -->`;
    if (isDev.test(xml)) {
      xml = xml.replace(isDev, buildString);
      xml = xml.replace(isBuildVanilla, commentedDevString);
      fs.writeFileSync(`./CSXS/manifest.xml`, xml);
      resolve("PRODUCTION");
    } else if (isBuild.test(xml)) {
      xml = xml.replace(isBuild, devString);
      xml = xml.replace(isDevVanilla, commentedBuildString);
      fs.writeFileSync(`./CSXS/manifest.xml`, xml);
      resolve("DEVELOPER");
    } else {
      console.log("Whoops! Something went wrong.");
    }
  });
}

require("make-runnable/custom")({
  printOutputFrame: false
});
