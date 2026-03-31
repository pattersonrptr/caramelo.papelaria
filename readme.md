# Caramelo Papelaria — Link Page Generator

A simple static site generator that builds a **personal link page** (similar to Linktree) from a YAML configuration file and Jinja2 HTML themes.

The generated site is a single `index.html` file with a list of clickable links, an avatar, a short bio, and automatic light/dark theme support — ready to be hosted for free on **GitHub Pages**.

---

## Demo

Live page: [https://caramelo-papelaria.github.io/](https://caramelo-papelaria.github.io/)

---

## How it works

```
config.yml          ← your data (name, bio, links, theme)
    │
    ▼
generate_site.py    ← reads config + renders Jinja2 template
    │
    ▼
docs/               ← generated site (index.html + assets)
```

1. Edit `config.yml` with your information and links.
2. Run `python generate_site.py`.
3. The ready-to-deploy site is written to `docs/`.

---

## Requirements

- Python 3.10+

---

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/caramelo-papelaria/caramelo-papelaria.github.io.git
cd caramelo-papelaria.github.io

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux / macOS
# .venv\Scripts\activate         # Windows

# 3. Install dependencies
pip install -r requirements.txt
```

---

## Configuration

All site content is controlled by `config.yml`:

```yaml
name: "Caramelo Papelaria"
bio: "A papelaria mais doce que existe"

meta:
  lang: "pt_br"
  description: "A papelaria mais doce que existe"
  title: "Caramelo Papelaria"
  author: "Patterson"
  siteUrl: "https://caramelo-papelaria.github.io/"

links:
  - name: "Shopee"
    url: "https://shopee.com.br/pattriziaol"
  - name: "Instagram"
    url: "https://www.instagram.com/caramelo.papelaria/"
  - name: "Threads"
    url: "https://www.threads.com/@caramelo.papelaria"

theme: "custom"
```

| Field | Description |
|---|---|
| `name` | Display name shown as the page title |
| `bio` | Short description below the name |
| `meta.lang` | HTML language attribute (e.g. `pt_br`, `en`) |
| `meta.description` | Meta description for SEO |
| `meta.title` | Browser tab title |
| `meta.author` | Author name (shown in footer) |
| `meta.siteUrl` | Canonical URL of the published site |
| `links` | List of `name` + `url` pairs |
| `theme` | Theme folder name inside `themes/` |

---

## Generating the site

```bash
# Use defaults (config.yml, theme from config, output to docs/)
python generate_site.py

# Custom config file
python generate_site.py --config my_config.yml

# Override theme
python generate_site.py --theme minimal

# Custom output directory
python generate_site.py --output public

# All options together
python generate_site.py --config config.yml --theme minimal --output public
```

### CLI reference

| Argument | Default | Description |
|---|---|---|
| `--config` | `config.yml` | Path to the YAML configuration file |
| `--theme` | *(from config)* | Theme name; overrides the value in config |
| `--output` | `docs` | Output directory for the generated site |

---

## Themes

Themes live in the `themes/` directory. Each theme is a self-contained folder:

```
themes/
├── custom/              ← default theme (card-based, colorful, light/dark mode)
├── minimal/             ← clean typography theme (light/dark mode)
├── sweet/               ← pastel aesthetic with animated background
├── dia_das_mulheres/    ← 8 de Março: falling petals, purple/rose/gold palette
└── pascoa/              ← Páscoa: floating eggs & bunnies, full pastel palette
```

Each theme folder follows the same structure:

```
themes/<name>/
├── index.html
└── assets/
    ├── css/styles.css
    ├── js/script.js
    └── img/
```

### Available themes

| Theme | Style | Best for |
|---|---|---|
| `custom` | Card-based, colorful, light/dark auto | Year-round default |
| `minimal` | Clean typography, light/dark auto | Minimalist look |
| `sweet` | Pastel, glassmorphism, animated background | Year-round cute |
| `dia_das_mulheres` | Purple/rose/gold, falling petals | March 8th |
| `pascoa` | Pastel eggs & bunnies, animated | Easter season |

### Creating a custom theme

1. Copy an existing theme folder: `cp -r themes/custom themes/my_theme`
2. Edit `themes/my_theme/index.html` and `assets/css/styles.css` as desired.
3. Reference it in `config.yml`: `theme: "my_theme"` or pass `--theme my_theme`.

The template has access to the entire `config` object:

| Variable | Example value |
|---|---|
| `{{ config.name }}` | `Caramelo Papelaria` |
| `{{ config.bio }}` | `A papelaria mais doce que existe` |
| `{{ config.meta.title }}` | `Caramelo Papelaria` |
| `{{ config.meta.author }}` | `Patterson` |
| `{% for link in config.links %}` | iterates over each link |
| `{{ link.name }}` | `Shopee` |
| `{{ link.url }}` | `https://shopee.com.br/…` |

---

## Adding a profile picture

Place your image at:

```
themes/<your_theme>/assets/img/picture.jpg
```

It will be copied to `docs/assets/img/picture.jpg` automatically when the site is generated.

---

## Running the tests

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=generate_site --cov-report=term-missing
```

---

## Publishing to GitHub Pages

Use the `deploy.sh` script to generate the site and publish in one command:

```bash
# Deploy with the theme set in config.yml
bash deploy.sh

# Deploy a specific theme (overrides config.yml)
bash deploy.sh sweet
bash deploy.sh dia_das_mulheres
bash deploy.sh pascoa
```

The script will:
1. Generate the site with the chosen theme into `docs/`
2. Commit `docs/` automatically
3. Push to the current branch

> **First-time setup:** In the repository settings → **Pages**, set the source to the `docs/` folder on the `main` branch.

---

## Migrating to the GitHub Organization (caramelo-papelaria)

To publish at the clean URL `https://caramelo-papelaria.github.io/`, follow these steps **once**:

1. **Create the organization** at [github.com/organizations/new](https://github.com/organizations/new)
   - Name: `caramelo-papelaria`
   - Choose the free plan.

2. **Create the repository** inside the org named exactly `caramelo-papelaria.github.io`.

3. **Push this code** to the new repo:
   ```bash
   git remote set-url origin https://github.com/caramelo-papelaria/caramelo-papelaria.github.io.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:** go to the new repo → Settings → Pages → Source: `main` branch, folder `/docs`. Save.

5. In a few minutes the site will be live at **`https://caramelo-papelaria.github.io/`**.

### How to deploy after changing a theme

Every time you want to update the theme or any content, just run from inside the repo folder:

```bash
bash deploy.sh              # uses the theme set in config.yml
bash deploy.sh sweet        # or pass a specific theme name
```

That's it. The script generates the site, commits `docs/`, and pushes. GitHub Pages detects the push and updates the live site automatically within ~30 seconds.

---

## Project structure

```
caramelo.papelaria/
├── config.yml              # Site configuration
├── generate_site.py        # Site generator script
├── deploy.sh               # One-command deploy script
├── pyproject.toml          # Project metadata and tool settings
├── requirements.txt        # Pinned dependencies
├── readme.md
├── docs/                   # Generated site output (for GitHub Pages)
├── themes/
│   ├── custom/             # Default theme
│   ├── minimal/            # Minimal typography theme
│   ├── sweet/              # Pastel aesthetic theme
│   ├── dia_das_mulheres/   # March 8th seasonal theme
│   └── pascoa/             # Easter seasonal theme
└── tests/
    └── test_generate_site.py
```

---

## License

MIT
