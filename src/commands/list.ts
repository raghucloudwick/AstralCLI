import chalk from 'chalk';
import { listComponents } from '../utils/component.js';

export async function listAvailableComponents(): Promise<void> {
  const components = await listComponents();
  
  if (components.length === 0) {
    console.log(chalk.yellow('No components available.'));
    return;
  }
  
  console.log(chalk.cyan('Available components:'));
  console.log();
  
  components.forEach(component => {
    const hasDependencies = component.dependencies.length > 0;
    
    console.log(chalk.green(`${component.name}`));
    console.log(chalk.dim(`  ${component.description}`));
    
    if (hasDependencies) {
      console.log(chalk.yellow(`  Dependencies: ${component.dependencies.join(', ')}`));
    }
    
    console.log();
  });
} 