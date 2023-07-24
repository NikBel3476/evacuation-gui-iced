import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import cypress from 'eslint-plugin-cypress';

export default [
	{
		files: ['**/*.{js,jsx,ts,tsx}']
	},
	{
		ignores: [
			'dist/',
			'**/target/',
			'*.bs.js',
			'*.gen.ts*',
			'src-ui/peopleTraffic/js/vendor',
			'coverage/',
			'eslint.config.js',
			'vite.config.ts',
			'cypress.config.ts',
			'postcss.config.cjs',
			'tailwind.config.cjs'
		]
	},
	reactJsxRuntime,
	// TODO: append `reactHooksRecommended`
	// TODO: append `standardWithTypescript`
	{
		languageOptions: {
			ecmaVersion: 'latest',
			parserOptions: {
				ecmaFeatures: {
					jsx: true
				}
			}
		},
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			'no-tabs': [
				'error',
				{
					allowIndentationTabs: true
				}
			],
			'no-console': 'error'
		}
	},
	{
		...reactRecommended,
		settings: {
			react: {
				version: 'detect'
			}
		},
		rules: {
			'react/jsx-uses-react': 'error'
		}
	},
	{
		plugins: {
			'@typescript-eslint': typescriptEslint
		},
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
				project: 'tsconfig.json'
			}
		},
		rules: {
			'@typescript-eslint/semi': ['error', 'always'],
			'@typescript-eslint/member-delimiter-style': ['error', {}],
			'@typescript-eslint/space-before-function-paren': 'off',
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{
					allowNullableObject: true
				}
			],
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'no-type-imports'
				}
			],
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowFunctionsWithoutTypeParameters: true
				}
			],
			'@typescript-eslint/no-confusing-void-expression': [
				'error',
				{
					ignoreArrowShorthand: true
				}
			]
		}
	},
	{
		plugins: {
			prettier
		},
		rules: {
			'prettier/prettier': [
				'error',
				{
					endOfLine: 'auto'
				}
			]
		}
	},
	{
		files: ['cypress/**/*.{js,ts}'],
		plugins: {
			cypress
		},
		languageOptions: {
			parserOptions: {
				project: 'cypress/tsconfig.json'
			}
		},
		rules: {
			'cypress/no-assigning-return-values': 'error',
			'cypress/no-unnecessary-waiting': 'error',
			'cypress/no-async-tests': 'error',
			'cypress/unsafe-to-chain-command': 'error'
		}
	}
];
