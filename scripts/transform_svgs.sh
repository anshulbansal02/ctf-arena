svgsPath=src/assets/icons/svg
iconsOutPath=src/assets/icons/tsx

echo "Transforming SVGs to TSX Components"
rm -rf $iconsOutPath
bunx svgr --filename-case kebab --icon 1em --typescript --no-prettier --jsx-runtime automatic --svg-props role=img --index-template ./scripts/template.js --out-dir "$iconsOutPath" -- "$svgsPath"
mv "$iconsOutPath/index.ts" "$iconsOutPath/../index.ts" 