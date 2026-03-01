"""
Tests for generate_site.py
"""
import os
import shutil
import textwrap

import pytest

from generate_site import generate_site, load_config, get_theme


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

VALID_CONFIG = {
    "name": "Test Site",
    "bio": "A test bio",
    "meta": {
        "lang": "en",
        "description": "Test description",
        "title": "Test Title",
        "author": "Tester",
        "siteUrl": "https://example.com",
    },
    "links": [
        {"name": "Link 1", "url": "https://example.com/1"},
        {"name": "Link 2", "url": "https://example.com/2"},
    ],
    "theme": "custom",
}


@pytest.fixture()
def valid_config_file(tmp_path):
    """Write a valid config.yml to a temp directory and return its path."""
    import yaml

    config_path = tmp_path / "config.yml"
    config_path.write_text(yaml.dump(VALID_CONFIG))
    return str(config_path)


@pytest.fixture()
def minimal_theme_dir(tmp_path):
    """
    Create a minimal theme directory structure inside tmp_path/themes/custom
    so generate_site can be called without relying on the real themes folder.
    """
    theme_dir = tmp_path / "themes" / "custom"
    theme_dir.mkdir(parents=True)
    template = theme_dir / "index.html"
    template.write_text(
        "<html><body><h1>{{ config.name }}</h1>"
        "{% for link in config.links %}<a href='{{ link.url }}'>{{ link.name }}</a>{% endfor %}"
        "</body></html>"
    )
    assets = theme_dir / "assets" / "css"
    assets.mkdir(parents=True)
    (assets / "styles.css").write_text("body {}")
    return tmp_path


# ---------------------------------------------------------------------------
# load_config tests
# ---------------------------------------------------------------------------


class TestLoadConfig:
    def test_valid_config(self, valid_config_file):
        config = load_config(valid_config_file)
        assert config["name"] == "Test Site"
        assert len(config["links"]) == 2

    def test_missing_file_exits(self, tmp_path):
        with pytest.raises(SystemExit):
            load_config(str(tmp_path / "nonexistent.yml"))

    def test_invalid_yaml_exits(self, tmp_path):
        bad = tmp_path / "bad.yml"
        bad.write_text("key: [unclosed")
        with pytest.raises(SystemExit):
            load_config(str(bad))

    def test_non_mapping_yaml_exits(self, tmp_path):
        bad = tmp_path / "bad.yml"
        bad.write_text("- just\n- a\n- list\n")
        with pytest.raises(SystemExit):
            load_config(str(bad))

    def test_missing_top_level_key_exits(self, tmp_path):
        import yaml

        incomplete = dict(VALID_CONFIG)
        del incomplete["links"]
        path = tmp_path / "config.yml"
        path.write_text(yaml.dump(incomplete))
        with pytest.raises(SystemExit):
            load_config(str(path))

    def test_missing_meta_key_exits(self, tmp_path):
        import yaml

        incomplete = {**VALID_CONFIG, "meta": {"lang": "en"}}
        path = tmp_path / "config.yml"
        path.write_text(yaml.dump(incomplete))
        with pytest.raises(SystemExit):
            load_config(str(path))

    def test_empty_links_exits(self, tmp_path):
        import yaml

        bad = {**VALID_CONFIG, "links": []}
        path = tmp_path / "config.yml"
        path.write_text(yaml.dump(bad))
        with pytest.raises(SystemExit):
            load_config(str(path))


# ---------------------------------------------------------------------------
# get_theme tests
# ---------------------------------------------------------------------------


class TestGetTheme:
    def test_returns_config_theme_when_no_override(self, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        theme = get_theme(VALID_CONFIG, theme_override=None)
        assert theme == "custom"

    def test_override_takes_precedence(self, tmp_path, monkeypatch):
        (tmp_path / "themes" / "minimal").mkdir(parents=True)
        monkeypatch.chdir(tmp_path)
        theme = get_theme(VALID_CONFIG, theme_override="minimal")
        assert theme == "minimal"

    def test_missing_theme_exits(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        with pytest.raises(SystemExit):
            get_theme(VALID_CONFIG, theme_override=None)


# ---------------------------------------------------------------------------
# generate_site integration tests
# ---------------------------------------------------------------------------


class TestGenerateSite:
    def test_generates_index_html(self, valid_config_file, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "output")
        generate_site(valid_config_file, theme_override=None, output_dir=output_dir)
        assert os.path.isfile(os.path.join(output_dir, "index.html"))

    def test_output_contains_site_name(self, valid_config_file, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "output")
        generate_site(valid_config_file, theme_override=None, output_dir=output_dir)
        content = open(os.path.join(output_dir, "index.html")).read()
        assert "Test Site" in content

    def test_output_contains_all_links(self, valid_config_file, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "output")
        generate_site(valid_config_file, theme_override=None, output_dir=output_dir)
        content = open(os.path.join(output_dir, "index.html")).read()
        assert "Link 1" in content
        assert "Link 2" in content

    def test_assets_are_copied(self, valid_config_file, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "output")
        generate_site(valid_config_file, theme_override=None, output_dir=output_dir)
        assert os.path.isdir(os.path.join(output_dir, "assets"))

    def test_theme_override_is_applied(self, valid_config_file, minimal_theme_dir, monkeypatch):
        # Create a second theme inside the same tmp root
        alt_theme = minimal_theme_dir / "themes" / "alt"
        alt_theme.mkdir(parents=True)
        (alt_theme / "index.html").write_text("<html><body>ALT {{ config.name }}</body></html>")
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "output")
        generate_site(valid_config_file, theme_override="alt", output_dir=output_dir)
        content = open(os.path.join(output_dir, "index.html")).read()
        assert "ALT" in content

    def test_missing_template_exits(self, valid_config_file, minimal_theme_dir, monkeypatch):
        broken_theme = minimal_theme_dir / "themes" / "broken"
        broken_theme.mkdir(parents=True)
        monkeypatch.chdir(minimal_theme_dir)
        with pytest.raises(SystemExit):
            generate_site(valid_config_file, theme_override="broken", output_dir=str(minimal_theme_dir / "output"))

    def test_creates_output_dir_if_missing(self, valid_config_file, minimal_theme_dir, monkeypatch):
        monkeypatch.chdir(minimal_theme_dir)
        output_dir = str(minimal_theme_dir / "new_output_dir")
        assert not os.path.exists(output_dir)
        generate_site(valid_config_file, theme_override=None, output_dir=output_dir)
        assert os.path.isdir(output_dir)
