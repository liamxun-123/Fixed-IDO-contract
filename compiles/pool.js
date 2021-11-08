const solc = require('solc')
const path = require('path')
const fs = require('fs-extra')

const buildPath = path.join(__dirname, '../builds')
fs.removeSync(path.join(buildPath, 'Pool.json'))
fs.removeSync(path.join(buildPath, 'Whitelist.json'))

const poolPath = path.join(__dirname, '../contracts/Pool.sol')
const source = fs.readFileSync(poolPath, 'utf8')

function findImports(path) {
  return {
      'contents': fs.readFileSync(path).toString()
  }
}

const input = {
    language: 'Solidity',
    sources: {
      'Pool.sol': {
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
  path.join(buildPath, 'Whitelist.json'),
  output.contracts['Pool.sol']['Whitelist']
)

fs.outputJSONSync(
  path.join(buildPath, 'Pool.json'),
  output.contracts['Pool.sol']['Pool']
)