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
  init: async function() {
    const extVersion = getExtVersion();
    const extName = getExtName();
    const extString = `${extName}${extVersion}`;
    let user = shell.exec("git config user.name", { silent: true }).stdout;
    shell.config.silent = true;
    let pwd = shell.pwd();
    // pwd = pwd.replace("\\", "/");
    const rootDir = pwd.match(/[^\\|\/]*$/)[0];
    shell.config.silent = false;

    user = user.replace(" ", "-").trim();
    console.log(
      boxen(`🤘   Signing ${extString}`, {
        ...BOXEN_OPTS,
        ...{
          borderColor: "white"
        }
      })
    );

    await inquirer
      .prompt([
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
      ])
      .then(answer => {
        let spinner = ora({
          text: `Staging temp files...`,
          spinner: ORA_SPINNER
        }).start();
        // console.log(answer);
        stageExtensionFolder(extString).then(res => {
          // console.log(res);
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
              spinner.stopAndPersist({
                symbol: chalk.green("   ✔"),
                text: `Signing is complete.`
              });
              fse.removeSync(`./${extString}-tmp`);
              fse.removeSync(`./${root}/archive/temp1.p12`);
              console.log(
                boxen(`👍   ${extString}.zxp is ready!`, {
                  ...BOXEN_OPTS,
                  ...{
                    borderColor: "blue"
                  }
                })
              );
            });
          }, 1000);
        });
      })
      .catch(err => {
        console.log("Closing...");
      });

    return "";
  }
};

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

function signCommands(path, root, username, password, includeZip) {
  return new Promise((resolve, reject) => {
    shell.cd(`..`);
    // shell.exec(`ZXPSignCmd`);
    console.log(
      `ZXPSignCmd -selfSignedCert US AZ battleaxe ${username} ${password} ./${root}/archive/temp1.p12`
    );
    shell.exec(
      `ZXPSignCmd -selfSignedCert US AZ battleaxe ${username} ${password} ./${root}/archive/temp1.p12`
    );
    setTimeout(() => {
      console.log(
        `ZXPSignCmd -sign ./${path}-tmp ./${root}/archive/${path}.zxp ./${root}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
      );
      shell.exec(
        `ZXPSignCmd -sign ./${path}-tmp ./${root}/archive/${path}.zxp ./${root}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
      );

      if (includeZip)
        setTimeout(() => {
          shell.exec(
            `ZXPSignCmd -sign ./${path}-tmp ./${root}/archive/${path}.zip ./${root}/archive/temp1.p12 ${password} -tsa http://time.certum.pl`
          );
        }, 1000);
      setTimeout(() => {
        console.log(
          `ZXPSignCmd -verify ./${root}/archive/${path}.zxp -certinfo`
        );
        shell.exec(
          `ZXPSignCmd -verify ./${root}/archive/${path}.zxp -certinfo`
        );

        resolve();
      }, 1000);
    }, 1000);
    // shell.cd(`./${path.replace(`-tmp`, '')}`);
  }).catch(err => {
    //
  });
}

require("make-runnable/custom")({
  printOutputFrame: false
});
