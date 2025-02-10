import globals from 'globals'
import pluginJs from '@eslint/js'
import eslintPluginPrettierRecommanded from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  eslintPluginPrettierRecommanded,
]
