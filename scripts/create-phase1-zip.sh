#!/usr/bin/env bash
set -e
zip -r codcrm-phase1.zip . -x '.git/*' 'node_modules/*' '.next/*' 'codcrm-phase1.zip'
echo "Created codcrm-phase1.zip"
