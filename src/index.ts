#!/usr/bin/env node

import { Command } from 'commander';
import { addComponent } from './commands/add.js';
import { listAvailableComponents } from './commands/list.js';
import chalk from 'chalk';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs-extra';

// Load environment variables from .env file
const loadEnv = () => {
  // Try loading from the current directory first
  let result = config();
  
  if (!result.parsed) {
    // If not found, try loading from the user's home directory
    const homePath = process.env.HOME || process.env.USERPROFILE;
    if (homePath) {
      const homeEnvPath = path.join(homePath, '.astral-cli', '.env');
      if (fs.existsSync(homeEnvPath)) {
        result = config({ path: homeEnvPath });
      }
    }
  }
  
  return result;
};

loadEnv();

// Check for GitHub PAT
if (!process.env.GITHUB_PAT) {
  console.warn(chalk.yellow('Warning: No GitHub PAT detected in environment variables or .env file'));
  console.warn(chalk.yellow('If the repository is private, you will need to set up authentication.'));
  console.warn(chalk.yellow('See README for instructions on setting up a .env file or environment variable.\n'));
}

// CLI metadata
const program = new Command();
program
  .name('astral-cli')
  .description('CLI tool for Astral UI components')
  .version('1.0.0');

// Add component command
program
  .command('add')
  .description('Add a component to your project')
  .argument('<component>', 'The component to add')
  .option('-d, --dest <directory>', 'Target directory for the component')
  .option('-p, --package-manager <manager>', 'Package manager to use (npm, yarn, pnpm)')
  .option('-o, --overwrite', 'Overwrite existing files', false)
  .action(async (component, options) => {
    try {
      await addComponent(component, {
        dest: options.dest,
        packageManager: options.packageManager,
        overwrite: options.overwrite
      });
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// List components command
program
  .command('list')
  .description('List all available components')
  .action(async () => {
    try {
      await listAvailableComponents();
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Initialize command for creating .env file
program
  .command('init')
  .description('Initialize configuration with GitHub PAT')
  .option('-t, --token <token>', 'GitHub Personal Access Token')
  .option('-g, --global', 'Store settings globally in home directory', false)
  .action(async (options) => {
    try {
      const token = options.token;
      let targetDir;
      
      if (options.global) {
        // Store in user's home directory
        const homePath = process.env.HOME || process.env.USERPROFILE;
        if (!homePath) {
          throw new Error('Could not determine home directory');
        }
        
        targetDir = path.join(homePath, '.astral-cli');
        await fs.ensureDir(targetDir);
      } else {
        // Store in current directory
        targetDir = process.cwd();
      }
      
      const envPath = path.join(targetDir, '.env');
      
      if (token) {
        // Write the token to .env file
        await fs.writeFile(envPath, `# GitHub Personal Access Token for accessing private repositories\nGITHUB_PAT=${token}\n`);
        console.log(chalk.green(`✓ GitHub PAT saved to ${envPath}`));
      } else {
        // Create example .env file
        await fs.writeFile(
          envPath, 
          `# GitHub Personal Access Token for accessing private repositories\n# Generate your token at: https://github.com/settings/tokens\nGITHUB_PAT=your_token_here\n`
        );
        console.log(chalk.green(`✓ Created sample .env file at ${envPath}`));
        console.log(chalk.yellow('Please update it with your GitHub Personal Access Token'));
      }
      
      // Add .env to .gitignore if it exists and doesn't already include it
      const gitignorePath = path.join(process.cwd(), '.gitignore');
      if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        if (!gitignoreContent.includes('.env')) {
          await fs.appendFile(gitignorePath, '\n# Environment variables\n.env\n');
          console.log(chalk.green('✓ Added .env to .gitignore'));
        }
      } else if (!options.global) {
        // Create .gitignore if it doesn't exist (only in local mode)
        await fs.writeFile(gitignorePath, '# Environment variables\n.env\n');
        console.log(chalk.green('✓ Created .gitignore with .env entry'));
      }
      
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 