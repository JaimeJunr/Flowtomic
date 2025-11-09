#!/usr/bin/env bun

/**
 * flowtomic
 * 
 * CLI para instalação de componentes, hooks e blocks do Flowtomic
 * 
 * Uso:
 *   npx flowtomic init
 *   npx flowtomic add button
 *   npx flowtomic add-block dashboard-01
 *   npx flowtomic list
 */

import { Command } from 'commander'
import { init } from './commands/init'
import { add } from './commands/add'
import { list } from './commands/list'
import { addBlockCommand } from './commands/add-block'

const program = new Command()

program
  .name('flowtomic')
  .description('CLI para instalação de componentes, hooks e blocks do Flowtomic')
  .version('0.1.0')

program
  .command('init')
  .description('Inicializar configuração do Flowtomic no projeto')
  .action(init)

program
  .command('add')
  .description('Adicionar componente ou hook ao projeto')
  .argument('[components...]', 'Componentes ou hooks para adicionar (opcional, mostra lista interativa)')
  .action(add)

program
  .command('add-block')
  .alias('block')
  .description('Adicionar block ao projeto')
  .argument('[blocks...]', 'Blocks para adicionar (opcional, mostra lista interativa)')
  .action(addBlockCommand)

program
  .command('list')
  .description('Listar todos os componentes e hooks disponíveis')
  .action(list)

program.parse()

