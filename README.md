# Astral CLI

A command-line tool for adding Astral UI components to your React project.

## Installation

```bash
# Using npm
npm install -g astral-cli

# Using yarn
yarn global add astral-cli

# Using pnpm
pnpm add -g astral-cli

# Or run directly with npx
npx astral-cli <command>
```

## Authentication Setup

Since the Astral UI components are stored in a private GitHub repository, you'll need to set up authentication:

### Option 1: Using the init command (Recommended)

The CLI provides an `init` command to set up authentication:

```bash
# Create a .env file in the current directory
astral-cli init

# Create a .env file with your token
astral-cli init --token your_github_personal_access_token

# Create a global .env file in your home directory
astral-cli init --global --token your_github_personal_access_token
```

### Option 2: Manual Authentication Setup

1. **Generate a GitHub Personal Access Token (PAT)**:
   - Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Click "Generate new token"
   - Select at least the `repo` scope
   - Generate and copy your token

2. **Create a .env file**:
   Create a file named `.env` in your project directory with the following content:
   ```
   GITHUB_PAT=your_github_personal_access_token
   ```

3. **Or set an environment variable**:
   ```bash
   # For bash/zsh users
   export GITHUB_PAT=your_github_personal_access_token
   
   # For Windows cmd users
   set GITHUB_PAT=your_github_personal_access_token
   
   # For Windows PowerShell users
   $env:GITHUB_PAT="your_github_personal_access_token"
   ```

For permanent setup, add the export command to your shell profile file (.bashrc, .zshrc, etc.).

## Usage

### List Available Components

To see a list of all available components:

```bash
astral-cli list
```

### Add a Component

To add a component to your project:

```bash
astral-cli add <component-name>
```

This will:
1. Fetch the component source code from the Astral UI repository
2. Copy the component files to your project
3. Install any required dependencies

#### Options

- `-d, --dest <directory>`: Specify the target directory for the component
- `-p, --package-manager <manager>`: Specify the package manager (npm, yarn, pnpm)
- `-o, --overwrite`: Overwrite existing files without prompting

Examples:

```bash
# Add Button component
astral-cli add button

# Add Tooltip component to a specific directory
astral-cli add tooltip --dest src/components/ui

# Add Modal component and use yarn
astral-cli add modal --package-manager yarn

# Add Avatar component and overwrite any existing files
astral-cli add avatar --overwrite
```

### Initialize Configuration

To create a configuration file with your GitHub Personal Access Token:

```bash
# Create a template .env file in the current directory
astral-cli init

# Set your token directly
astral-cli init --token your_github_personal_access_token

# Store configuration globally (in your home directory)
astral-cli init --global
```

## Available Components

- **Button**: A customizable button component with various styles and variants.
- **Tooltip**: A component that displays informative text when users hover over, focus on, or tap an element.
- **Modal**: A component that displays content in a layer that sits on top of the page.
- **Avatar**: An avatar component to represent a user with an image, initials, or icon.

## Development

### Building the CLI

```bash
# Clone the repository
git clone https://github.com/cloudwick/astral-cli.git
cd astral-cli

# Install dependencies
npm install

# Build the CLI
npm run build

# Link for local development
npm link
```

### Running Tests

```bash
npm test
```

## Security Notes

- The `.env` file is automatically added to `.gitignore` to prevent accidentally committing your GitHub token
- For global configuration, tokens are stored in `~/.astral-cli/.env`
- Never commit your GitHub Personal Access Token to version control
- Use environment variables or the `.env` file to manage your token securely

## Troubleshooting

### Authentication Errors

If you see errors like "Authentication error accessing URL" or "Not found" errors for components:

1. Verify that your GitHub PAT is set and valid
2. Check that your PAT has the correct scope permissions
3. Confirm that you have access to the Astral UI repository

### Dependency Installation Issues

If component dependencies fail to install:

1. Check your network connection
2. Try running the command with a specific package manager: `--package-manager npm`
3. Manually install the required dependencies listed in the component documentation

## License

ISC 