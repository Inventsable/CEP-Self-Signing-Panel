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

// Spinner component for terminal
const ora = require("ora");
const ORA_SPINNER = {
  interval: 80,
  frames: [
    "   ⠋",
    "   ⠙",
    "   ⠚",
    "   ⠞",
    "   ⠖",
    "   ⠦",
    "   ⠴",
    "   ⠲",
    "   ⠳",
    "   ⠓"
  ]
};

module.exports = {
  sign: async function() {
    // gathering data
    const extVersion = getExtVersion();
    const extName = getExtName();
    const extString = `${extName}${extVersion}`;
    let user = shell.exec("git config user.name", { silent: true }).stdout;
    shell.config.silent = true;
    let pwd = shell.pwd();
    const rootDir = pwd.match(/[^\\|\/]*$/)[0];
    shell.config.silent = false;
    user = user.replace(" ", "-").trim();

    // beginning the prompts
    console.log(`🤘   Signing ${extString}...`);
    console.log("");

    promptUser(user).then(answer => {
      let spinner = ora({
        text: `Staging temp files...`,
        spinner: ORA_SPINNER
      }).start();
      stageExtensionFolder(extString).then(res => {
        spinner.stopAndPersist({
          symbol: chalk.green("   ✔"),
          text: `Staging complete.`
        });
        spinner = ora({
          text: `Running ${chalk.yellow("ZXPSignCmd")} for you...`,
          spinner: ORA_SPINNER
        }).start();
        setTimeout(() => {
          signCommands(
            res,
            rootDir,
            answer.username,
            answer.password,
            answer.createZip
          ).then(() => {
            console.log("");
            spinner.stopAndPersist({
              symbol: chalk.green("   ✔"),
              text: `Signing is complete.`
            });
            fse.removeSync(`./${extString}-tmp`);
            fse.removeSync(`./${rootDir}/archive/temp1.p12`);
            console.log(
              boxen(`${extString}.zxp is ready!`, {
                ...BOXEN_OPTS,
                ...{
                  borderColor: "blue"
                }
              })
            );
            console.log(
              `   👍  You can find it in ${chalk.green(
                `./archive/${extString}.zxp`
              )}`
            );
            console.log("");
          });
        }, 1000);
      });
    });
    return "";
  },
  switch: async function() {
    const extVersion = getExtVersion();
    const extName = getExtName();
    const extString = `${extName}${extVersion}`;

    let isDev = await getCurrentContext();
    console.log(
      boxen(
        `${extString} is in ${chalk.blue(
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
          message: `Would you like to switch it to ${chalk.blue(
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
                boxen(`Context switched to ${chalk.blue(res)}`, {
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
  },
  update: async function() {
    const extVersion = getExtVersion();
    const extName = getExtName();

    console.log(
      boxen(`${extName} is currently ${chalk.green(`v${extVersion}`)}`, {
        ...BOXEN_OPTS,
        ...{
          borderColor: "white"
        }
      })
    );
    await inquirer
      .prompt([
        {
          type: "confirm",
          name: "shouldUpdate",
          message: `Update version?`,
          default: true
        }
      ])
      .then(answer => {
        if (answer.shouldUpdate) {
          findTier(extVersion.split(".")).then(answerver => {
            let chosen = extVersion.split(".")[answerver.versionIndex];
            promptNewNumber(chosen).then(ans => {
              let newVersion = extVersion.split(".");
              newVersion[answerver.versionIndex] = ans.newTier;
              setExtVersion(extVersion, newVersion).then(updated => {
                console.log(`${chalk.green("✔ ")} Update successful!`);
                console.log(
                  boxen(`${extName} updated to ${chalk.green(`v${updated}`)}`, {
                    ...BOXEN_OPTS,
                    ...{
                      borderColor: "green"
                    }
                  })
                );
              });
            });
          });
        } else {
          console.log(`👍  All right! No changes will be made.`);
          endMessage();
        }
      })
      .catch(err => {
        //
      });

    return "";
  }
};

// GLOBAL
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
// ----------------------------------

// SIGN
//
async function promptUser(user) {
  return await inquirer.prompt([
    {
      type: "input",
      name: "password",
      message: "Password for certificate",
      default: "hello-world"
    },
    {
      type: "input",
      name: "username",
      message: "User name",
      default: user
    },
    {
      type: "confirm",
      name: "createZip",
      message: "Create a ZIP aswell?",
      default: true
    }
  ]);
}

async function confirmSign() {
  return await inquirer.prompt([
    {
      type: "Confirm",
      message: "Are you ready to proceed?",
      name: "confirmation",
      default: true
    }
  ]);
}

function stageExtensionFolder(extString) {
  return new Promise((resolve, reject) => {
    let tempdir = [];
    fs.readdir("./", (err, list) => {
      if (err) reject("Error encountered while reading directory for staging.");
      list.forEach(filename => {
        if (!/^(\.git)|(node\_modules)|(archive)/.test(filename)) {
          if (filename) tempdir.push(filename);
        }
      });
      try {
        fs.mkdirSync(`../${extString}-tmp`);
        tempdir.forEach(file => {
          fse.copy(`./${file}`, `../${extString}-tmp/${file}`);
        });
        try {
          fs.mkdirSync(`./archive`);
        } catch (err) {
          //
        }
        resolve(`${extString}`);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function signCommands(path, rootpath, username, password, includeZip) {
  return new Promise((resolve, reject) => {
    shell.cd(`..`);
    // shell.exec(`ZXPSignCmd`);
    console.log(
      `ZXPSignCmd -selfSignedCert US AZ battleaxe ${username} ${password} ./${rootpath}/archive/temp1.p12`
    );
    shell.exec(
      `ZXPSignCmd -selfSignedCert US AZ battleaxe ${username} ${password} ./${rootpath}/archive/temp1.p12`
    );
    setTimeout(() => {
      console.log(
        `ZXPSignCmd -sign ./${path}-tmp ./${rootpath}/archive/${path}.zxp ./${rootpath}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
      );
      shell.exec(
        `ZXPSignCmd -sign ./${path}-tmp ./${rootpath}/archive/${path}.zxp ./${rootpath}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
      );

      if (includeZip)
        setTimeout(() => {
          shell.exec(
            `ZXPSignCmd -sign ./${path}-tmp ./${rootpath}/archive/${path}.zip ./${rootpath}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
          );
        }, 1000);
      setTimeout(() => {
        console.log(
          `ZXPSignCmd -verify ./${rootpath}/archive/${path}.zxp -certinfo`
        );
        shell.exec(
          `ZXPSignCmd -verify ./${rootpath}/archive/${path}.zxp -certinfo`
        );

        resolve();
      }, 1000);
    }, 1000);
    // shell.cd(`./${path.replace(`-tmp`, '')}`);
  }).catch(err => {
    //
  });
}
// -----------------------------

// SWITCH
//
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
// ----------------------------

// UPDATE
//
async function findTier(original) {
  return await inquirer.prompt([
    {
      type: "list",
      name: "versionIndex",
      message: "Choose tier to update",
      choices: [
        {
          name: `Major (${original[0]}.x.x)`,
          value: 0
        },
        {
          name: `Minor (x.${original[1]}.x)`,
          value: 1
        },
        {
          name: `Micro (x.x.${original[2]})`,
          value: 2
        }
      ]
    }
  ]);
}

async function promptNewNumber(old) {
  return await inquirer.prompt([
    {
      type: "Number",
      message: "Enter new value for tier",
      default: +old + 1,
      name: "newTier"
    }
  ]);
}

function setExtVersion(older, newer) {
  return new Promise((resolve, reject) => {
    let xml = fs.readFileSync(`./CSXS/manifest.xml`, { encoding: "utf-8" });
    let rx = new RegExp(`${older.split(".").join("\\.")}`);
    xml = xml.split(rx).join(newer.join("."));
    fs.writeFileSync(`./CSXS/manifest.xml`, xml);
    resolve(newer.join("."));
  });
}
//  -----------------------------------

require("make-runnable/custom")({
  printOutputFrame: false
});
