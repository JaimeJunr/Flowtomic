#!/usr/bin/env bun

/**
 * Script de publicação automatizada para packages NPM do Flowtomic
 * 
 * Este script automatiza o processo de publicação:
 * 1. Executa testes
 * 2. Executa build
 * 3. Atualiza versão (major/minor/patch)
 * 4. Publica no NPM
 */

// @ts-ignore - Bun types are global
import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import semver from "semver";
import inquirer from "inquirer";

type VersionType = "major" | "minor" | "patch";
type PackageName = "ui" | "logic" | "cli";

interface PackageInfo {
	name: string;
	path: string;
	displayName: string;
}

const PACKAGES: Record<PackageName, PackageInfo> = {
	ui: {
		name: "@flowtomic/ui",
		path: "packages/ui",
		displayName: "@flowtomic/ui",
	},
	logic: {
		name: "@flowtomic/logic",
		path: "packages/logic",
		displayName: "@flowtomic/logic",
	},
	cli: {
		name: "flowtomic-cli",
		path: "cli",
		displayName: "flowtomic-cli",
	},
};

/**
 * Lê a versão atual do package.json
 */
function getCurrentVersion(packagePath: string): string {
	const packageJsonPath = join(process.cwd(), packagePath, "package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	return packageJson.version;
}

/**
 * Atualiza a versão no package.json
 */
function updateVersion(
	packagePath: string,
	versionType: VersionType,
): string {
	const packageJsonPath = join(process.cwd(), packagePath, "package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	const currentVersion = packageJson.version;

	const newVersion = semver.inc(currentVersion, versionType);
	if (!newVersion) {
		throw new Error(`Não foi possível incrementar a versão: ${currentVersion}`);
	}

	packageJson.version = newVersion;
	writeFileSync(
		packageJsonPath,
		JSON.stringify(packageJson, null, 2) + "\n",
		"utf-8",
	);

	return newVersion;
}

/**
 * Executa testes
 */
async function runTests(): Promise<void> {
	console.log("🧪 Executando testes...");
	const result = await $`bun run test --filter=${packageName} -- -- --run`;
	if (result.exitCode !== 0) {
		throw new Error("❌ Testes falharam! Corrija os erros antes de publicar.");
	}
	console.log("✅ Testes passaram!\n");
}

/**
 * Executa build
 */
async function runBuild(): Promise<void> {
	console.log("🏗️  Executando build...");
	const result = await $`bun run build --filter=${packageName}`.quiet();
	if (result.exitCode !== 0) {
		throw new Error("❌ Build falhou! Corrija os erros antes de publicar.");
	}
	console.log("✅ Build concluído!\n");
}

/**
 * Publica no NPM
 */
async function publishToNpm(packagePath: string): Promise<void> {
	console.log("📦 Publicando no NPM...");
	const result = await $`cd ${packagePath} && npm publish --access public`.quiet();
	if (result.exitCode !== 0) {
		throw new Error("❌ Publicação falhou!");
	}
	console.log("✅ Publicação concluída!\n");
}

/**
 * Função principal
 */
async function main() {
	const args = process.argv.slice(2);

	// Parse arguments
	let packageName: PackageName | null = null;
	let versionType: VersionType | null = null;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--package" || arg === "-p") {
			packageName = args[++i] as PackageName;
		} else if (arg === "--version" || arg === "-v") {
			versionType = args[++i] as VersionType;
		} else if (["major", "minor", "patch"].includes(arg)) {
			versionType = arg as VersionType;
		} else if (["ui", "logic", "cli"].includes(arg)) {
			packageName = arg as PackageName;
		} else if (arg === "--help" || arg === "-h") {
			console.log("\n📦 Script de Publicação do Flowtomic\n");
			console.log("Uso:");
			console.log("  bun run publish                    # Modo interativo");
			console.log("  bun run publish <package> <type>  # Modo não-interativo");
			console.log("\nPackages disponíveis:");
			console.log("  ui     - @flowtomic/ui");
			console.log("  logic  - @flowtomic/logic");
			console.log("  cli    - flowtomic-cli");
			console.log("\nTipos de versão (NÃO digite números!):");
			console.log("  patch  - Correções de bugs (0.1.15 → 0.1.16)");
			console.log("  minor  - Novas funcionalidades (0.1.15 → 0.2.0)");
			console.log("  major  - Mudanças incompatíveis (0.1.15 → 1.0.0)");
			console.log("\nExemplos:");
			console.log("  bun run publish ui patch");
			console.log("  bun run publish logic minor");
			console.log("  bun run publish cli major\n");
			process.exit(0);
		} else if (!arg.startsWith("-") && !["major", "minor", "patch", "ui", "logic", "cli"].includes(arg)) {
			// Provavelmente tentou digitar um número de versão
			console.error(`\n❌ Argumento inválido: "${arg}"`);
			console.error("\n💡 Você tentou digitar um número de versão?");
			console.error("   O script não aceita números de versão diretamente.");
			console.error("   Você deve escolher o tipo de incremento: patch, minor ou major");
			console.error("\n📌 Exemplos corretos:");
			console.error("   bun run publish ui patch    # ✅ Correto");
			console.error("   bun run publish ui 0.1.16   # ❌ Incorreto");
			console.error("\n   Use 'bun run publish --help' para mais informações.\n");
			process.exit(1);
		}
	}

	// Interação interativa se não foram fornecidos argumentos
	if (!packageName) {
		const packages = Object.entries(PACKAGES).map(([key, pkg]) => ({
			value: key as PackageName,
			name: `${pkg.displayName} (versão atual: ${getCurrentVersion(pkg.path)})`,
		}));

		const { selectedPackage } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedPackage",
				message: "📦 Selecione o package para publicar:",
				prefix: "\n",
				choices: packages,
			},
		]);

		packageName = selectedPackage;
	}

	if (!versionType) {
		const currentVersion = getCurrentVersion(PACKAGES[packageName!].path);
		const majorVersion = semver.inc(currentVersion, "major") || "N/A";
		const minorVersion = semver.inc(currentVersion, "minor") || "N/A";
		const patchVersion = semver.inc(currentVersion, "patch") || "N/A";

		const { selectedVersion } = await inquirer.prompt([
			{
				type: "list",
				name: "selectedVersion",
				message: `📌 Selecione o tipo de incremento de versão:`,
				prefix: `\n   Versão atual: ${currentVersion}\n`,
				choices: [
					{
						value: "patch",
						name: `patch  →  ${currentVersion} → ${patchVersion}  (Correções de bugs)`,
					},
					{
						value: "minor",
						name: `minor  →  ${currentVersion} → ${minorVersion}  (Novas funcionalidades)`,
					},
					{
						value: "major",
						name: `major  →  ${currentVersion} → ${majorVersion}  (Mudanças incompatíveis)`,
					},
				],
			},
		]);

		versionType = selectedVersion;
	}

	// Validação
	if (!packageName || !PACKAGES[packageName]) {
		console.error(`❌ Package inválido: ${packageName}`);
		console.error(`Packages disponíveis: ${Object.keys(PACKAGES).join(", ")}`);
		process.exit(1);
	}

	if (!versionType || !["major", "minor", "patch"].includes(versionType)) {
		console.error(`\n❌ Tipo de versão inválido: "${versionType}"`);
		console.error("\n📌 Você deve escolher um dos seguintes tipos:");
		console.error("   • patch  - Para correções de bugs (ex: 0.1.15 → 0.1.16)");
		console.error("   • minor  - Para novas funcionalidades (ex: 0.1.15 → 0.2.0)");
		console.error("   • major  - Para mudanças incompatíveis (ex: 0.1.15 → 1.0.0)");
		console.error("\n💡 Dica: Use o modo interativo sem argumentos para ver as opções:");
		console.error("   bun run publish\n");
		process.exit(1);
	}

	const packageInfo = PACKAGES[packageName];
	const currentVersion = getCurrentVersion(packageInfo.path);

	console.log("\n🚀 Iniciando processo de publicação\n");
	console.log(`📦 Package: ${packageInfo.displayName}`);
	console.log(`📌 Versão atual: ${currentVersion}`);
	console.log(`🔄 Tipo de atualização: ${versionType}\n`);

	try {
		// 1. Executar testes
		await runTests();

		// 2. Executar build
		await runBuild();

		// 3. Atualizar versão
		console.log("📝 Atualizando versão...");
		const newVersion = updateVersion(packageInfo.path, versionType);
		console.log(`✅ Versão atualizada: ${currentVersion} → ${newVersion}\n`);

		// 4. Publicar no NPM
		await publishToNpm(packageInfo.path);

		console.log("🎉 Publicação concluída com sucesso!");
		console.log(`\n📦 ${packageInfo.displayName}@${newVersion} publicado no NPM\n`);
	} catch (error) {
		console.error("\n❌ Erro durante a publicação:");
		console.error(error instanceof Error ? error.message : String(error));
		
		// Nota: A versão já foi atualizada, mas não foi publicada
		// O usuário pode decidir se quer manter a nova versão ou reverter manualmente
		console.log("\n⚠️  A versão foi atualizada mas não foi publicada.");
		console.log("   Você pode reverter manualmente se necessário.");
		
		process.exit(1);
	}
}

main().catch((error) => {
	console.error("❌ Erro fatal:", error);
	process.exit(1);
});

