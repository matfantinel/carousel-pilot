import fs from 'fs';
import path from 'path';

export function load() {
	const introPath = path.resolve('src/routes/md/intro.md');
	const contentPath = path.resolve('src/routes/md/content.md');
	const intro = fs.readFileSync(introPath, 'utf-8');
	const content = fs.readFileSync(contentPath, 'utf-8');

	return { intro, content };
}
