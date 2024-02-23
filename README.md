# Shopify CLI Folder generator

Shopify CLI Folder generator

## Tech Stack

Javascript, Shopify CLI, Liquid

### Clone project from Github

```bash
git clone git@github.com:signifly/generator-shopify-cli.git
```

### Run generator

```bash
 node generate SHOPIFY-STORE-URL
```

##### Example

```bash
 node generate client.myshopify.com
```

---

The generator will create the following folder structure:

```bash
.
├-.git
├── assets
├── config
├── layout
├── locales
├── resources
│   └── scss
├── sections
├── snippets
└── templates
```

The following files will be created:

```bash
.
├── .gitignore
├── .gitignore_develop
└── .gitignore_template
```
---

>when you change of branch, the .gitignore file will be updated to the correct one. Only the main branch will have the .gitignore file without the following files/folders:

```bash
config/settings_data.json
locales/*.json
templates/*.json
assets/*.js.map
```
---
##### Remember to update the theme.liquid file adding this code before ending </head> tag

```html
<link rel="stylesheet" href="{{ 'style.css' | asset_url }}">
```
---
## Run dev environment
```bash
 make watch dev
```
> this setup will compile the scss files into the style.css file and it will be copied to the assets folder

### Run dev environment alone

```bash
shopify theme dev --store=moebe-dk.myshopify.com
```

## Pull content from Theme

To pull the content changes from the Shopify store:

```bash
shopify theme pull
```

## Authors

- [@padronpedro] (https://www.github.com/padronpedro)

## Codeowner

- [@padronpedro](https://www.github.com/padronpedro)
