import command from '../config.json' assert {type: 'json'};
import { HELP } from "./commands/help";
import { BANNER } from "./commands/banner";
import { ABOUT } from "./commands/about"
import { DEFAULT } from "./commands/default";
import { PROJECTS } from "./commands/projects";
import { createWhoami } from "./commands/whoami";

//mutWriteLines gets deleted and reassigned
let mutWriteLines = document.getElementById("write-lines");
let historyIdx = 0
let tempInput = ""
let userInput : string;
let isSudo = false;
let isPasswordInput = false;
let passwordCounter = 0;
let bareMode = false;

//WRITELINESCOPY is used to during the "clear" command
const WRITELINESCOPY = mutWriteLines;
const TERMINAL = document.getElementById("terminal");
const USERINPUT = document.getElementById("user-input") as HTMLInputElement;
const INPUT_HIDDEN = document.getElementById("input-hidden");
const PASSWORD = document.getElementById("password-input");
const PASSWORD_INPUT = document.getElementById("password-field") as HTMLInputElement;
const PRE_HOST = document.getElementById("pre-host");
const PRE_USER = document.getElementById("pre-user");
const HOST = document.getElementById("host");
const USER = document.getElementById("user");
const PROMPT = document.getElementById("prompt");
let COMMANDS = ["help", "about", "projects", "whoami", "banner", "clear", "visit", "visit linkedin", "visit github", "send", "send email", "rm -rf", "sudo", "ls", "exit", "show", "show skills", "show experience", "download", "download resume"];
COMMANDS = [...COMMANDS, ...command.projects.map((project) => {
  return "show "+project[0].toLowerCase();
})]
const HISTORY : string[] = [];
const SUDO_PASSWORD = command.password;

const scrollToBottom = () => {
  const MAIN = document.getElementById("main");
  if(!MAIN) return

  MAIN.scrollTop = MAIN.scrollHeight;
}

function userInputHandler(e : KeyboardEvent) {
  const key = e.key;

  switch(key) {
    case "Enter":
      e.preventDefault();
      if (!isPasswordInput) {
        enterKey();
      } else {
        passwordHandler();
      }

      scrollToBottom();
      break;
    case "Escape":
      USERINPUT.value = "";
      break;
    case "ArrowUp":
      arrowKeys(key);
      e.preventDefault();
      break;
    case "ArrowDown":
      arrowKeys(key);
      break;
    case "Tab":
      tabKey();
      e.preventDefault();
      break;
  }
}

function enterKey() {
  if (!mutWriteLines || !PROMPT) return
  const resetInput = "";
  let newUserInput;
  userInput = USERINPUT.value;

  if (bareMode) {
    newUserInput = userInput;
  } else {
    newUserInput = `<span class='output'>${userInput}</span>`;
  }

  HISTORY.push(userInput);
  historyIdx = HISTORY.length

  if (userInput === 'clear') {
    commandHandler(userInput.toLowerCase().trim());
    USERINPUT.value = resetInput;
    userInput = resetInput;
    return
  }

  const div = document.createElement("div");
  div.innerHTML = `<span id="prompt">${PROMPT.innerHTML}</span> ${newUserInput}`;

  if (mutWriteLines.parentNode) {
    mutWriteLines.parentNode.insertBefore(div, mutWriteLines);
  }

  /*
  if input is empty or a collection of spaces, 
  just insert a prompt before #write-lines
  */
  if (userInput.trim().length !== 0) {
      commandHandler(userInput.toLowerCase().trim());
    }
  
  USERINPUT.value = resetInput;
  userInput = resetInput; 
}

function tabKey() {
  let currInput = USERINPUT.value;

  for (const ele of COMMANDS) {
    if(ele.startsWith(currInput)) {
      USERINPUT.value = ele;
      return
    }
  }
}

function arrowKeys(e : string) {
  switch(e){
    case "ArrowDown":      
      if (historyIdx !== HISTORY.length) {
          historyIdx += 1;
          USERINPUT.value = HISTORY[historyIdx];
          if (historyIdx === HISTORY.length) USERINPUT.value = tempInput;  
      }      
      break;
    case "ArrowUp":
      if (historyIdx === HISTORY.length) tempInput = USERINPUT.value;
      if (historyIdx !== 0) {
        historyIdx -= 1;
        USERINPUT.value = HISTORY[historyIdx];
      }
      break;
  }
}

let customSwitch = [
  {
    condition: "clear",
    fn() {
      setTimeout(() => {
        if (!TERMINAL || !WRITELINESCOPY) return;
        TERMINAL.innerHTML = "";
        TERMINAL.appendChild(WRITELINESCOPY);
        mutWriteLines = WRITELINESCOPY;
      });
    }
  },
  {
    condition: "banner",
    fn() {
      if (bareMode) {
        writeLines(["dakkkshh", "<br>"]);
      } else {
        writeLines(BANNER);
      }
    }
  },
  {
    condition: "help",
    fn() {
      if (bareMode) {
        writeLines(["maybe restarting your browser will fix this.", "<br>"]);
      } else {
        writeLines(HELP);
      }
    }
  },
  {
    condition: "whoami",
    fn() {
      if (bareMode) {
        writeLines([`${command.username}`, "<br>"]);
      } else {
        writeLines(createWhoami());
      }
    }
  },
  {
    condition: "about",
    fn() {
      if (bareMode) {
        writeLines(["Nothing to see here.", "<br>"]);
      } else {
        writeLines(ABOUT);
      }
    }
  },
  {
    condition: "projects",
    fn() {
      if (bareMode) {
        writeLines(["I don't want you to break the other projects.", "<br>"]);
      } else {
        writeLines(PROJECTS);
      }
    }
  },
  {
    condition: "visit linkedin",
    fn() {
      writeLines(["Redirecting to linkedin.com...", "<br>"]);
      setTimeout(() => {
        window.open(`https://www.linkedin.com/in/${command.social.linkedin}`, "_blank");
      }, 500);
    }
  },
  {
    condition: "visit github",
    fn() {
      writeLines(["Redirecting to github.com...", "<br>"]);
      setTimeout(() => {
        window.open(`https://github.com/${command.social.github}`, '_blank');
      }, 500);
    }
  },
  {
    condition: "visit",
    fn() {
      writeLines(["Visit where? Try <span class='command'>'visit github'</span> or <span class='command'>'visit linkedin'</span>.", "<br>"]);
    }
  },
  {
    condition: "send",
    fn() {
      writeLines(["Send what? Try <span class='command'>'send email'</span>.", "<br>"]);
    }
  },
  {
    condition: "send email",
    fn() {
      writeLines(["Redirecting to your email client...", "<br>"]);
      setTimeout(() => {
        window.open(`mailto:${command.social.email}`, "_blank");
      }, 500);
    }
  },
  {
    condition: "rm -rf",
    fn() {
      if (bareMode) {
        writeLines(["don't try again.", "<br>"]);
      } else {
        if (isSudo) {
          writeLines(["Usage: <span class='command'>'rm -rf &lt;dir&gt;'</span>", "<br>"]);
        } else {
          writeLines(["Permission not granted. Try sudo first. For password use my username.", "<br>"]);
        }
      }
    }
  },
  {
    condition: "sudo",
    fn() {
      if (bareMode) {
        writeLines(["no.", "<br>"]);
      } else {
        if (!PASSWORD) return;
        isPasswordInput = true;
        USERINPUT.disabled = true;

        if (INPUT_HIDDEN) INPUT_HIDDEN.style.display = "none";
        PASSWORD.style.display = "block";
        setTimeout(() => {
          PASSWORD_INPUT.focus();
        }, 100);
      }
    }
  },
  {
    condition: "ls",
    fn() {
      if (bareMode) {
        writeLines(["", "<br>"]);
      } else {
        if (isSudo) {
          writeLines(["src", "<br>"]);
        } else {
          writeLines(["Permission not granted. Try sudo first. For password use my username.", "<br>"]);
        }
      }
    }
  },
  {
    condition: "download",
    fn() {
      writeLines(["Download what? Try <span class='command'>'download resume'</span>.", "<br>"]);
    }
  },
  {
    condition: "download resume",
    fn() {
      writeLines(["Redirecting to resume...", "<br>"]);
      setTimeout(() => {
        window.open(command['resume-link'], "_blank");
      }, 500);
    }
  },
  {
    condition: "show",
    fn() {
      if (bareMode) {
        writeLines(["show what?", "<br>"]);
        return;
      }
      const writeLinesArray = ["Usage: <span class='command'>'show &lt;resource&gt;'</span>", "<br>"];
      writeLinesArray.push("Available commands: ");
      writeLinesArray.push("<br>");
      writeLinesArray.push(`<span class='command'>💡 'show skills'</span>`);
      writeLinesArray.push(`<br>`);
      writeLinesArray.push(`<span class='command'>💻 'show experience'</span>`);
      writeLinesArray.push(`<br>`);
      for (const project of command.projects) {
        writeLinesArray.push(`<span class='command'>'show ${project[0].toLowerCase()}'</span>`);
      }
      writeLines(writeLinesArray);
    }
  },
  {
    condition: "show skills",
    fn() {
      if (bareMode) {
        writeLines(["show what?", "<br>"]);
        return;
      }
      const showSkillsArray = ["💡 Skills:", "<br>"];
      for (const [key, value] of Object.entries(command.skills)) {
        showSkillsArray.push(`<span class='command'>${key}</span>`);
        showSkillsArray.push(`: ${value}`);
        showSkillsArray.push("<br>");
      }
      writeLines(showSkillsArray);
    }
  },
  {
    condition: "show experience",
    fn() {
      if (bareMode) {
        writeLines(["show what?", "<br>"]);
        return;
      }
      const showExperienceArray = ["💻 Experience:", "<br>"];
      for (const experience of command.experience){
        showExperienceArray.push(`<span class='command'>${experience.role}</span>: ${experience.company}`);
        showExperienceArray.push(`${experience.dates}`);
        showExperienceArray.push("<br>");

        for (const description of experience.description){
          showExperienceArray.push(`• ${description}`);
          showExperienceArray.push("<br>");
        }
        showExperienceArray.push("<br>");
      }
      writeLines(showExperienceArray);
    
    }
  },
  {
    condition: "exit",
    fn() {
      writeLines(["Goodbye.", "<br>"]);
      setTimeout(() => {
        window.close();
      }, 1000);
    }
  }
];

customSwitch = [...customSwitch, ...command.projects.map((project) => {
  return {
    condition: "show "+project[0].toLowerCase(),
    fn() {
      if (bareMode) {
        writeLines(["show what?", "<br>"]);
        return;
      }
      writeLines([`Redirecting to ${project[0]}...`, "<br>"]);
      setTimeout(() => {
        window.open(project[2], "_blank");
      }, 500);
    }
  }
})]

function commandHandler(input : string) {
  if(input.startsWith("rm -rf") && input.trim() !== "rm -rf") {
    if (isSudo) {
      if(input === "rm -rf src" && !bareMode) {
        bareMode = true;

        setTimeout(() => {
          if(!TERMINAL || !WRITELINESCOPY) return
          TERMINAL.innerHTML = "";
          TERMINAL.appendChild(WRITELINESCOPY);
          mutWriteLines = WRITELINESCOPY;
        });

        easterEggStyles();
        setTimeout(() => {
          writeLines(["What made you think that was a good idea?", "<br>"]);
        }, 200)

        setTimeout(() => {
          writeLines(["Now everything is ruined.", "<br>"]);
        }, 1200)

        } else if (input === "rm -rf src" && bareMode) {
          writeLines(["there's no more src folder.", "<br>"])
        } else {
          if(bareMode) {
            writeLines(["What else are you trying to delete?", "<br>"])
          } else {
            writeLines(["<br>", "Directory not found.", "type <span class='command'>'ls'</span> for a list of directories.", "<br>"]);
          }
        } 
      } else {
        writeLines(["Permission not granted. Try sudo first. For password use my username.", "<br>"]);
    }
    return
  }

  const commandToExecute = customSwitch.find((ele) => ele.condition === input);
  if(commandToExecute) {
    commandToExecute.fn();
  } else {
    if (bareMode) {
      writeLines(["type 'help'", "<br>"]);
    } else {
      writeLines(DEFAULT);
    }
  }

  return;
}

function writeLines(message : string[]) {
  message.forEach((item, idx) => {
    displayText(item, idx);
  });
}

function displayText(item : string, idx : number) {
  setTimeout(() => {
    if(!mutWriteLines) return
    const p = document.createElement("p");
    p.innerHTML = item;
    mutWriteLines.parentNode!.insertBefore(p, mutWriteLines);
    scrollToBottom();
  }, 40 * idx);
}

function revertPasswordChanges() {
    if (!INPUT_HIDDEN || !PASSWORD) return
    PASSWORD_INPUT.value = "";
    USERINPUT.disabled = false;
    INPUT_HIDDEN.style.display = "block";
    PASSWORD.style.display = "none";
    isPasswordInput = false;

    setTimeout(() => {
      USERINPUT.focus();
    }, 200)
}

function passwordHandler() {
  if (passwordCounter === 2) {
    if (!INPUT_HIDDEN || !mutWriteLines || !PASSWORD) return
    writeLines(["<br>", "INCORRECT PASSWORD.", "PERMISSION NOT GRANTED.", "<br>"])
    revertPasswordChanges();
    passwordCounter = 0;
    return
  }

  if (PASSWORD_INPUT.value === SUDO_PASSWORD) {
    if (!mutWriteLines || !mutWriteLines.parentNode) return
    writeLines(["<br>", "PERMISSION GRANTED.", "Try <span class='command'>'rm -rf'</span>", "<br>"])
    revertPasswordChanges();
    isSudo = true;
    return
  } else {
    PASSWORD_INPUT.value = "";
    passwordCounter++;
  }
}

function easterEggStyles() {   
  const bars = document.getElementById("bars");
  const body = document.body;
  const main = document.getElementById("main");
  const span = document.getElementsByTagName("span");

  if (!bars) return
  bars.innerHTML = "";
  bars.remove()

  if (main) main.style.border = "none";

  body.style.backgroundColor = "black";
  body.style.fontFamily = "VT323, monospace";
  body.style.fontSize = "20px";
  body.style.color = "white";

  for (let i = 0; i < span.length; i++) {
    span[i].style.color = "white";
  }

  USERINPUT.style.backgroundColor = "black";
  USERINPUT.style.color = "white";
  USERINPUT.style.fontFamily = "VT323, monospace";
  USERINPUT.style.fontSize = "20px";
  if (PROMPT) PROMPT.style.color = "white";

}

const initEventListeners = () => {
  if(HOST) {
    HOST.innerText= command.hostname;
  }

  if(USER) {
    USER.innerText = command.username;
  }

  if(PRE_HOST) {
    PRE_HOST.innerText= command.hostname;
  }

  if(PRE_USER) {
    PRE_USER.innerText = command.username;
  } 

    window.addEventListener('load', () => {
    writeLines(BANNER);
  });
  
  USERINPUT.addEventListener('keypress', userInputHandler);
  USERINPUT.addEventListener('keydown', userInputHandler);
  PASSWORD_INPUT.addEventListener('keypress', userInputHandler);

  window.addEventListener('click', () => {
    USERINPUT.focus();
  });

  console.log(`%cPassword: ${command.password}`, "color: red; font-size: 20px;");
}

initEventListeners();
