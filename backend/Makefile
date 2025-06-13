# Main Makefile - Includes environment-specific files

# Default target (runs dev config by default)
.DEFAULT_GOAL := help

# Include environment-specific files
include dev.make

# Common variables (shared across all environments)
 

# Help (lists available commands)
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  dev-setup     Install dev dependencies"
	@echo "  dev-run       Run dev server"
	@echo ""
	@echo "Production:"
	@echo "  prod-build    Build production image"
	@echo "  prod-deploy   Deploy to production"
	@echo ""
	@echo "Common:"
	@echo "  clean         Remove temporary files"