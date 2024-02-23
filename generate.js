const fs = require("fs")

function createFileAndValidate(filePath, data) {
  try {
    fs.writeFileSync(filePath, data)
    const fileCreatedAndExists = fs.existsSync(filePath)
    return fileCreatedAndExists
  } catch (error) {
    console.log("⛔ An error occurred while creating the file: ", error, "\n\n")
    return false
  }
}

function createPostCheckout() {
  const postCheckoutData = `# !/bin/bash
branch_name=$(git symbolic-ref -q HEAD)
branch_name=\${branch_name##refs/heads/}

# If the branch name is not master, then copy the appropriate gitignore file to .gitignore
if [ "$branch_name" = "main" ]; then
  cp .gitignore_template .gitignore
else
  cp .gitignore_develop .gitignore
fi`

  try {
    // change the directory to the main folder
    setTimeout(() => {
      // process.chdir(mainFolder+'/.git/hooks')
      fs.writeFileSync(mainFolder + "/.git/hooks/post-checkout", postCheckoutData)

      // validate if the post-checkout file exists and change the permissions
      const postCheckoutPath = mainFolder + "/.git/hooks/post-checkout"
      if (fs.existsSync(postCheckoutPath)) {
        fs.chmodSync(postCheckoutPath, "755")
      }
    }, 2000)
    return true
  } catch (error) {
    console.log("⛔ An error occurred while creating the file: ", error, "\n\n")
    return false
  }
}

function deleteFolder(folder) {
  try {
    const { execSync } = require("child_process")
    execSync(`rm -rf ${folder}`)
  } catch (error) {
    console.log("⛔ An error occurred while deleting the folder: ", folder, "\n\n")
  }
}

function callGitInit() {
  try {
    setTimeout(() => {
      const { execSync } = require("child_process")
      // initialize the git repository
      execSync(`cd ${mainFolder} && git init > /dev/null 2>&1`)
      // rename the branch to main
      execSync(`cd ${mainFolder} && git branch -m main`)
    }, 2000)
    return true
  } catch (error) {
    console.log("⛔ An error occurred while creating the git repository, please try again\n\n")
    return false
  }
}

function createReadmeFile() {
  // create the README file
  const readmeData = `# ${storeName}

${storeName} e-commerce website.

## Tech Stack

**Client:** Shopify, Liquid
**Theme:** Expanse

### Clone project from Github

\`\`\`bash
git clone git@github.com:signifly/REPLACE_GITHUB_WITH_REPO.git
\`\`\`


### Run npm install

\`\`\`bash
 npm install
\`\`\`

### Run scss watch and dev environment
\`\`\`bash
 make watch dev
\`\`\`
### Run dev environment alone

\`\`\`bash
shopify theme dev --store=${storeName}
\`\`\`

## Pull content from Theme

To pull the content changes from the Shopify store:

\`\`\`bash
shopify theme pull
\`\`\`

## Authors

- [@$GITHUB_USERNAME](https://www.github.com/GITHUB_USERNAME)

## Codeowner

- [@GITHUB_USERNAME](https://www.github.com/GITHUB_USERNAME)


## Links

|Production|Shopify (Prod)|Shopify (Dev)|
|---|---|---|
|[${storeName}](https://${storeName}/)|[Production](https://${storeName}/)|[Develop](https://${storeName})

`

  const readmePath = mainFolder + "/README.md"
  const checkReadme = createFileAndValidate(readmePath, readmeData)
  return checkReadme
}

// Main process
let storeName = ""
let mainFolder = ""

// validate the number of arguments, it should be 1: storeName
if (process.argv.length !== 3) {
  console.log("Please provide the store name and the code owner, Ex: node generate.js example.myshopify.com")
  process.exit(1)
} else {
  console.log("\n\nWelcome to Shopify CLI project generator 🚀\n\n")
  console.log("Creating the files and folders for the new Shopify project....\n\n")

  // get the store name from the command line
  storeName = process.argv[2]

  let stepShopifyIgnore = false
  let stepGitIgnore = false
  let stepGitIgnoreTemplate = false
  let stepGitIgnoreDevelop = false
  let stepPostCheckout = false
  let stepCodeOwners = false
  let stepReadme = false
  let stepMakefile = false

  // create a folder to store all files
  mainFolder = `new-shopify-cli`

  if (!fs.existsSync(mainFolder)) {
    fs.mkdirSync(mainFolder)
  }

  // crete the .shopfiyignore file
  const shopifyIgnoreData = `Makefile
package.json
package-lock.json
resources`

  stepShopifyIgnore = createFileAndValidate(mainFolder + "/.shopifyignore", shopifyIgnoreData)
  if (stepShopifyIgnore) {
    // create .gitignore file
    const gitIgnoreData = `.DS_Store
node_modules
yarn-error.log

node_modules/`
    stepGitIgnore = createFileAndValidate(mainFolder + "/.gitignore", gitIgnoreData)

    if (stepGitIgnore) {
      // create the .gitignore_template file
      const gitIgnoreTemplateData = `.DS_Store
node_modules
yarn-error.log

node_modules /

config/settings_data.json
locales/*.json
templates/*.json
assets/*.js.map`
      stepGitIgnoreTemplate = createFileAndValidate(mainFolder + "/.gitignore_template", gitIgnoreTemplateData)

      if (stepGitIgnoreTemplate) {
        // crete the .gitignore_develop file
        const gitIgnoreDevelopData = `.DS_Store
node_modules
yarn-error.log

node_modules/`
        stepGitIgnoreDevelop = createFileAndValidate(mainFolder + "/.gitignore_develop", gitIgnoreDevelopData)

        // create the CODEOWNERS file
        const codeOwnersData = `* @GITHUB_USERNAME`
        stepCodeOwners = createFileAndValidate(mainFolder + "/CODEOWNERS", codeOwnersData)

        if (stepCodeOwners) {
          // create the README file
          stepReadme = createReadmeFile()

          if (stepReadme) {
            // create the Makefile
            const makefileData = `.PHONY: dev pull push watch
SHOP_URL := moebe-dk.myshopify.com

dev:
	shopify theme dev --store=$(${storeName})

pull:
	shopify theme pull --store=$(${storeName})

push:
	shopify theme push --store=$(${storeName})

watch:
	./node_modules/.bin/sass --watch resources/scss/style.scss:assets/style.css &`

            stepMakefile = createFileAndValidate(mainFolder + "/Makefile", makefileData)
          } else {
            // delete the files and abort the process
            deleteFolder(mainFolder)
            console.log("⛔ An error occurred while creating the README file, please try again\n\n")
          }
        }
      }
    }
  }

  // validate the files previously created
  const filesCreated =
    stepShopifyIgnore && stepGitIgnore && stepGitIgnoreTemplate && stepGitIgnoreDevelop && stepCodeOwners
  if (filesCreated) {
    console.log(
      "✅ Files: Makefile, CODEOWNERS, .shopifyignore, .gitignore, .gitignore_template, .gitignore_develop created successfully"
    )

    // call git init
    try {
      if (callGitInit()) {
        // create the post-checkout file under .git/hooks
        console.log("✅ Git folder created successfully")

        stepPostCheckout = createPostCheckout()

        if (stepPostCheckout) {
          console.log("✅ GitHub post-checkout file created successfully")

          // install rfs and sass
          try {
            const { execSync } = require("child_process")
            execSync(`cd ${mainFolder} && npm install -D rfs`)
            execSync(`cd ${mainFolder} && npm install -D sass`)

            console.log("✅ Packages: rfs and sass created successfully")

            // create the scss folders and files
            const scssFolder = mainFolder + "/resources/scss"
            const scssFile = mainFolder + "/resources/scss/style.scss"

            if (!fs.existsSync(scssFolder)) {
              fs.mkdirSync(scssFolder, { recursive: true })
            }
            // create the style.scss file
            const styleScssData = `// add your scss code here`
            const scssFileCreated = createFileAndValidate(scssFile, styleScssData)

            // create shopify folders
            const shopifyFolders = [
              mainFolder + "/assets",
              mainFolder + "/config",
              mainFolder + "/layout",
              mainFolder + "/locales",
              mainFolder + "/sections",
              mainFolder + "/snippets",
              mainFolder + "/templates"
            ]

            shopifyFolders.forEach((folder) => {
              if (!fs.existsSync(folder)) {
                fs.mkdirSync(folder, { recursive: true })
              }
            })

            // at this point the process is completed
            console.log("\n\n✅ The setup was finished successfully! 🚀 \n\n")
            console.log("❗ Remember to check and complete the following steps:\n")
            console.log("1️⃣  Create/Paste the theme folders and files in the root folder: new-shopify-cli\n")
            console.log("2️⃣  Push the changes to the repository\n")
            console.log(
              "   ❗❗ IMPORTANT: before creating a new branch, you have to git push the main branch, this will allow to push to the repo the templates files for first time"
            )
            console.log("3️⃣  Update the README and CODEOWNSER files with the correct information\n")
            console.log("4️⃣  Add the following code on the theme.liquid file before </head> tag:\n")
            console.log('     <link rel="stylesheet" href="{{ \'style.css\' | asset_url }}">\n')
            console.log("5️⃣  To start working on the project, run this command on the terminal:\n")
            console.log("      make watch dev\n")
          } catch (error) {
            // delete the files and abort the process
            deleteFolder(mainFolder)
            console.log("⛔ An error occurred while creating the post-checkout file, please try again\n\n")
          }
        } else {
          // delete the files and abort the process
          deleteFolder(mainFolder)
          console.log("⛔ An error occurred while creating the post-checkout file, please try again\n\n")
        }
      } else {
        // delete the files and abort the process
        deleteFolder(mainFolder)
        console.log("⛔ An error occurred while creating the git repository, please try again\n\n")
      }
    } catch (error) {
      console.log("⛔ An error occurred while creating the git repository, please try again\n\n")
      deleteFolder(mainFolder)
    }
  } else {
    // delete the files and abort the process
    deleteFolder(mainFolder)
    console.log(
      "⛔ An error occurred while creating the files: Makefile, CODEOWNERS, .shopifyignore, .gitignore, .gitignore_template, .gitignore_develop, please try again\n\n"
    )
  }
}
