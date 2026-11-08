import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function isJdk21(candidate) {
  const releaseFile = join(candidate, 'release')

  if (!existsSync(releaseFile)) return false

  return /JAVA_VERSION="21[."]/.test(readFileSync(releaseFile, 'utf8'))
}

function findJdk21() {
  const candidates = []

  if (process.platform === 'win32') {
    const roots = [
      'C:\\Program Files\\Microsoft',
      'C:\\Program Files\\Java',
      'C:\\Program Files\\Eclipse Adoptium',
    ]

    for (const root of roots) {
      if (!existsSync(root)) continue

      for (const entry of readdirSync(root)) {
        if (/jdk-?21/i.test(entry)) {
          candidates.push(join(root, entry))
        }
      }
    }
  }

  if (process.env.JAVA_HOME) {
    candidates.push(process.env.JAVA_HOME)
  }

  const javaBinary = process.platform === 'win32' ? 'java.exe' : 'java'
  return candidates.find(
    (candidate) => existsSync(join(candidate, 'bin', javaBinary)) && isJdk21(candidate),
  )
}

const javaHome = findJdk21()

if (!javaHome) {
  console.error(
    'JDK 21 was not found. Install Microsoft OpenJDK 21 or set JAVA_HOME to a JDK 21 installation.',
  )
  process.exit(1)
}

const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
const javaBin = join(javaHome, 'bin')
const pathSeparator = process.platform === 'win32' ? ';' : ':'
const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  PATH: `${javaBin}${pathSeparator}${process.env.PATH ?? ''}`,
}

console.log(`Using JDK 21 at ${javaHome}`)

const result = spawnSync(
  gradleCommand,
  ['assembleDebug', '--console=plain', '--no-daemon'],
  {
    cwd: 'android',
    env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  },
)

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
