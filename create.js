#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let port = 3000; // Default port

rl.question("Enter the project name: ", (projectName) => {
  rl.question(
    "Enter the directory where you want to create the project: ",
    (projectDir) => {
      rl.question("Do you want to include MongoDB? (yes/no): ", (includeDB) => {
        rl.question(
          "Enter the port number for the Express app: ",
          (enteredPort) => {
            port = enteredPort || port; // Use entered port or default
            rl.close();
            initializeProject(projectName, projectDir, includeDB, port);
          }
        );
      });
    }
  );
});

const mkdir = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });
const writeFile = (filePath, content) => fs.writeFileSync(filePath, content);

const projectStructure = {
  config: {},
  controllers: {},
  docs: {},
  middleware: {},
  models: {},
  public: {
    css: {},
    js: {},
    images: {},
  },
  routes: {},
  utils: {},
  views: {
    partials: {},
  },
};

const createStructure = (structure, currentPath) => {
  Object.keys(structure).forEach((folderName) => {
    const folderPath = path.join(currentPath, folderName);
    mkdir(folderPath);
    createStructure(structure[folderName], folderPath);
  });
};

const initializeProject = (projectName, projectDir, includeDB, port) => {
  if (projectDir) process.chdir(projectDir);
  mkdir(projectName);
  process.chdir(projectName);

  const projectPath = process.cwd();

  execSync(`npm init -y`, { stdio: "inherit" });
  execSync(`npm install express ejs body-parser dotenv`, { stdio: "inherit" });

  if (includeDB.toLowerCase() === "yes") {
    execSync(`npm install mongoose`, { stdio: "inherit" });
    const dbConfigContent = `
module.exports = {
  dbURI: process.env.MONGODB_URI
};
    `;
    writeFile(path.join(projectPath, "config", "database.js"), dbConfigContent);
  }

  createStructure(projectStructure, projectPath);

  const serverJsContent = `
  require('dotenv').config();
  const express = require('express');
  const bodyParser = require('body-parser');
  const app = express();
  const port = process.env.PORT || ${port}; // Port from user input
  
  app.use(express.static('public'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  app.set('views', './views');
  app.set('view engine', 'ejs');
  
  app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.listen(port, () => {
    console.log(\`Server running at http://localhost:\${port}/\`);
  });
    `;
    writeFile(path.join(projectPath, 'server.js'), serverJsContent);

    // Create a partials file for linking main.css
    const partialCSSLink = `<link rel="stylesheet" type="text/css" href="/css/main.css">`;
    writeFile(path.join(projectPath, 'views', 'partials', 'css.ejs'), partialCSSLink);
  
    // Update index.ejs to include the partial
    const updatedIndexEjsContent = `
  <%- include('partials/css') %>
  <h1>Welcome to your new Express project!</h1>
    `;
    writeFile(path.join(projectPath, 'views', 'index.ejs'), updatedIndexEjsContent);
  
    // Update .env with the selected port
    const envContent = `
  PORT=${port}
  MONGODB_URI=your_mongodb_connection_string_here
    `;
    writeFile(path.join(projectPath, '.env'), envContent);

    const gitIgnoreContent = "node_modules/\n.env\n";
const gitIgnorePath = path.join(projectPath, ".gitignore");

console.log(`Writing .gitignore to ${gitIgnorePath}`);
writeFile(gitIgnorePath, gitIgnoreContent);

};
