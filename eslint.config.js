import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactJsxRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import prettier from 'eslint-plugin-prettier';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import cypress from 'eslint-plugin-cypress';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
	{
		files: ['**/*.{js,jsx,ts,tsx}']
	},
	{
		ignores: [
			'dist/',
			'**/target/',
			'**/*.bs.js',
			'**/*.gen.ts*',
			'src-ui/peopleTraffic/js/vendor',
			'coverage/',
			'test/',
			'eslint.config.js',
			'vite.config.ts',
			'cypress.config.ts',
			'postcss.config.cjs',
			'tailwind.config.cjs'
		]
	},
	reactJsxRuntime,
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
			'react-hooks': reactHooks
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'error'
		}
	},
	{
		files: ['**/*.{ts,tsx}'],
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
			],
			// @typescript-eslint/eslint-recommended
			'constructor-super': 'off',
			'getter-return': 'off',
			'no-const-assign': 'off',
			'no-dupe-args': 'off',
			'no-dupe-class-members': 'off',
			'no-dupe-keys': 'off',
			'no-func-assign': 'off',
			'no-import-assign': 'off',
			'no-new-symbol': 'off',
			'no-obj-calls': 'off',
			'no-redeclare': 'off',
			'no-setter-return': 'off',
			'no-this-before-super': 'off',
			'no-undef': 'off',
			'no-unreachable': 'off',
			'no-unsafe-negation': 'off',
			'no-var': 'error',
			'prefer-const': 'error',
			'prefer-rest-params': 'error',
			'prefer-spread': 'error', // ts transpiles spread to apply, so no need for manual apply
			// @typescript-eslint/strict-type-checked
			'@typescript-eslint/await-thenable': 'error',
			'@typescript-eslint/ban-ts-comment': 'error',
			'@typescript-eslint/ban-types': 'error',
			'no-array-constructor': 'off',
			'@typescript-eslint/no-array-constructor': 'error',
			'@typescript-eslint/no-base-to-string': 'error',
			'@typescript-eslint/no-duplicate-enum-values': 'error',
			'@typescript-eslint/no-duplicate-type-constituents': 'error',
			'@typescript-eslint/no-dynamic-delete': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-extra-non-null-assertion': 'error',
			'@typescript-eslint/no-extraneous-class': 'error',
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-for-in-array': 'error',
			'no-implied-eval': 'off',
			'@typescript-eslint/no-implied-eval': 'error',
			'@typescript-eslint/no-invalid-void-type': 'error',
			'no-loss-of-precision': 'off',
			'@typescript-eslint/no-loss-of-precision': 'error',
			'@typescript-eslint/no-meaningless-void-operator': 'error',
			'@typescript-eslint/no-misused-new': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/no-mixed-enums': 'error',
			'@typescript-eslint/no-namespace': 'error',
			'@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-redundant-type-constituents': 'error',
			'@typescript-eslint/no-this-alias': 'error',
			'no-throw-literal': 'off',
			'@typescript-eslint/no-throw-literal': 'error',
			'@typescript-eslint/no-unnecessary-boolean-literal-compare': 'error',
			'@typescript-eslint/no-unnecessary-condition': 'error',
			'@typescript-eslint/no-unnecessary-type-arguments': 'error',
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-unnecessary-type-constraint': 'error',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-declaration-merging': 'error',
			'@typescript-eslint/no-unsafe-enum-comparison': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'error',
			'no-useless-constructor': 'off',
			'@typescript-eslint/no-useless-constructor': 'error',
			'@typescript-eslint/no-var-requires': 'error',
			'@typescript-eslint/prefer-as-const': 'error',
			'@typescript-eslint/prefer-includes': 'error',
			'@typescript-eslint/prefer-literal-enum-member': 'error',
			'@typescript-eslint/prefer-reduce-type-parameter': 'error',
			'@typescript-eslint/prefer-return-this-type': 'error',
			'@typescript-eslint/prefer-ts-expect-error': 'error',
			'require-await': 'off',
			'@typescript-eslint/require-await': 'error',
			'@typescript-eslint/restrict-plus-operands': 'error',
			'@typescript-eslint/restrict-template-expressions': 'error',
			'@typescript-eslint/triple-slash-reference': 'error',
			'@typescript-eslint/unbound-method': 'error',
			'@typescript-eslint/unified-signatures': 'error',
			// @typescript-eslint/stylistic-type-checked
			'@typescript-eslint/adjacent-overload-signatures': 'error',
			'@typescript-eslint/array-type': 'error',
			'@typescript-eslint/ban-tslint-comment': 'error',
			'@typescript-eslint/class-literal-property-style': 'error',
			'@typescript-eslint/consistent-generic-constructors': 'error',
			'@typescript-eslint/consistent-indexed-object-style': 'error',
			'@typescript-eslint/consistent-type-assertions': 'error',
			'@typescript-eslint/consistent-type-definitions': 'error',
			'dot-notation': 'off',
			'@typescript-eslint/dot-notation': 'error',
			'@typescript-eslint/no-confusing-non-null-assertion': 'error',
			'no-empty-function': 'off',
			'@typescript-eslint/no-empty-function': 'error',
			'@typescript-eslint/no-empty-interface': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			'@typescript-eslint/non-nullable-type-assertion-style': 'error',
			'@typescript-eslint/prefer-for-of': 'error',
			'@typescript-eslint/prefer-function-type': 'error',
			'@typescript-eslint/prefer-namespace-keyword': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': 'error',
			'@typescript-eslint/prefer-optional-chain': 'error',
			'@typescript-eslint/prefer-string-starts-ends-with': 'error'
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
