# Contribution

Feel free to suggest improvements or to create pull requests!

To test the extension locally:

- Clone this repository

## Build

### Prerequisites

Install Node.js 16.x

Or, if you different node versions on your machine for different projects, you can use Node Version Manager (NVM) and run the following command in the repository directory:

```bash
nvm use
```

### Install the dependencies

```bash
npm install
```

### Start the build process in watch mode

For Unix based systems:

```bash
npm start
```

For Windows:

```bash
npm run start:win
```

## Load the local extension in your browser

### Chromium

- Go to `chrome://extensions`
- Enable the developer mode with the regarding toggle button on the right side
- Click on "Load unpacked"
- Select the `dist` folder of the cloned repository

### Firefox

- Go `about:debugging#/runtime/this-firefox`
- Click on `Load Temporary Add-On...`
- Select any file in the `dist` folder of the cloned repository

