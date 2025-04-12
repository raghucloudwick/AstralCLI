export interface Component {
  name: string;
  description: string;
  files: string[];
  dependencies: string[];
  path?: string; // Optional path to the component in the repository
}

export interface Registry {
  components: Record<string, Component>;
}

export interface CliOptions {
  dest?: string;
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  overwrite?: boolean;
}

export interface ComponentContext {
  component: Component;
  targetDir: string;
  options: CliOptions;
} 