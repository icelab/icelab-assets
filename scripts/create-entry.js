'use strict';

const fs = require('fs-extra');
const isEmptyDir = require('empty-dir');
const path = require('path');
const chalk = require('chalk');

const ownPath = path.join(__dirname, '..');

createEntry(process.argv.slice(2))

function createEntry(args) {
  const [entryPath] = args
  // Check if directory exists
  const entryDirExists = fs.existsSync(entryPath);
  if (!entryDirExists) {
    // Create directory
    fs.ensureDirSync(entryPath);
  }
  // Check if the target directory is empty
  const entryDirIsEmpty = isEmptyDir.sync(entryPath)
  if (entryDirIsEmpty) {
    // Copy all the files from our ./template directory
    const templatePath = path.join(ownPath, 'template');
      if (fs.existsSync(templatePath)) {
        fs.copySync(templatePath, entryPath);
        console.log(`Success! Created entry at: ${chalk.green(entryPath)}`);
      } else {
        console.error(
          `Could not locate supplied template: ${chalk.green(templatePath)}`
        );
        return;
      }
  } else {
    console.error(
      `Could not create entry at ${chalk.green(entryPath)} as it contains existing files.`
    );
  }
}