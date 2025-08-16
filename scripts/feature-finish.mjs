#!/usr/bin/env node
import { execSync } from 'node:child_process';

function run(cmd, opts = {}) {
	return execSync(cmd, { stdio: 'inherit', encoding: 'utf8', ...opts });
}

function runCapture(cmd) {
	return execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim();
}

function inferTypeAndParts(branchName) {
	const typeMatch = branchName.match(/^(feat|fix|docs|refactor|perf|test|build|chore)\/(.+)$/);
	let type = 'feat';
	let rest = branchName;
	if (typeMatch) {
		type = typeMatch[1];
		rest = typeMatch[2];
	} else if (branchName.startsWith('feature/')) {
		rest = branchName.replace(/^feature\//, '');
	}

	// scope and subject from rest
	let scope = 'app';
	let subjectSlug = rest;
	const parts = rest.split('/');
	if (parts.length > 1) {
		scope = parts[0];
		subjectSlug = parts.slice(1).join('-');
	} else {
		const hyphen = rest.indexOf('-');
		if (hyphen > 0) {
			scope = rest.slice(0, hyphen);
			subjectSlug = rest.slice(hyphen + 1);
		}
	}
	const subject = subjectSlug.replace(/[_-]+/g, ' ').trim().replace(/\s+/g, ' ');
	return { type, scope, subject };
}

function ensureCleanWorkingTree() {
	const status = runCapture('git status --porcelain');
	if (!status) {
		console.log('No changes to commit. Exiting.');
		process.exit(0);
	}
}

function main() {
	const branch = runCapture('git rev-parse --abbrev-ref HEAD');
	if (branch === 'HEAD') {
		console.error('Detached HEAD is not supported. Checkout a branch and try again.');
		process.exit(1);
	}
	if (branch === 'main' || branch === 'master') {
		console.error(`You are on ${branch}. Switch to a feature branch (e.g., feat/..., feature/...) before finishing.`);
		process.exit(1);
	}
	const isFeatureLike = /^(feat|fix|docs|refactor|perf|test|build|chore)\//.test(branch) || branch.startsWith('feature/');
	if (!isFeatureLike) {
		console.warn(`Branch '${branch}' does not look like a feature branch. Proceeding anyway...`);
	}

	// Fast checks: unit/integration, lint, build
	console.log('Running fast checks (tests, lint, build)...');
	run('SKIP_DB_TESTS=1 npm run test:precommit');

	ensureCleanWorkingTree();
	run('git add -A');

	const { type, scope, subject } = inferTypeAndParts(branch);
	const header = `${type}(${scope}): ${subject || 'finish feature'}`;
	const body = `\nBranch: ${branch}\nAutomated commit via feature:finish.`;
	const message = `${header}\n\n${body}`;

	console.log(`Committing with message: ${header}`);
	run(`git commit -m ${JSON.stringify(message)}`);

	console.log('Pushing to origin...');
	try {
		run('git push -u origin HEAD');
	} catch (err) {
		console.error('Push failed. You may need to set up the remote or resolve auth.');
		process.exit(1);
	}

	console.log('Feature finish complete.');
}

try {
	main();
} catch (err) {
	console.error(err?.message || String(err));
	process.exit(1);
}


