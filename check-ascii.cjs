#!/usr/bin/env node
// Corre automaticamente antes de cada "build" (deploy no Cloudflare).
// Verifica todos os ficheiros .jsx/.js dentro de src/ e PARA o deploy se
// encontrar algum caracter fora do ASCII (sinal de um copy/paste
// corrompido). Isto evita que um problema de encoding chegue alguma vez
// ao site publicado — o deploy falha logo, com uma mensagem clara de
// onde esta o problema, em vez de publicar texto partido.

const fs = require('fs')
const path = require('path')

const SRC_DIR = path.join(__dirname, '..', 'src')
const EXTENSIONS = ['.jsx', '.js']

function hasNonAscii(str) {
  return /[^\x00-\x7F]/.test(str)
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, files)
    } else if (EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(full)
    }
  }
  return files
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const problems = []
  lines.forEach((line, i) => {
    if (hasNonAscii(line)) {
      const badChars = [...line].filter((c) => c.charCodeAt(0) > 127)
      problems.push({ lineNumber: i + 1, line, badChars })
    }
  })
  return problems
}

function main() {
  const files = walk(SRC_DIR)
  let totalProblems = 0

  for (const file of files) {
    const problems = checkFile(file)
    if (problems.length > 0) {
      totalProblems += problems.length
      const relPath = path.relative(path.join(__dirname, '..'), file)
      console.error(`\n\x1b[31mCaracteres invalidos em ${relPath}:\x1b[0m`)
      problems.forEach((p) => {
        console.error(`  Linha ${p.lineNumber}: [${p.badChars.join(' ')}]`)
        console.error(`    ${p.line.trim().slice(0, 100)}`)
      })
    }
  }

  if (totalProblems > 0) {
    console.error(
      `\n\x1b[31mDEPLOY CANCELADO:\x1b[0m encontrados ${totalProblems} caracter(es) fora do ASCII.\n` +
      `Isto normalmente acontece por corrupcao ao copiar/colar texto com acentos.\n` +
      `Corrige o(s) ficheiro(s) acima (usa \\uXXXX em vez de letras acentuadas) e tenta outra vez.\n`
    )
    process.exit(1)
  }

  console.log(`OK: ${files.length} ficheiros verificados, todos em ASCII puro.`)
}

main()
