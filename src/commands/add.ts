import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { CliOptions, ComponentContext } from '../types/index.js';
import { getComponent, fetchComponentSource, installDependencies } from '../utils/component.js';
import { findProjectRoot, detectPackageManager, getDefaultComponentsDir } from '../utils/project.js';

export async function addComponent(componentName: string, options: CliOptions): Promise<void> {
  // Standardize component name to lowercase for case-insensitive lookup
  const normalizedName = componentName.toLowerCase();
  
  // Check if component exists
  const component = await getComponent(normalizedName);
  
  if (!component) {
    console.error(chalk.red(`✖ Component "${componentName}" not found.`));
    // Suggest available components
    const registry = await import('../utils/component.js');
    const components = await registry.listComponents();
    if (components.length > 0) {
      console.log(chalk.yellow('\nAvailable components:'));
      components.forEach(comp => {
        console.log(`  ${chalk.cyan(comp.name.toLowerCase())}`);
      });
    }
    process.exit(1);
  }
  
  console.log(chalk.cyan(`\nAdding component: ${component.name}`));
  console.log(chalk.dim(`  ${component.description}`));
  
  // Find project root
  const projectRoot = await findProjectRoot();
  
  if (!projectRoot) {
    console.error(chalk.red(`✖ Could not find project root. Make sure you're in a valid project directory.`));
    process.exit(1);
  }
  
  // Determine target directory
  let targetDir = options.dest || '';
  
  if (!targetDir) {
    const defaultDir = await getDefaultComponentsDir(projectRoot);
    const relativeDefault = path.relative(process.cwd(), defaultDir);
    
    const { selectedDir } = await inquirer.prompt([
      {
        type: 'input',
        name: 'selectedDir',
        message: 'Where would you like to add the component?',
        default: relativeDefault
      }
    ]);
    
    targetDir = selectedDir;
  }
  
  // Resolve full path
  targetDir = path.resolve(process.cwd(), targetDir);
  
  // Check if target directory exists
  const targetExists = await fs.pathExists(targetDir);
  
  if (!targetExists) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Directory ${targetDir} does not exist. Create it?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('Operation cancelled.'));
      process.exit(0);
    }
    
    await fs.ensureDir(targetDir);
  }
  
  // Check for existing files
  let shouldOverwrite = options.overwrite === true;
  if (!shouldOverwrite) {
    for (const file of component.files) {
      const filePath = path.join(targetDir, file);
      const exists = await fs.pathExists(filePath);
      
      if (exists) {
        const { confirmOverwrite } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmOverwrite',
            message: `Some component files already exist. Overwrite?`,
            default: false
          }
        ]);
        
        shouldOverwrite = confirmOverwrite;
        break;
      }
    }
  }
  
  // Detect package manager
  const packageManager = options.packageManager || await detectPackageManager(projectRoot);
  
  // Create component context
  const context: ComponentContext = {
    component,
    targetDir,
    options: {
      ...options,
      overwrite: shouldOverwrite,
      packageManager
    }
  };
  
  // Fetch component source
  try {
    await fetchComponentSource(component, targetDir);
    console.log(chalk.green(`✓ Added ${component.name} component to ${path.relative(process.cwd(), targetDir)}`));
    
    // Install dependencies if needed
    if (component.dependencies.length > 0) {
      console.log(chalk.cyan(`\nInstalling dependencies: ${component.dependencies.join(', ')}`));
      await installDependencies(context);
      console.log(chalk.green(`✓ Installed dependencies for ${component.name}`));
    }
    
    console.log(chalk.green(`\n✓ Done! Component ${component.name} added successfully.`));
    console.log(`   You can now import the component from ${chalk.cyan(`'${path.relative(projectRoot, path.join(targetDir, component.name.toLowerCase()))}'`)}`);
  } catch (error) {
    console.error(chalk.red(`\n✖ Failed to add component: ${(error as Error).message}`));
    process.exit(1);
  }
} 