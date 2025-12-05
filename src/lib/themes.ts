interface Theme {
    value: string;
    label: string;
}

const themes: Theme[] = [
		{ value: 'github-light', label: 'GitHub Light' },
		{ value: 'min-light', label: 'Min Light' },
		{ value: 'slack-ochin', label: 'Slack Ochin' },
		{ value: 'vitesse-light', label: 'Vitesse Light' },
		{ value: 'catppuccin-latte', label: 'Catppuccin Latte' },
		{ value: 'rose-pine-dawn', label: 'Rose Pine Dawn' }
	];

export { themes };
