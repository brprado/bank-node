//módulos externos
const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar saldo",
          "Depositar",
          "Sacar",
          "Transferência bancária",
          "Renomear conta",
          "Excluir conta",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      //call functions (TUI INTERACTIONS)
      if (action === "Criar conta") {
        createAccount();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Consultar saldo") {
        getAccountBalance();
      } else if (action == "Renomear conta") {
        renameAccount();
      } else if (action == "Excluir conta") {
        deleteAccount();
      } else if (action == "Transferência bancária") {
        moneyTransferCheck();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts!"));
        process.exit();
      }
    });
}

// create user account
function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para a sua conta:",
      },
    ])
    .then((answer) => {
      console.info(answer["accountName"]);

      const accountName = answer["accountName"];

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("Esta conta já existe, escolha outro nome!")
        );
        buildAccount(accountName);
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance":0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, sua conta foi criada!"));
      operation();
    });
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"].toString().replace(",", ".");
          parseFloat(amount);
          addAmount(accountName, amount);
          operation();
        });
    });
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Esta conta não existe, escolha outro nome!")
    );
    return false;
  }
  return true;
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON); //JSON string top JS OBJ
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return deposit();
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData), //JS OBJ TO JSON OBJ
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(
      `Foi depositado o valor de R$${amount} da conta ${accountName}!`
    )
  );
}
//show account balance
function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta?",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];
      //verify if acc exists
      if (!checkAccount(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `A conta ${accountName} tem na sua carteira R$${accountData.balance}`
        )
      );
      setTimeout(() => {
        operation();
      }, 4000);
    })
    .catch((err) => {
      console.log(err);
      operation();
    });
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da sua conta: ",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];
      if (!checkAccount(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar? R$",
          },
        ])
        .then((answers) => {
          const amount = answers["amount"].toString().replace(",", ".");
          parseFloat(amount);
          withdrawAmount(accountName, amount);
          operation();

          // const amount = answers["amount"];
          // withdrawAmount(accountName, amount); //pegando dados do usuario e usando no parametro
        });
    });
}

function withdrawAmount(accountName, amount) {
  const accountData = getAccount(accountName); //return de json
  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!")
    );
    return withdraw();
  }

  if (accountData.balance < parseFloat(amount)) {
    console.log(
      chalk.bgRed.black(`Voce só pode sar valores até R$${accountData.balance}`)
    );
    return withdraw();
  }

  accountData.balance = accountData.balance - parseFloat(amount); //parse flaot = test

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData), //JS OBJ TO JSON
    (err) => {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi sacado o valor de R$${amount} da conta ${accountName}!`)
  );

  setTimeout(() => {
    operation();
  }, 4000);
}
//extra functions
//Func to delete acc
function deleteAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da conta que deseja apagar: ",
      },
    ])
    .then((answers) => {
      if (!checkAccount(answers["accountName"])) {
        return operation();
      }
      const accountName = answers["accountName"];

      console.log(chalk.bgYellow.black("Exluindo a conta..."));
      setTimeout(() => {
        console.log(".");
      }, 1000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 2000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 3000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 4000);
      setTimeout(() => {
        fs.unlinkSync(`accounts/${accountName}.json`, (err) => {
          console.log(err);
        });
        console.log(chalk.bgGreenBright.black("Conta deletada com sucesso!"));
        operation();
      }, 5000);
    })
    .catch((err) => console.log(err));
}

//func to rename acc

//FIXME ao renomear a conta o balance fica como null, o correto é manter a qunatia antiga (em aberto)

function renameAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da conta que deseja renomear: ",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];
      if (!checkAccount(answers["accountName"])) {
        return operation();
      }
      rename(`accounts/${accountName}.json`);
    })
    .catch((err) => console.log(err));
}
//function called after confirm if the acc exists
function rename(oldPath) {
  inquirer
    .prompt([
      {
        name: "renamedAccount",
        message: "Renomear conta para o nome: ",
      },
    ])
    .then((answers) => {
      const renamedAccount = answers["renamedAccount"];
      const newPath = `accounts/${renamedAccount}.json`;

      console.log(chalk.bgYellow.black("Renomeando a conta..."));
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 1000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 2000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 3000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 4000);
      setTimeout(() => {
        fs.renameSync(oldPath, newPath);
        console.log(chalk.bgGreenBright.black("Conta renomeada com sucesso!"));
        operation();
      }, 5000);
    });
}

function moneyTransferCheck() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Informe o nome da sua conta",
      },
    ])
    .then((answers) => {
      const accountName = answers["accountName"];
      if (!checkAccount(accountName)) {
        return operation();
      }
      inquirer
        .prompt([
          {
            name: "transferTo",
            message: "Informe o nome da conta que deseja transferir:",
          },
        ])
        .then((answers) => {
          const accountTransferName = answers["transferTo"];
          if (!checkAccount(accountTransferName)) {
            return operation();
          }
          successfulTransfer(accountName, accountTransferName);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function successfulTransfer(accountFrom, accountTo) {
  inquirer
    .prompt([
      {
        name: "amount",
        message: `${accountFrom}, informe a quantia que deseja transferir para a conta ${accountTo} R$`,
      },
    ])
    .then((answers) => {
      const amount = answers["amount"];
      const payer = getAccount(accountFrom);
      if (payer.amount < amount) {
        console.log(
          chalk.bgRed.black(
            `Saldo insuficiente. A quantida de R$${amount} não pode ser transferida, tente novamente`
          )
        );
        return operation();
      }
      //succesfull transaction code

      const payerDataJSON = fs.readFileSync(
        `accounts/${accountFrom}.json`,
        "utf-8"
      );
      const receiverDataJSON = fs.readFileSync(
        `accounts/${accountTo}.json`,
        "utf-8"
      );

      const payerDataOBJ = JSON.parse(payerDataJSON);
      const receiverDataOBJ = JSON.parse(receiverDataJSON);

      payerDataOBJ.balance = payerDataOBJ.balance - parseFloat(amount);
      receiverDataOBJ.balance = receiverDataOBJ.balance + parseFloat(amount);

      console.log(chalk.bgGreen.black("Transferindo o valor..."));
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 1000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 2000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 3000);
      setTimeout(() => {
        console.log(chalk.bgBlack("."));
      }, 4000);
      setTimeout(() => {
        fs.writeFileSync(
          `accounts/${accountFrom}.json`,
          JSON.stringify(payerDataOBJ)
        );
        fs.writeFileSync(
          `accounts/${accountTo}.json`,
          JSON.stringify(receiverDataOBJ)
        );
        console.log(
          chalk.green(
            `O valor de R$${amount} foi transferido da conta ${accountFrom} para a conta ${accountTo}`
          )
        );
        operation();
      }, 5000);
    })
    .catch((err) => console.log(err));
}
