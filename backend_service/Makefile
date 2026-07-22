PYTHON_VENV_VERSION := 3.14

YV_STANDARDS_MAKER := $(shell yv-standards maker-path 2>/dev/null || (echo "Installing yv-standards..." >&2 && pip install -q yv-standards >&2 && yv-standards maker-path 2>/dev/null))
ifeq ($(YV_STANDARDS_MAKER),)
$(warning yv-standards install failed — run: pip install yv-standards)
else
include $(YV_STANDARDS_MAKER)
endif

help:
	@make _help-default
	@echo "make run"
	@echo "    Run FastAPI app with uvicorn"
	@echo "make tunnel"
	@echo "    Free temporary public URL via Cloudflare quick tunnel"
	@echo "make run-public"
	@echo "    Run API + Cloudflare quick tunnel together"
	@echo "make test"
	@echo "    Run API integration tests"
	@echo "make migrate"
	@echo "    Apply pending database migrations"

run:
	uvicorn main:app --reload --host 0.0.0.0 --port 8000

tunnel:
	chmod +x cloudflare/run-tunnel.sh
	./cloudflare/run-tunnel.sh

run-public:
	chmod +x scripts/run-public.sh cloudflare/run-tunnel.sh
	./scripts/run-public.sh

test:
	@set -a && [ -f .envrc ] && . ./.envrc; set +a; pytest tests/ -v

migrate:
	../database/migrate.sh

venv: _venv-default
	uv pip install --index-url https://pypi.thewardro.be/simple -r requirements.txt --python .venv/bin/python

psql:
	psql "$(DATABASE_URL)"
