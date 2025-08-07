// simple code to write colorful logs using chalk
const chalk = require('chalk');
const log = console.log;

log(chalk.blue('Hello') + ' World' + chalk.red('!'));
log(chalk.red('Hello', chalk.underline.bgBlue('world') + '!'));
log(chalk.green(
    'I am a green line ' +
    chalk.blue.underline.bold('with a blue substring') +
    ' that becomes green again!'
))
log(`
CPU: ${chalk.red('90%')}
RAM: ${chalk.green('40%')}
DISK: ${chalk.yellow('70%')}
`);
;