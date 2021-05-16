import path from 'path'
import { Preset, color } from '@preset/core'

Preset.setName('Preset')
Preset.option('install', true)

// Asks for the preset name, defaulting to a name based on
// the current Git configuration
Preset.input('presetName', 'What is the name of the preset?', ({ targetDirectory }) => path.basename(targetDirectory))

// Extracts the templates
Preset.extract()

// A kebab-case converter, could be better but hopefully enough
const kebabCase = (str: string) =>
	str
		.match(/[A-Z]{2,}(?=[A-Z][a-z0-9]*|\b)|[A-Z]?[a-z0-9]*|[A-Z]|[0-9]+/g)
		.filter(Boolean)
		.map(x => x.toLowerCase())
		.join('-')

// Replaces the variables
Preset.edit('**/**')
	.replaceVariables(({ prompts, git }) => ({
		presetName: prompts.presetName.replace(/'/, '\\\''),
		kebabPresetName: kebabCase(prompts.presetName.replace(/'/, '\\\'')),
		author: <string>git.config['user.name'] ?? '',
	}))
	.withTitle('Configuring preset...')

// Installs the dependencies
Preset.installDependencies().ifHasOption('install')

// Creates the repository
Preset.group((preset) => {
	preset.execute('git', 'init')
	preset.execute('git', 'add', '.')
	preset.execute('git', 'commit', '-m', '"chore: initialize repository"')
})
	.withTitle('Initializing repository...')
	.ifNotRepository()

// Instruct
Preset.instruct([
	`Start editing ${color.magenta('preset.ts')}`,
	`Put your templates in ${color.magenta('templates/')}`,
	`Learn more at ${color.magenta('https://preset.dev')}`,
]).withHeading('What\'s next?')
