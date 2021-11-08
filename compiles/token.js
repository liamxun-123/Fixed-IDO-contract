const solc = require('solc')
const path = require('path')
const fs = require('fs-extra')

const buildPath = path.join(__dirname, '../builds')
fs.removeSync(path.join(buildPath, 'Token.json'))
const tokenPath = path.join(__dirname, '../contracts/Token.sol')
const source = fs.readFileSync(tokenPath, 'utf8')

function findImports(path) {
  return {
      'contents': fs.readFileSync(path).toString()
  }
}

const input = {
    language: 'Solidity',
    sources: {
      'Token.sol': {
          content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  };

const output = JSON.parse(solc.compile(JSON.stringify(input), {import: findImports}));

fs.ensureDirSync(buildPath)
fs.outputJSONSync(
  path.join(buildPath, 'Token.json'),
  output.contracts['Token.sol']['Token']
)

