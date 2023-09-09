#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let port = 3000;
let includeAnimations = "no";

rl.question("Enter the project name: ", (projectName) => {
  rl.question("Enter the directory: ", (projectDir) => {
    rl.question("Include MongoDB? (yes/no): ", (includeDB) => {
      rl.question("Enter the port number: ", (enteredPort) => {
        rl.question("Include Animations? (yes/no): ", (ans) => {
          includeAnimations = ans;
          port = enteredPort || port;
          rl.close();
          initializeProject(
            projectName,
            projectDir,
            includeDB,
            port,
            includeAnimations
          );
        });
      });
    });
  });
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
    img: {},
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

const initializeProject = (
  projectName,
  projectDir,
  includeDB,
  port,
  includeAnimations
) => {
  if (projectDir) process.chdir(projectDir);
  mkdir(projectName);
  process.chdir(projectName);

  const projectPath = process.cwd();

  execSync(`npm init -y`, { stdio: "inherit" });
  execSync(`npm install express ejs body-parser dotenv`, { stdio: "inherit" });

  createStructure(projectStructure, projectPath);

  let dbContent = "";
  if (includeDB.toLowerCase() === "yes") {
    execSync(`npm install mongoose`, { stdio: "inherit" });
    dbContent = `
const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set("strictQuery", false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(\`MongoDB connected: \${conn.connection.host}\`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

module.exports = connectDB;
    `;
  }

  writeFile(path.join(projectPath, "config", "database.js"), dbContent);

  // Create main.css in the public/css folder
  const mainCSS = `body { background-color: gray; }`;
  writeFile(path.join(projectPath, "public", "css", "main.css"), mainCSS);

  const indexController = `
exports.homePage = (req, res) => {
  res.render('index');
};
  `;
  writeFile(
    path.join(projectPath, "controllers", "indexController.js"),
    indexController
  );

  const indexRoute = `
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');

router.get('/', indexController.homePage);

module.exports = router;
  `;
  writeFile(path.join(projectPath, "routes", "indexRoute.js"), indexRoute);

  // Create index.ejs in the views folder
  const indexEjs = `
  <!DOCTYPE html>
  <html>
  <head>
    <link rel="stylesheet" type="text/css" href="/css/main.css">
  </head>
  <body>
    <h1>Welcome to your new project!</h1>
  </body>
  </html>`;
  writeFile(path.join(projectPath, "views", "index.ejs"), indexEjs);

  if (includeAnimations.toLowerCase() === "yes") {
    const animationJS = `// Function to check if an element is in the viewport
    function isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top <= window.innerHeight &&
        rect.bottom >= 0
      );
    }
    
    // Function to toggle animation class
    function toggleAnimationClass(element, animationData) {
      const [animationClass, duration, fadeOutFlag] = animationData.split(" ");
      if (isInViewport(element)) {
        element.style.animationDuration = duration + 'ms';
        element.classList.add('animated', animationClass);
        if (fadeOutFlag === "fade-out") {
          element.classList.remove('fade-out');
        }
      } else if (fadeOutFlag === "fade-out") {
        element.classList.add('fade-out');
      }
    }
    
    // Main
    document.addEventListener('DOMContentLoaded', function() {
      const elementsToAnimate = document.querySelectorAll('[data-animate]');
      
      // Toggle the animation if already in/out viewport
      elementsToAnimate.forEach((element) => {
        toggleAnimationClass(element, element.getAttribute('data-animate'));
      });
    
      // Listen for scroll event
      window.addEventListener('scroll', function() {
        elementsToAnimate.forEach((element) => {
          toggleAnimationClass(element, element.getAttribute('data-animate'));
        });
      });
    });
    `;
    writeFile(path.join(projectPath, "public", "js", "animation.js"), animationJS);

    const animationCSS = `/*--------------------------------------------------------------
    # Animation classes
    --------------------------------------------------------------*/
    
    /* Common settings for all animations */
    .animated {
      animation-duration: 5.5s;
      animation-fill-mode: both;
    }
    
    /* Fade-in-up animation */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(2rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in-up {
      animation-name: fadeInUp;
    }
    
    /* Fade-in-down animation */
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-2rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .fade-in-down {
      animation-name: fadeInDown;
    }
    
    /* Fade-in-left animation */
    @keyframes fadeInLeft {
      from {
        opacity: 0;
        transform: translateX(-2rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .fade-in-left {
      animation-name: fadeInLeft;
    }
    
    /* Fade-in-right animation */
    @keyframes fadeInRight {
      from {
        opacity: 0;
        transform: translateX(2rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    .fade-in-right {
      animation-name: fadeInRight;
    }
    
    /* Fade-in-center animation */
    @keyframes fadeInCenter {
      from {
        opacity: 0;
        transform: scale(0);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    .fade-in-center {
      animation-name: fadeInCenter;
    }
    
    .fade-out {
      animation-name: fadeOut;
      animation-duration: 1s;
    }
    
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    } 
    `;
    writeFile(path.join(projectPath, "public", "css", "animation.css"), animationCSS);
  }    

  const serverSetup = `
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const indexRoute = require('./routes/indexRoute');
${
  includeDB.toLowerCase() === "yes"
    ? "const connectDB = require('./config/database');"
    : ""
}
const app = express();
const port = process.env.PORT || ${port};

${includeDB.toLowerCase() === "yes" ? "connectDB();" : ""}

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', './views');
app.set('view engine', 'ejs');

app.use('/', indexRoute);

app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}/\`);
});
  `;
  writeFile(path.join(projectPath, "server.js"), serverSetup);
};
