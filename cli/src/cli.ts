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
 *   npx flowtomic copy-styles globals theme typography
 *   npx flowtomic list
 */

import { Command } from "commander";
import { add } from "./commands/add";
import { addBlockCommand } from "./commands/add-block";
import { copyStyles } from "./commands/copy-styles";
import { init } from "./commands/init";
import { list } from "./commands/list";

const program = new Command();

program
  .name("flowtomic")
  .description("CLI para instalação de componentes, hooks e blocks do Flowtomic")
  .version("0.1.0");

program
  .command("init")
  .description("Inicializar configuração do Flowtomic no projeto")
  .action(init);

program
  .command("add")
  .description("Adicionar componente ou hook ao projeto")
  .argument(
    "[components...]",
    "Componentes ou hooks para adicionar (opcional, mostra lista interativa)"
  )
  .action(add);

program
  .command("add-block")
  .alias("block")
  .description("Adicionar block ao projeto")
  .argument("[blocks...]", "Blocks para adicionar (opcional, mostra lista interativa)")
  .action(addBlockCommand);

program.command("list").description("Listar todos os componentes e hooks disponíveis").action(list);

program
  .command("copy-styles")
  .alias("styles")
  .description("Copiar arquivos de estilo do Flowtomic para o projeto")
  .argument(
    "[styles...]",
    "Arquivos de estilo para copiar (globals, theme, typography). Se não especificado, copia todos."
  )
  .action(copyStyles);

program.parse();
